"""Translate the EN cues (out/en/subs/en.json, from en/subs.py) into the release languages.

    py -3.12 en/translate_subs.py                 # all languages
    py -3.12 en/translate_subs.py uk es           # a subset
    py -3.12 en/translate_subs.py --model haiku   # cheaper model (default sonnet)

Output: out/en/subs/<lang>.srt + .vtt with exactly the EN cue count and timings.
Translator = the local Claude Code CLI (headless: no tools, no MCP, no session files), batches of ~40 cues as JSON
{id: text}; every batch is cached in out/en/subs/cache/ (keyed by model, prompt, source and context), so identical
requests reuse translations. NEVER Russian: 'ru' is refused in code.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from subs import MAX_LINE, OUT, ROOT, after_pen, ts, write  # noqa: E402

LANGS = {
    "uk": "Ukrainian", "es": "Spanish (neutral Latin American/European)", "pt-BR": "Brazilian Portuguese",
    "de": "German", "fr": "French", "hi": "Hindi (Devanagari)", "id": "Indonesian", "ja": "Japanese",
    "tr": "Turkish", "pl": "Polish",
}
BANNED = {"ru", "rus", "russian", "ru-ru"}
LINE_MAX = {"ja": 20}
NO_SPACES = {"ja"}
BATCH = 40
CACHE = OUT / "cache"
SANDBOX = Path(os.environ.get("RE_CACHE") or ROOT / "out" / "cache") / "llm-sandbox"  # empty cwd for the CLI, so it sees no project files


def claude_exe() -> str:
    shim = shutil.which("claude.cmd")
    if shim:
        exe = Path(shim).parent / "node_modules" / "@anthropic-ai" / "claude-code" / "bin" / "claude.exe"
        if exe.exists():
            return str(exe)
    return shutil.which("claude.exe") or shim or shutil.which("claude")


def ask(model: str, system: str, user: str, timeout: int = 600) -> str:
    SANDBOX.mkdir(parents=True, exist_ok=True)
    args = [claude_exe(), "-p", "--model", model, "--output-format", "json", "--strict-mcp-config",
            "--setting-sources", "", "--tools", "", "--disable-slash-commands", "--no-session-persistence",
            "--system-prompt", system]
    p = subprocess.run(args, input=user, capture_output=True, text=True, encoding="utf-8", errors="replace",
                       cwd=SANDBOX, timeout=timeout)
    try:
        data = json.loads(p.stdout)
    except json.JSONDecodeError:
        raise RuntimeError(f"claude rc={p.returncode}: {(p.stderr or p.stdout)[:300]}")
    if data.get("is_error"):
        raise RuntimeError(f"claude error: {str(data.get('result'))[:300]}")
    return data.get("result") or ""


def parse_json(text: str) -> dict:
    m = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    cand = (m.group(1) if m else text).strip()
    i, j = cand.find("{"), cand.rfind("}")
    return json.loads(cand[i:j + 1])


def wrap_text(text: str, lang: str) -> str | None:
    """<= 2 lines of <= LINE_MAX chars; None if it cannot fit."""
    mx = LINE_MAX.get(lang, MAX_LINE)
    text = re.sub(r"\s+", " ", text.replace("\n", " ")).strip()
    if len(text) <= mx:
        return text
    if lang in NO_SPACES:
        cands = range(1, len(text))
        def sc(k):
            pen = 0 if text[k - 1] in "、。，,！？!?" else 3
            return pen + abs(k - len(text) / 2) * 0.1
    else:
        sp = [m.start() for m in re.finditer(" ", text)]
        cands = sp
        words = text.split(" ")
        pos = {s: n for n, s in enumerate(sp)}
        def sc(k):
            return after_pen(words, pos[k]) * 3 + abs(k - len(text) / 2) * 0.15
    best, bs = None, 1e9
    for k in cands:
        a, b = text[:k].strip(), text[k:].strip()
        if not a or not b or len(a) > mx or len(b) > mx:
            continue
        s = sc(k)
        if s < bs:
            best, bs = f"{a}\n{b}", s
    return best


def system_prompt(lang: str) -> str:
    name = LANGS[lang]
    mx = LINE_MAX.get(lang, MAX_LINE)
    s = (f"You translate documentary subtitles from English into {name}. The film is a serious, wry alternative-history "
         f"documentary about 1914 (what if Germany had attacked Russia first). Keep the narrator's plain, dry voice and jokes. "
         f"Rules: translate each cue so it reads naturally on screen; cues are consecutive pieces of ONE narration, so a "
         f"cue may start or end mid-sentence: keep that flow and do not merge, split or drop cues. Keep proper names, ranks and "
         f"places in the standard form of the target language (e.g. well-known historical figures use their conventional "
         f"spelling in {name}). Numbers and years as the language normally writes them. Be concise: each cue must fit in "
         f"2 lines of at most {mx} characters (so at most {2 * mx - 4} characters in total); shorten rather than overflow. "
         f"Do not add notes, quotes or explanations. Reply with ONE JSON object only: the same ids mapped to the translated text.")
    if lang == "uk":
        ref = ROOT / "en" / "script_uk.md"
        if ref.exists():
            s += ("\n\nTerminology and style reference (the approved full Ukrainian reading copy of the same script; reuse its "
                  "spellings of names, titles and key terms):\n" + ref.read_text(encoding="utf-8")[:60000])
    return s


def translate_batch(lang: str, model: str, batch: list[dict], before: list[dict]) -> dict[str, str]:
    src = {str(c["id"]): c["text"].replace("\n", " ") for c in batch}
    system = system_prompt(lang)
    mx = LINE_MAX.get(lang, MAX_LINE)
    ctx = ""
    if before:
        ctx = "Previous cues, for context only (do NOT translate): " + json.dumps(
            {str(c["id"]): c["text"].replace("\n", " ") for c in before}, ensure_ascii=False) + "\n\n"
    # Include every translation input: model/style/context changes must not reuse old output.
    key = hashlib.sha256(json.dumps(
        [1, lang, model, system, ctx, src], ensure_ascii=False, sort_keys=True
    ).encode("utf-8")).hexdigest()
    cf = CACHE / f"{lang}_{key}.json"
    if cf.exists():
        try:
            cached = json.loads(cf.read_text(encoding="utf-8"))
            if (isinstance(cached, dict) and cached.keys() == src.keys()
                    and all(isinstance(t, str) and t.strip() for t in cached.values())):
                return cached
        except (ValueError, UnicodeError):
            pass  # Interrupted/invalid legacy writes are a cache miss, never a broken release.
    out: dict[str, str] = {}
    todo = dict(src)
    note = ""
    for attempt in range(4):
        user = ctx + note + "Translate these cues:\n" + json.dumps(todo, ensure_ascii=False, indent=0)
        try:
            data = parse_json(ask(model, system, user))
            if not isinstance(data, dict):
                raise ValueError("translator response must be a JSON object")
        except Exception as e:  # noqa: BLE001
            print(f"  [{lang}] batch retry ({e})", file=sys.stderr)
            continue
        bad = {}
        for k in todo:
            value = data.get(k)
            t = value.strip() if isinstance(value, str) else ""
            if not t:
                bad[k] = "missing"
            elif wrap_text(t, lang) is None:
                bad[k] = f"too long ({len(t)} chars, max {2 * mx - 4})"
                out[k] = t  # keep as the fallback if it never gets shorter
            else:
                out[k] = t
                out.pop(f"!{k}", None)
        todo = {k: src[k] for k in bad}
        if not todo:
            break
        note = ("Fix only these cues; the previous attempt was " + "; ".join(f"{k}: {v}" for k, v in bad.items())
                + ". Make them clearly shorter.\n")
    for k in src:
        if k not in out:
            raise RuntimeError(f"[{lang}] no translation for cue {k}")
    CACHE.mkdir(parents=True, exist_ok=True)
    # A stopped process must not replace a reusable cache entry with partial JSON.
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=CACHE,
                                         prefix=f".{lang}_", suffix=".tmp", delete=False) as f:
            temporary = Path(f.name)
            json.dump(out, f, ensure_ascii=False, indent=0)
        temporary.replace(cf)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
    return out


def do_lang(lang: str, model: str, cues: list[dict]) -> str:
    assert lang.lower() not in BANNED, "Russian subtitles are never produced"
    batches = [cues[i:i + BATCH] for i in range(0, len(cues), BATCH)]
    tr: dict[str, str] = {}
    for n, b in enumerate(batches):
        before = batches[n - 1][-3:] if n else []
        tr.update(translate_batch(lang, model, b, before))
        print(f"[{lang}] batch {n + 1}/{len(batches)}", file=sys.stderr, flush=True)
    res, overflow = [], 0
    for c in cues:
        t = tr[str(c["id"])]
        w = wrap_text(t, lang)
        if w is None:  # last resort: still 2 lines, a little over the limit
            overflow += 1
            mid = len(t) // 2
            sp = [m.start() for m in re.finditer(" ", t)] or [mid]
            k = min(sp, key=lambda x: abs(x - mid))
            w = f"{t[:k].strip()}\n{t[k:].strip()}"
        res.append({**c, "text": w})
    write(res, OUT, lang)
    return f"{lang}: {len(res)} cues, {overflow} over-long"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("langs", nargs="*")
    ap.add_argument("--model", default="sonnet")
    ap.add_argument("--jobs", type=int, default=3)
    a = ap.parse_args()
    langs = a.langs or list(LANGS)
    for l in langs:
        if l.lower() in BANNED:
            sys.exit("Refusing: never produce Russian subtitles.")
        if l not in LANGS:
            sys.exit(f"unknown language {l}; known: {', '.join(LANGS)}")
    cues = json.loads((OUT / "en.json").read_text(encoding="utf-8"))
    with ThreadPoolExecutor(a.jobs) as ex:
        for r in ex.map(lambda l: do_lang(l, a.model, cues), langs):
            print(r)


if __name__ == "__main__":
    main()
