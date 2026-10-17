"""Dub EP01 into another language on the EN picture: voice every paragraph of en/script_<lang>.md (NARRATOR_VOICE_ID
for the narrator, the EN character voices for quotes), fit each take into its English slot, write a placement for
en/mix.py, and mix a full soundtrack with the same music and effects.

  py -3.12 en/dub.py uk            # voice + fit + mix  -> out/en/mix_uk.wav, out/en/audio_uk.m4a
  py -3.12 en/dub.py es fr pt
  py -3.12 en/dub.py uk --no-mix   # voice + fit only

Script files: uk -> en/script_uk_dub.md, others -> en/script_<lang>.md (same 81 paragraphs and speaker labels as
en/script.md). NEVER Russian: 'ru' is refused. Takes are cached in en/voice_<lang>/ by text hash, like en/voice.py.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
from voice import MODEL, SEED, VOICES, duration, key, parse, tts  # noqa: E402

SCRIPTS = {"uk": "script_uk_dub.md"}
MAX_TEMPO = 1.25  # never faster than this; a take that still overruns is reported
GAP = 0.12  # seconds kept free before the next paragraph starts


def fit(src: Path, dst: Path, tempo: float) -> None:
    af = f"atempo={tempo:.4f}" if tempo > 1.0005 else "anull"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter:a", af, "-ar", "48000", "-ac", "1", str(dst)], check=True)


def tts_lang(k: str, voice: str, text: str, prev: str, nxt: str, dst: Path, lang: str) -> None:
    """voice.tts with the language set (voice.tts pins 'en')."""
    import time
    import urllib.error
    import urllib.request
    body = json.dumps({"text": text, "model_id": MODEL, "language_code": lang, "seed": SEED,
                       "previous_text": prev, "next_text": nxt}).encode()
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_192"
    for attempt in range(5):
        req = urllib.request.Request(url, data=body, method="POST", headers={"xi-api-key": k, "Content-Type": "application/json"})
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
        except (TimeoutError, urllib.error.URLError, ConnectionError) as e:  # a dropped connection: just try again
            if attempt < 4:
                time.sleep(5 * (attempt + 1))
                continue
            raise SystemExit(f"TTS network error for {dst.name}: {e}")


def dub(lang: str, k: str, jobs: int) -> Path:
    if lang == "ru":
        raise SystemExit("no Russian, ever")
    src = HERE / SCRIPTS.get(lang, f"script_{lang}.md")
    beats = parse(src)
    pl = json.loads((HERE / "voice" / "placement.json").read_text(encoding="utf-8"))
    if len(beats) != len(pl["beats"]):
        raise SystemExit(f"{src.name}: {len(beats)} paragraphs, EN placement has {len(pl['beats'])}")
    for b, e in zip(beats, pl["beats"]):
        if b["speaker"] != e["speaker"]:
            raise SystemExit(f"{src.name}: speaker {b['speaker']} where EN has {e['speaker']} (beat {e['i']})")
    out = HERE / f"voice_{lang}"
    (out / "fit").mkdir(parents=True, exist_ok=True)
    todo = []
    for i, b in enumerate(beats):
        h = hashlib.sha1(f"{MODEL}|{lang}|{VOICES[b['speaker']]}|{SEED}|{b['text']}".encode()).hexdigest()[:8]
        b["file"] = f"{i:03d}_{b['speaker']}_{h}.mp3"
        prev = beats[i - 1]["plain"] if i and beats[i - 1]["speaker"] == b["speaker"] else ""
        nxt = beats[i + 1]["plain"] if i + 1 < len(beats) and beats[i + 1]["speaker"] == b["speaker"] else ""
        if not (out / b["file"]).exists():
            todo.append((b, prev, nxt))
    print(f"[{lang}] {len(beats)} paragraphs, {len(todo)} to voice, {sum(len(t[0]['text']) for t in todo)} chars", flush=True)
    with ThreadPoolExecutor(max_workers=jobs) as ex:
        list(ex.map(lambda t: tts_lang(k, VOICES[t[0]["speaker"]], t[0]["text"], t[1], t[2], out / t[0]["file"], lang), todo))

    # fit every take into its EN slot (from its voice start to the next paragraph's voice start)
    total = pl["total"] / pl["fps"]
    placed, over = [], []
    for i, (b, e) in enumerate(zip(beats, pl["beats"])):
        nxt = pl["beats"][i + 1]["voiceAt"] if i + 1 < len(beats) else e["voiceAt"] + e["dur"] + 1.0
        slot = nxt - e["voiceAt"] - GAP
        d = duration(out / b["file"])
        tempo = min(MAX_TEMPO, max(1.0, d / slot))
        dst = out / "fit" / f"{i:03d}.wav"
        fit(out / b["file"], dst, tempo)
        fd = d / tempo
        if fd > slot + 0.05:
            over.append(f"{i}: {fd - slot:+.1f}s")
        placed.append({**e, "file": f"../voice_{lang}/fit/{i:03d}.wav", "dur": round(fd, 3), "tempo": round(tempo, 3)})
    sped = sum(1 for p in placed if p["tempo"] > 1.0005)
    print(f"[{lang}] fitted: {sped} takes sped up (max x{max(p['tempo'] for p in placed):.2f}); overruns: {', '.join(over) or 'none'}", flush=True)
    dst = HERE / "voice" / f"placement_{lang}.json"
    dst.write_text(json.dumps({**pl, "beats": placed, "lang": lang}, ensure_ascii=False, indent=1), encoding="utf-8")
    return dst


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("langs", nargs="+")
    ap.add_argument("--no-mix", action="store_true")
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    k = key()
    for lang in a.langs:
        placement = dub(lang, k, a.jobs)
        if a.no_mix:
            continue
        wav = ROOT / "out" / "en" / f"mix_{lang}.wav"
        subprocess.run([sys.executable, str(HERE / "mix.py"), "--placement", str(placement), "--out", str(wav)], check=True)
        m4a = ROOT / "out" / "en" / f"audio_{lang}.m4a"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "aac", "-b:a", "192k", str(m4a)], check=True)
        print(f"[{lang}] -> {wav.name}, {m4a.name}", flush=True)


if __name__ == "__main__":
    main()
