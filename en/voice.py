"""Generate the EN voice-over paragraph by paragraph with ElevenLabs v4.

  py -3.12 en/voice.py            # all missing paragraphs
  py -3.12 en/voice.py --only 12  # regenerate one paragraph (index from manifest)

Each paragraph becomes en/voice/NNN_SPEAKER_<hash>.mp3; a changed paragraph gets a new hash and is regenerated,
untouched ones are reused. en/voice/manifest.json lists every beat with its section, speaker, text and duration.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "voice"
MODEL = "eleven_v4"


def load_env() -> None:
    """KEY=value lines of the repo's .env (never committed, see .env.example) into os.environ, unless already set."""
    env = HERE.parent / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                name, val = line.split("=", 1)
                os.environ.setdefault(name.strip(), val.strip().strip('"'))


load_env()  # before VOICES reads NARRATOR_VOICE_ID

# Character voices are public ElevenLabs stock voices. The narrator is yours: put your own voice (a clone, or any
# voice from your library) in NARRATOR_VOICE_ID. Without it the engine falls back to the stock voice "Brian".
VOICES = {
    "NARRATOR": os.environ.get("NARRATOR_VOICE_ID") or "nPczCjzI2devNBz1zQrb",  # Brian (stock) as the fallback
    "KAISER": "N2lVS1w4EtoT3dr4eOWO",    # Callum + [strong German accent]
    "MOLTKE": "2EiwWnXFnvU5JabPnv8n",    # Clyde + [strong German accent]
    "GEORGE": "onwK4e9ZLuTAKqWW03F9",    # Daniel
    "FORD": "CwhRBWXzGAHq8TQ4Fs17",      # Roger
    "WILSON": "iP95p4xoKVk53GoZ742B",    # Chris
}
SEED = 4242


def key() -> str:
    k = os.environ.get("ELEVENLABS_API_KEY")
    if not k:
        sys.exit("ELEVENLABS_API_KEY is not set (environment or .env, see .env.example)")
    return k


def parse(path: Path) -> list[dict]:
    s = re.sub(r"<!--.*?-->", "", path.read_text(encoding="utf-8"), flags=re.S)
    beats, sec = [], ""
    for para in [p.strip() for p in s.split("\n\n") if p.strip()]:
        if para.startswith("## "):
            sec = para[3:].strip()
            continue
        m = re.match(r"([A-Z]+):\s*(.*)", para, re.S)
        if m:
            text = re.sub(r"\s+", " ", m.group(2)).strip()
            beats.append({"section": sec, "speaker": m.group(1), "text": text,
                          "plain": re.sub(r"\s+", " ", re.sub(r"\[[^\]]+\]", "", text)).strip()})
    return beats


def tts(k: str, voice: str, text: str, prev: str, nxt: str, dst: Path) -> None:
    body = json.dumps({"text": text, "model_id": MODEL, "language_code": "en", "seed": SEED,
                       "previous_text": prev, "next_text": nxt}).encode()
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_192"
    for attempt in range(5):
        req = urllib.request.Request(url, data=body, method="POST",
                                     headers={"xi-api-key": k, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                dst.write_bytes(r.read())
                return
        except urllib.error.HTTPError as e:
            msg = e.read()[:300].decode("utf-8", "replace")
            if e.code in (429, 500, 502, 503) and attempt < 4:
                time.sleep(5 * (attempt + 1))
                continue
            raise SystemExit(f"TTS {e.code} for {dst.name}: {msg}")


def duration(p: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", default=str(HERE / "script.md"))
    ap.add_argument("--only", type=int, action="append", default=[])
    ap.add_argument("--jobs", type=int, default=3)
    a = ap.parse_args()
    OUT.mkdir(exist_ok=True)
    k = key()
    beats = parse(Path(a.script))
    jobs = []
    for i, b in enumerate(beats):
        h = hashlib.sha1(f"{MODEL}|{VOICES[b['speaker']]}|{SEED}|{b['text']}".encode()).hexdigest()[:8]
        b["file"] = f"{i:03d}_{b['speaker']}_{h}.mp3"
        dst = OUT / b["file"]
        # context only from the same speaker's neighbours keeps the narrator's flow across a quote
        prev = beats[i - 1]["plain"] if i and beats[i - 1]["speaker"] == b["speaker"] else ""
        nxt = beats[i + 1]["plain"] if i + 1 < len(beats) and beats[i + 1]["speaker"] == b["speaker"] else ""
        if i in a.only and dst.exists():
            dst.unlink()
        if not dst.exists() and i not in a.only:
            # a paragraph inserted above shifts the index: reuse the same text's take under its new number
            old = [p for p in OUT.glob(f"[0-9][0-9][0-9]_{b['speaker']}_{h}.mp3") if p != dst]
            if old:
                old[0].rename(dst)
        if not dst.exists():
            jobs.append((i, b, prev, nxt, dst))
    print(f"{len(beats)} beats, {len(jobs)} to generate, {sum(len(j[1]['text']) for j in jobs)} chars", flush=True)

    def run(j):
        i, b, prev, nxt, dst = j
        tts(k, VOICES[b["speaker"]], b["text"], prev, nxt, dst)
        print(f"  {dst.name}  {duration(dst):.1f}s", flush=True)

    with ThreadPoolExecutor(max_workers=a.jobs) as ex:
        list(ex.map(run, jobs))
    for b in beats:
        b["dur"] = round(duration(OUT / b["file"]), 3)
    # drop stale takes of edited paragraphs
    keep = {b["file"] for b in beats}
    for f in OUT.glob("*.mp3"):
        if f.name not in keep:
            f.unlink()
    (OUT / "manifest.json").write_text(json.dumps(beats, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"total voice {sum(b['dur'] for b in beats) / 60:.1f} min", flush=True)


if __name__ == "__main__":
    main()
