"""Bake the three relief layers (hypsometric tint, multiply shadows, screen highlights) into ONE plain RGBA
overlay, so the map draws a single normal-blend image per frame instead of three blended, blurred ones.

The stack over a country wash w is affine in w: out = w*K + B (per pixel). Normal alpha compositing gives
w*(1-a) + c*a, so a = 1-K (K averaged over channels) and c = B/a. Writes public/relief_baked.png.

  py -3.12 en/bake_relief.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
pub = ROOT / "public"


def rgba(name):
    a = np.asarray(Image.open(pub / f"relief_{name}.png").convert("RGBA"), dtype=np.float32) / 255
    return a[..., :3], a[..., 3:]


h, ha = rgba("hypso")
s, sa = rgba("shadow")
l, la = rgba("light")
ha, sa, la = ha * 0.9, sa * 0.95, la * 0.75  # the layer opacities used in Map.tsx

m = 1 - sa * (1 - s)  # multiply with alpha
k_l = la * l  # screen with alpha: x -> x*(1-k_l) + k_l
K = (1 - ha) * m * (1 - k_l)
B = h * ha * m * (1 - k_l) + k_l
k = (K * [0.3, 0.59, 0.11]).sum(-1, keepdims=True)
a = np.clip(1 - k, 0, 1)
c = np.clip(B / np.maximum(a, 1e-3), 0, 1)
out = np.concatenate([c, a], -1)
# WebP with alpha: a few MB instead of ~76 MB of PNG, so every render tab decodes it fast
Image.fromarray((out * 255 + 0.5).astype(np.uint8), "RGBA").save(pub / "relief_baked.webp", quality=90, alpha_quality=90, method=4)
print("relief_baked.webp", out.shape, "alpha", float(a.min()), float(a.max()))
