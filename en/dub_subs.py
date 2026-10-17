"""Subtitles that match a dub word for word: the dub script's text, timed on the fitted dub takes with whisper.

    py -3.12 en/dub_subs.py uk es fr pt        # -> out/en/subs/dub/<lang>.srt/.vtt (pt written as pt-BR)

Same cue rules as en/subs.py (plain phrase captions, <= 42 chars x 2 lines, 1-6 s). Inputs: en/voice/placement_<lang>.json
(from en/dub.py: start + fitted file of every take) and the dub script (en/script_uk_dub.md, en/script_<lang>.md).
Whisper runs with few threads so it doesn't starve a running render. NEVER Russian.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import subs  # noqa: E402
from subs import MIN_DUR, OUT, ROOT, align, clean, load_audio, segment, wrap, write  # noqa: E402
from voice import parse  # noqa: E402

VOICE = ROOT / "en" / "voice"
SCRIPTS = {"uk": "script_uk_dub.md"}
NAMES = {"pt": "pt-BR"}  # YouTube language codes
_model = None


def norm(w: str) -> str:
    """Unicode-aware token for matching (the EN version keeps only a-z)."""
    return re.sub(r"[^\w]", "", w.lower().replace("’", "'"), flags=re.UNICODE)


subs.norm = norm  # align() and the break rules look it up at call time


def whisper_words(wav: Path, lang: str) -> list[dict]:
    cache = OUT / "whisper_dub"
    key = hashlib.md5(wav.read_bytes()).hexdigest()[:12]
    cf = cache / f"{lang}_{wav.stem}_{key}.json"
    if cf.exists():
        return json.loads(cf.read_text(encoding="utf-8"))
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=2)
    segs, _ = _model.transcribe(load_audio(wav), language=lang, word_timestamps=True, beam_size=1,
                                condition_on_previous_text=False, vad_filter=False)
    words = [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in (s.words or [])]
    cache.mkdir(parents=True, exist_ok=True)
    cf.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    return words


LANG_NAME = {"uk": "Ukrainian", "es": "Spanish", "fr": "French", "pt": "Brazilian Portuguese"}
DIGITS_SYS = ("You edit {lang} subtitles of a WWI history documentary. The voice-over spells years and numbers out in "
              "words; on screen the viewer expects digits. In each cue, replace years and dates written in words with "
              "digits (e.g. a full year -> 1914, keeping the grammatical ending/preposition around it natural for {lang}; "
              "a short year such as 'the fifteenth' meaning 1915 in this 1914-1918 context -> 1915), and large spelled "
              "numbers with digits where natural (ten million -> 10 million in the language's own word for million). "
              "Change NOTHING else: same words, same order, same punctuation. Return ONLY JSON {{\"id\": \"text\"}} with "
              "every id you were given.")


def digits(cues: list[dict], lang: str) -> None:
    """Spelled-out years -> digits, by the local Claude CLI (same call as translate_subs.py), cached per batch."""
    from translate_subs import ask, parse_json, wrap_text
    cache = OUT / "cache_digits"
    cache.mkdir(parents=True, exist_ok=True)
    for b0 in range(0, len(cues), 40):
        batch = {str(k): cues[k]["text"].replace("\n", " ") for k in range(b0, min(len(cues), b0 + 40))}
        key = hashlib.md5((lang + json.dumps(batch, ensure_ascii=False)).encode()).hexdigest()[:16]
        cf = cache / f"{lang}_{key}.json"
        if cf.exists():
            got = json.loads(cf.read_text(encoding="utf-8"))
        else:
            got = parse_json(ask("sonnet", DIGITS_SYS.format(lang=LANG_NAME[lang]), json.dumps(batch, ensure_ascii=False)))
            cf.write_text(json.dumps(got, ensure_ascii=False), encoding="utf-8")
        for k, t in got.items():
            k = int(k)
            if k in range(b0, b0 + 40) and t.strip():
                w = wrap_text(t, lang)
                if w:
                    cues[k]["text"] = w


def run(lang: str) -> None:
    if lang == "ru":
        raise SystemExit("no Russian, ever")
    pl = json.loads((VOICE / f"placement_{lang}.json").read_text(encoding="utf-8"))
    beats = parse(ROOT / "en" / SCRIPTS.get(lang, f"script_{lang}.md"))
    cues: list[dict] = []
    for b, d in zip(pl["beats"], beats):
        text = clean(d["plain"])
        if not text:
            continue
        wav = (VOICE / b["file"]).resolve()
        words = align(text, whisper_words(wav, lang), b["dur"])
        for i, j in segment(words):
            ws = words[i:j]
            cues.append({"start": b["voiceAt"] + ws[0]["s"], "end": b["voiceAt"] + ws[-1]["e"] + 0.12,
                         "text": "\n".join(wrap([w["w"] for w in ws]) or [" ".join(w["w"] for w in ws)])})
        print(f"[{lang}] beat {b['i']:3}  {len(words)} words", file=sys.stderr, flush=True)
    for k, c in enumerate(cues):
        nxt = cues[k + 1]["start"] if k + 1 < len(cues) else 1e9
        c["end"] = min(c["end"], nxt - 0.04)
        if c["end"] - c["start"] < MIN_DUR:
            c["end"] = min(c["start"] + MIN_DUR, nxt - 0.04)
        c["end"] = max(c["end"], c["start"] + 0.3)
    try:
        digits(cues, lang)
    except Exception as e:  # offline or CLI error: keep the spoken years for now, re-run later for digits
        print(f"[{lang}] digits pass skipped ({e}); years stay in words", file=sys.stderr, flush=True)
    write(cues, OUT / "dub", NAMES.get(lang, lang))
    print(f"[{lang}] {len(cues)} cues -> {OUT / 'dub'}", file=sys.stderr)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("langs", nargs="+")
    for lang in ap.parse_args().langs:
        run(lang)


if __name__ == "__main__":
    main()
