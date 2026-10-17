"""EN subtitles for EP01: forced timing of the KNOWN script text on the tempo'd voice takes.

    py -3.12 en/subs.py            # all paragraphs (whisper results are cached per wav hash)
    py -3.12 en/subs.py --model medium.en

Inputs : en/voice/manifest.json (texts = truth, matches the audio) + en/voice/placement.json (start of each take,
         written by `node en/timings.mjs`).
Outputs: out/en/subs/en.srt, en.vtt, en.json (cue list with ids, used by translate_subs.py).
Plain phrase captions (NOT karaoke): <= 42 chars/line, <= 2 lines, 1-6 s, breaks at punctuation / clauses, names unsplit.
Re-run after re-voicing: node en/timings.mjs && py -3.12 en/subs.py && py -3.12 en/translate_subs.py
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOICE = ROOT / "en" / "voice"
OUT = ROOT / "out" / "en" / "subs"
CACHE = OUT / "whisper"

MAX_LINE, MAX_LINES, MIN_DUR, MAX_DUR = 42, 2, 1.0, 6.0
TAG = re.compile(r"\[[^\]]*\]")


def clean(t: str) -> str:
    return re.sub(r"\s+", " ", TAG.sub("", t)).strip()


def norm(w: str) -> str:
    return re.sub(r"[^0-9a-z]", "", w.lower().replace("’", "'"))


# ---------------------------------------------------------------- whisper + alignment
_model = None


def load_audio(wav: Path):
    """Decode via ffmpeg (the installed PyAV is too old for faster-whisper's own decoder)."""
    import subprocess
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(wav), "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def whisper_words(wav: Path, model_name: str) -> list[dict]:
    key = hashlib.md5(wav.read_bytes()).hexdigest()[:12]
    cf = CACHE / f"{wav.stem}_{model_name}_{key}.json"
    if cf.exists():
        return json.loads(cf.read_text(encoding="utf-8"))
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 4)
    segs, _ = _model.transcribe(load_audio(wav), language="en", word_timestamps=True, beam_size=1,
                                condition_on_previous_text=False, vad_filter=False)
    words = [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in (s.words or [])]
    CACHE.mkdir(parents=True, exist_ok=True)
    cf.write_text(json.dumps(words), encoding="utf-8")
    return words


def align(text: str, heard: list[dict], dur: float) -> list[dict]:
    """Known words get whisper timings where the normalised tokens match; the rest are interpolated."""
    known = text.split()
    kn = [norm(w) for w in known]
    hn = [norm(h["w"]) for h in heard]
    st: list[float | None] = [None] * len(known)
    en: list[float | None] = [None] * len(known)
    sm = difflib.SequenceMatcher(None, kn, hn, autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            st[a + k], en[a + k] = heard[b + k]["s"], heard[b + k]["e"]
    # interpolate runs of unmatched words between matched neighbours (weighted by word length)
    i = 0
    while i < len(known):
        if st[i] is not None:
            i += 1
            continue
        j = i
        while j < len(known) and st[j] is None:
            j += 1
        t0 = en[i - 1] if i > 0 else (heard[0]["s"] if heard else 0.0)
        t1 = st[j] if j < len(known) else (heard[-1]["e"] if heard else dur)
        t1 = max(t1, t0)
        wts = [max(1, len(norm(known[k]))) for k in range(i, j)]
        tot, acc = sum(wts), 0
        for k, wt in zip(range(i, j), wts):
            st[k] = t0 + (t1 - t0) * acc / tot
            acc += wt
            en[k] = t0 + (t1 - t0) * acc / tot
        i = j
    out, prev = [], 0.0
    for w, s, e in zip(known, st, en):
        s = max(s, prev)
        e = max(e, s + 0.02)
        out.append({"w": w, "s": s, "e": e})
        prev = s
    return out


# ---------------------------------------------------------------- segmentation
WEAK_BEFORE = {"and", "but", "or", "so", "that", "which", "who", "when", "while", "because", "where", "then", "if",
               "until", "as", "to", "into", "from", "with", "for", "in", "on", "at", "of", "by", "after", "before"}
NO_BREAK_AFTER = {"the", "a", "an", "of", "to", "in", "on", "at", "for", "with", "by", "and", "but", "or", "von",
                  "van", "de", "der", "his", "her", "their", "its", "our", "my", "your", "that", "than", "from",
                  "into", "as", "is", "was", "had", "has", "have", "be", "been", "not", "no", "i", "he", "she",
                  "we", "they", "it", "you", "st.", "mr.", "gen.", "king", "emperor", "kaiser", "tsar", "general",
                  "field", "marshal", "prince", "archduke"}


def is_cap(w: str) -> bool:
    w = w.strip("\"'“”‘(")
    return bool(w) and w[0].isupper()


def after_pen(words: list[str], j: int) -> float:
    """Cost of ending a cue after word j (lower = better place to break)."""
    w = words[j]
    nxt = words[j + 1] if j + 1 < len(words) else None
    if nxt is None:
        return 0.0
    if re.search(r"[.!?…][\"'”’)]*$", w):
        return 0.0
    if re.search(r"[:;—–-][\"'”’)]*$", w):
        return 1.0
    if re.search(r",[\"'”’)]*$", w):
        return 1.5
    pen = 6.0
    if norm(nxt) in WEAK_BEFORE:
        pen -= 2.0
    if norm(w) in NO_BREAK_AFTER:
        pen += 5.0
    if is_cap(w) and is_cap(nxt):  # never split a name
        pen += 30.0
    if re.match(r"^\d", w) and re.match(r"^\d|^(per|percent|million|thousand|miles|km)", norm(nxt) or ""):
        pen += 10.0
    return pen


def wrap(words: list[str], max_line: int = MAX_LINE) -> list[str] | None:
    """Split into <= MAX_LINES lines of <= max_line chars; None if impossible. Balanced, prefers punctuation."""
    full = " ".join(words)
    if len(full) <= max_line:
        return [full]
    best, bs = None, 1e9
    for k in range(1, len(words)):
        a, b = " ".join(words[:k]), " ".join(words[k:])
        if len(a) > max_line or len(b) > max_line:
            continue
        sc = after_pen(words, k - 1) * 3 + abs(len(a) - len(b)) * 0.15 + (0 if len(a) >= len(b) else 0.5)
        if sc < bs:
            best, bs = [a, b], sc
    return best


def segment(words: list[dict], max_line: int = MAX_LINE, max_dur: float = MAX_DUR) -> list[tuple[int, int]]:
    """DP over word indices -> cue spans [i, j). Minimises break badness + cue count + too-short / too-long cues."""
    n = len(words)
    tx = [w["w"] for w in words]
    INF = 1e9
    best = [INF] * (n + 1)
    prev = [0] * (n + 1)
    best[0] = 0.0
    for j in range(1, n + 1):
        for i in range(j - 1, -1, -1):
            chars = len(" ".join(tx[i:j]))
            if chars > max_line * MAX_LINES:
                break
            dur = words[j - 1]["e"] - words[i]["s"]
            if dur > max_dur and j - i > 1:
                break
            if wrap(tx[i:j], max_line) is None:
                continue
            c = 4.0 + after_pen(tx, j - 1)
            if dur < MIN_DUR:
                c += 6.0 * (MIN_DUR - dur) + 2
            if chars < 20:
                c += (20 - chars) * 0.3
            if chars > max_line:  # two lines: fine, but slightly dearer than one
                c += 1.0
            if best[i] + c < best[j]:
                best[j], prev[j] = best[i] + c, i
    spans, j = [], n
    while j > 0:
        spans.append((prev[j], j))
        j = prev[j]
    return spans[::-1]


# ---------------------------------------------------------------- output
def ts(t: float, vtt: bool = False) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02}{'.' if vtt else ','}{ms:03}"


def write(cues: list[dict], d: Path, lang: str = "en") -> None:
    d.mkdir(parents=True, exist_ok=True)
    srt = "".join(f"{k}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n\n" for k, c in enumerate(cues, 1))
    (d / f"{lang}.srt").write_text(srt, encoding="utf-8")
    vtt = "WEBVTT\n\n" + "".join(f"{ts(c['start'], True)} --> {ts(c['end'], True)}\n{c['text']}\n\n" for c in cues)
    (d / f"{lang}.vtt").write_text(vtt, encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="small.en")
    ap.add_argument("--only", type=int, nargs="*", help="beat indices (debug)")
    a = ap.parse_args()
    manifest = json.loads((VOICE / "manifest.json").read_text(encoding="utf-8"))
    placement = json.loads((VOICE / "placement.json").read_text(encoding="utf-8"))
    cues: list[dict] = []
    for b in placement["beats"]:
        if a.only and b["i"] not in a.only:
            continue
        m = manifest[b["i"]]
        text = clean(m.get("plain") or m["text"])
        if not text:
            continue
        wav = VOICE / b["file"]
        heard = whisper_words(wav, a.model)
        words = align(text, heard, b["dur"])
        print(f"[{b['i']:3}] {m['speaker']:9} {len(words):3} words  {len(heard):3} heard", file=sys.stderr, flush=True)
        for i, j in segment(words):
            ws = words[i:j]
            cues.append({
                "beat": b["i"],
                "start": b["voiceAt"] + ws[0]["s"],
                "end": b["voiceAt"] + ws[-1]["e"] + 0.12,
                "text": "\n".join(wrap([w["w"] for w in ws])),
            })
    # clamp: no overlaps, hold at least MIN_DUR when there is room
    for k, c in enumerate(cues):
        nxt = cues[k + 1]["start"] if k + 1 < len(cues) else 1e9
        c["end"] = min(c["end"], nxt - 0.04)
        if c["end"] - c["start"] < MIN_DUR:
            c["end"] = min(c["start"] + MIN_DUR, nxt - 0.04)
        c["end"] = max(c["end"], c["start"] + 0.3)
    for k, c in enumerate(cues):
        c["id"] = k
    write(cues, OUT)
    (OUT / "en.json").write_text(json.dumps(cues, ensure_ascii=False, indent=1), encoding="utf-8")
    durs = [c["end"] - c["start"] for c in cues]
    print(f"{len(cues)} cues; dur min {min(durs):.2f} max {max(durs):.2f}; -> {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
