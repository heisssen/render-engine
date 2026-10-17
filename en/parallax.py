"""2.5D parallax move on a REAL archival photo / period painting (depth estimation + camera motion only).

    %DEPTHFLOW_PYTHON% en\\parallax.py IMAGE [options]

(DEPTHFLOW_PYTHON = the python.exe of a separate venv with DepthFlow installed; it is too heavy for the main one.)

Writes public/parallax/<name>.mp4 (H.264 1920x1080 30 fps yuv420p, no audio) + <name>.json sidecar.
Nothing is generated or invented: DepthFlow (BrokenSource) only displaces the pixels of the source image
by an estimated depth map (Depth-Anything-V2 small, CPU).  Edges that would reveal unseen pixels are avoided by
keeping the camera inside the picture (base zoom) and low default intensity.

Options
  --name NAME        output name (default: image stem)
  --duration SEC     default 7
  --preset P         dolly | orbit | zoomout | pan   (default dolly)
  --intensity X      0.3..1.5, default 1.0 (1.0 = subtle documentary)
  --focus fx,fy      0..1 crop centre when the picture is not 16:9 (default 0.5,0.5)
  --focus-depth D    0..1 depth that stays still (default 0.35; raise it to anchor a face/foreground)
  --max-width W      downscale source before depth (default 1920)
  --out-dir DIR      default public/parallax
  --keep-depth       also write <name>_depth.png next to the mp4 (for checking)
"""
import os, sys, json, time, math, argparse, subprocess
from pathlib import Path

os.environ.setdefault("PYTHONUTF8", "1")
os.environ.setdefault("WINDOW_BACKEND", "headless")
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "-1")  # depth model on CPU (small laptop GPUs are unsupported); GL stays on the GPU

# platform.uname() can hang in its WMI query on some Windows setups (python 3.12.x): skip WMI, use env fallbacks
import platform
def _no_wmi(*a, **k):
    raise OSError("wmi disabled")
platform._wmi_query = _no_wmi

ROOT = Path(__file__).resolve().parent.parent
W, H, FPS = 1920, 1080, 30


def smooth(t):
    return t * t * (3 - 2 * t)


def ease_io(t):  # gentle in/out, never fully stops so it reads as a camera move
    return 0.12 * t + 0.88 * smooth(t)


# preset -> function(tau, I) -> dict of DepthState fields
def p_dolly(t, I):
    s = ease_io(t)
    return dict(height=0.10 * I, steady=0.30, focus=0.35, isometric=0.55,
                zoom=1.0 - 0.10 * s, offset=(0.05 * I * (s - 0.5), 0.0))


def p_orbit(t, I):
    s = ease_io(t)
    return dict(height=0.10 * I, steady=0.30, focus=0.30, isometric=0.60,
                zoom=0.95, offset=(0.26 * I * (s - 0.5) * 2, 0.0))


def p_zoomout(t, I):
    s = ease_io(t)
    return dict(height=0.10 * I, steady=0.30, focus=0.35, isometric=0.55,
                zoom=0.90 + 0.09 * s, offset=(0.04 * I * (0.5 - s), 0.0))


def p_pan(t, I):  # mostly flat slide, very safe for faces/crowds
    s = ease_io(t)
    return dict(height=0.05 * I, steady=0.30, focus=0.30, isometric=0.8,
                zoom=0.94, offset=(0.18 * I * (s - 0.5) * 2, 0.0))


PRESETS = dict(dolly=p_dolly, orbit=p_orbit, zoomout=p_zoomout, pan=p_pan)


def prep_image(path, max_w, fx, fy):
    """cover-crop to 16:9 (Remotion Film uses objectFit: cover anyway), cap size."""
    from PIL import Image
    im = Image.open(path).convert("RGB")
    w, h = im.size
    tw = 16 / 9
    if w / h > tw:
        nw = round(h * tw); x0 = round((w - nw) * fx); im = im.crop((x0, 0, x0 + nw, h))
    else:
        nh = round(w / tw); y0 = round((h - nh) * fy); im = im.crop((0, y0, w, y0 + nh))
    if im.width > max_w:
        im = im.resize((max_w, round(max_w / tw)), Image.LANCZOS)
    elif im.width < W:  # small source: upscale to the render size (still only the real pixels)
        im = im.resize((W, H), Image.LANCZOS)
    return im


def main():
    """CLI.  A .json file instead of an image = batch (one process, imports paid once):
    [{"image": "...", "name": "...", "preset": "orbit", "duration": 7, "intensity": 1, "focus": "0.5,0.5"}, ...]"""
    if len(sys.argv) > 1 and sys.argv[1].lower().endswith(".json"):
        for j in json.loads(Path(sys.argv[1]).read_text(encoding="utf-8")):
            argv = [j["image"]]
            for k, v in j.items():
                if k != "image":
                    argv += ["--" + k.replace("_", "-"), str(v)]
            print("JOB", argv, file=sys.stderr, flush=True)
            try:
                job(argv)
            except Exception as e:  # keep going with the next picture
                import traceback; traceback.print_exc()
        return
    job(sys.argv[1:])


def job(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--name")
    ap.add_argument("--duration", type=float, default=7.0)
    ap.add_argument("--preset", default="dolly", choices=PRESETS)
    ap.add_argument("--intensity", type=float, default=1.0)
    ap.add_argument("--focus", default="0.5,0.5")
    ap.add_argument("--focus-depth", type=float, default=None)
    ap.add_argument("--max-width", type=int, default=1920)
    ap.add_argument("--out-dir", default=str(ROOT / "public" / "parallax"))
    ap.add_argument("--keep-depth", action="store_true")
    a = ap.parse_args(argv)

    src = Path(a.image)
    name = a.name or src.stem
    out_dir = Path(a.out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    fx, fy = (float(v) for v in a.focus.split(","))
    t0 = time.time()

    import numpy as np
    from depthflow.scene import DepthScene
    from depthflow.state import DepthState

    img = prep_image(src, a.max_width, fx, fy)
    arr = np.array(img)

    class Scene(DepthScene):
        pass

    scene = Scene(backend="headless")
    print("depth...", file=sys.stderr, flush=True)
    t_depth = time.time()
    depth = scene.estimator.estimate(arr)
    t_depth = time.time() - t_depth
    if a.keep_depth:
        from PIL import Image
        Image.fromarray((np.clip(depth, 0, 1) * 255).astype("uint8")).save(out_dir / f"{name}_depth.png")

    fn = PRESETS[a.preset]
    steady = a.focus_depth

    def update(self=scene):
        d = fn(self.tau, a.intensity)
        if steady is not None:
            d["steady"] = steady
        for k, v in d.items():
            setattr(self.state, k, v)

    scene.update = update
    scene.state = DepthState()
    scene.input(image=arr, depth=depth)
    scene.ffmpeg.h264(preset="fast", crf=17)

    print("render...", file=sys.stderr, flush=True)
    raw = out_dir / f"{name}.raw.mp4"
    t_r = time.time()
    scene.main(output=raw, time=a.duration, fps=FPS, width=W, height=H, ssaa=1.0)
    t_render = time.time() - t_r

    final = out_dir / f"{name}.mp4"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-vf", f"scale={W}:{H}:flags=lanczos,fps={FPS},format=yuv420p",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-movflags", "+faststart", "-an", str(final)], check=True)
    raw.unlink(missing_ok=True)

    frames = round(a.duration * FPS)
    meta = dict(name=name, source=str(src), preset=a.preset, intensity=a.intensity, duration=a.duration, fps=FPS,
                frames=frames, size=[W, H], focus=[fx, fy], focus_depth=steady, estimator="Depth-Anything-V2-small",
                seconds_depth=round(t_depth, 1), seconds_render=round(t_render, 1), seconds_total=round(time.time() - t0, 1),
                remotion_src=f"parallax/{name}")
    (out_dir / f"{name}.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
