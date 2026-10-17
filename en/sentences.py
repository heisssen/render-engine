"""Sentence boundaries of every EN paragraph, measured on the voice (the documentary bible cuts on sentences).

    py -3.12 en/sentences.py      # -> src/en/sentences.json  {beat: [sentence start offsets in s from the take start]}

Uses the cached whisper words of en/subs.py (no new transcription unless a take changed) and the known script text.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from subs import ROOT, VOICE, align, clean, whisper_words  # noqa: E402

manifest = json.loads((VOICE / "manifest.json").read_text(encoding="utf-8"))
placement = json.loads((VOICE / "placement.json").read_text(encoding="utf-8"))
out = {}
for b in placement["beats"]:
    m = manifest[b["i"]]
    text = clean(m.get("plain") or m["text"])
    words = align(text, whisper_words(VOICE / b["file"], "small.en"), b["dur"])
    starts = [0.0] + [round(words[k + 1]["s"], 2) for k in range(len(words) - 1) if re.search(r"[.!?…][\"'”’)]*$", words[k]["w"])]
    out[str(b["i"])] = {"starts": starts, "end": round(words[-1]["e"], 2) if words else b["dur"]}
(ROOT / "src" / "en" / "sentences.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
print(f"{len(out)} beats, {sum(len(v['starts']) for v in out.values())} sentences -> src/en/sentences.json")
