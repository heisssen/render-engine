"""Re-encode every clip in public/clips to constant 30 fps, no B-frames, a keyframe every second: Remotion's frame
extraction then never hits "No frame found at position" and seeks faster. Originals go to out/backup/clips_orig.

  py -3.12 scripts/reencode_clips.py
"""
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLIPS = ROOT / "public" / "clips"
BACKUP = ROOT / "out" / "backup" / "clips_orig"


def has_bframes(p: Path) -> bool:
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=has_b_frames",
                        "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    return r.stdout.strip() not in ("0", "")


done = 0
for tmp in CLIPS.rglob("*.tmp.mp4"):
    tmp.unlink()
for p in sorted(CLIPS.rglob("*.mp4")):
    if not has_bframes(p):
        continue
    b = BACKUP / p.relative_to(CLIPS)
    b.parent.mkdir(parents=True, exist_ok=True)
    if not b.exists():
        shutil.copy2(p, b)
    tmp = p.with_suffix(".tmp.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(b), "-vf", "fps=30,format=yuv420p", "-c:v", "libx264",
                    "-crf", "18", "-preset", "fast", "-g", "30", "-bf", "0", "-an", "-movflags", "+faststart", str(tmp)],
                   check=True)
    tmp.replace(p)
    done += 1
    print(f"{done:3} {p.relative_to(CLIPS)}", flush=True)
print("RE-ENCODE DONE", done, flush=True)
