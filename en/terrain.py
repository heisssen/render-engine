"""Build the map relief from real elevation: AWS Terrain Tiles (Terrarium PNG, open data, Web Mercator) at zoom Z.
Because the tiles are already Web Mercator, the raster drops straight into our d3 geoMercator maps.

Outputs (public/):
  relief_shadow.png   white with alpha = how much a slope is in shadow  (drawn with multiply)
  relief_light.png    white with alpha = how much a slope faces the light (drawn with screen)
  relief_hypso.png    hypsometric tint: lowlands greenish, uplands ochre, mountains brown (alpha by height)
and src/en/geo/relief.json with the lon/lat box.

  py -3.12 en/terrain.py [--z 7]
"""
from __future__ import annotations

import argparse
import io
import json
import math
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CACHE = Path(os.environ.get("RE_CACHE") or ROOT / "out" / "cache") / "terrarium"  # downloaded elevation tiles
URL = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
LON0, LON1, LAT0, LAT1 = -12.0, 52.0, 24.0, 67.0


def tile_xy(lon, lat, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def tile_lon(x, z):
    return x / 2 ** z * 360 - 180


def tile_lat(y, z):
    n = math.pi - 2 * math.pi * y / 2 ** z
    return math.degrees(math.atan(math.sinh(n)))


def fetch(z, x, y):
    p = CACHE / f"{z}_{x}_{y}.png"
    if not p.exists():
        req = urllib.request.Request(URL.format(z=z, x=x, y=y), headers={"User-Agent": "render-engine-maps/1.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            p.write_bytes(r.read())
    im = np.asarray(Image.open(p).convert("RGB")).astype(np.float32)
    return im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256 - 32768  # metres


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--z", type=int, default=7)
    a = ap.parse_args()
    z = a.z
    CACHE.mkdir(parents=True, exist_ok=True)
    x0, y0 = tile_xy(LON0, LAT1, z)
    x1, y1 = tile_xy(LON1, LAT0, z)
    xs, ys = range(int(x0), int(x1) + 1), range(int(y0), int(y1) + 1)
    print(f"z{z}: {len(xs)} x {len(ys)} = {len(xs) * len(ys)} tiles", flush=True)
    with ThreadPoolExecutor(8) as ex:
        tiles = {(x, y): t for (x, y), t in zip([(x, y) for y in ys for x in xs], ex.map(lambda xy: fetch(z, *xy), [(x, y) for y in ys for x in xs]))}
    H, W = len(ys) * 256, len(xs) * 256
    dem = np.zeros((H, W), np.float32)
    for (x, y), t in tiles.items():
        dem[(y - ys[0]) * 256:(y - ys[0] + 1) * 256, (x - xs[0]) * 256:(x - xs[0] + 1) * 256] = t
    sea = dem <= 0
    land = np.maximum(dem, 0)

    # pixel size in metres varies with latitude in Mercator: scale the gradient row by row
    lat_rows = np.array([tile_lat(ys[0] + (r + 0.5) / 256, z) for r in range(H)], np.float32)
    px_m = 40075016.7 / (2 ** z * 256) * np.cos(np.radians(lat_rows))[:, None]
    exag = 2.4  # vertical exaggeration so the Vosges and the Carpathians read at map scale
    gy, gx = np.gradient(land * exag)
    gx /= px_m
    gy /= px_m
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(315), math.radians(42)
    shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    flat = math.sin(alt)
    dark = np.clip((flat - shade) / flat, 0, 1) ** 0.85  # 0 on flat ground, 1 in full shadow
    light = np.clip((shade - flat) / (1 - flat), 0, 1) ** 0.9
    dark[sea] = 0
    light[sea] = 0

    out = ROOT / "public"

    def save(alpha, rgb, name, gain):
        a8 = (np.clip(alpha * gain, 0, 1) * 255).astype(np.uint8)
        img = np.dstack([np.full_like(a8, rgb[0]), np.full_like(a8, rgb[1]), np.full_like(a8, rgb[2]), a8])
        Image.fromarray(img, "RGBA").save(out / name, optimize=True)

    save(dark, (40, 34, 26), "relief_shadow.png", 1.0)
    save(light, (255, 250, 236), "relief_light.png", 0.9)

    # hypsometric tint: lowlands faint green, hills ochre, mountains brown, alpha grows with height
    h = land
    stops = [(0, (124, 150, 96), 0.0), (200, (150, 160, 100), 0.10), (600, (186, 160, 104), 0.22),
             (1500, (150, 112, 74), 0.34), (3000, (120, 92, 70), 0.42)]
    rgb = np.zeros((H, W, 3), np.float32)
    al = np.zeros((H, W), np.float32)
    for (h0, c0, a0), (h1, c1, a1) in zip(stops, stops[1:]):
        m = (h >= h0) & (h < h1)
        t = ((h - h0) / (h1 - h0))[m][:, None]
        rgb[m] = np.array(c0) * (1 - t) + np.array(c1) * t
        al[m] = (a0 * (1 - t) + a1 * t)[:, 0]
    m = h >= stops[-1][0]
    rgb[m] = stops[-1][1]
    al[m] = stops[-1][2]
    al[sea] = 0
    Image.fromarray(np.dstack([rgb.astype(np.uint8), (al * 255).astype(np.uint8)]), "RGBA").save(out / "relief_hypso.png", optimize=True)

    box = {"lon0": tile_lon(xs[0], z), "lon1": tile_lon(xs[-1] + 1, z), "lat1": tile_lat(ys[0], z), "lat0": tile_lat(ys[-1] + 1, z), "w": W, "h": H}
    (ROOT / "src/en/geo/relief.json").write_text(json.dumps(box), encoding="utf-8")
    print("relief", W, "x", H, box, flush=True)


if __name__ == "__main__":
    main()
