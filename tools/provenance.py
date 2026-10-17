"""Provenance ledger and licence gate for a render: no licence, no render.

Every file the film uses (archival clips and photos, quoted page scans, backdrops, music, effects, voice takes, static
textures) gets one ledger record: its SHA-256, where it is used, where it came from, its licence, and a status.

    py -3.12 tools/provenance.py                    # project = current directory, lang = en
    py -3.12 tools/provenance.py --project . --lang en --sources my_sources.json --strict
    py -3.12 tools/provenance.py --no-hash          # quick check of licences only

Statuses
  ok           public domain, Public Domain Mark, CC0, no known copyright restrictions, own work
  attribution  CC BY / CC BY-SA: allowed, and its attribution line goes into credits.txt
  blocked      NC or ND licences, rights-managed stock archives, no licence at all, a licence not on the allow list,
               or a file the render refers to that does not exist
Exit code 1 if anything is blocked (0 with --report-only). With --strict, a licence that only exists as an on-screen
credit (no source record) is blocked too.

Where licences come from, first match wins:
  1. a lineage sidecar next to the media file: <file>.source.json  {"source_page", "license", "author", "title", ...}
  2. --sources files (JSON list/dict or CSV with a header): records keyed by "id" (asset path under public/, a clip id
     like "en/kaiser_portrait", or a file stem), with license, source_page, author, title, attribution
  3. public/clips/people/people.json (clips[].id) and public/docs/memoirs/quotes.json (file), if present
  4. the on-screen credit in the episode data, as a last resort (flagged; blocked with --strict)

Assets are read from the engine's episode files: src/<lang>/timings.json (inserts, backdrops, tease),
src/<lang>/story.ts (ph(), film(), bgf() and src: '...'), quotes.json pages used by inserts, <lang>/voice/manifest.json
takes, public/music and public/sfx, and the static textures the maps use.

Outputs in out/provenance/<lang>/: ledger.jsonl (one record per asset), ledger.md (shot list for humans),
credits.txt (credit block for a video description), summary.json (counts and ledger_root: the SHA-256 over the sorted
records, which changes if any file or any record changes).
Hashing is streamed in 1 MB chunks; start it at low priority if a render is running.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import sys
import time
from pathlib import Path

CHUNK = 1 << 20

# order matters: deny first, then attribution, then the plain allow list
DENY = [
    (r"\bnc\b|non-?commercial", "non-commercial licence"),
    (r"\bnd\b|no[- ]?deriv", "no-derivatives licence"),
    (r"all rights reserved", "all rights reserved"),
    (r"getty|\bap archive|associated press|british path[eé]|\bpath[eé]\b|critical past|movietone|\biwm\b|imperial war museum",
     "rights-managed archive"),
]
ATTRIBUTION = [r"cc[- ]?by(?![- ]?nc)(?![- ]?nd)", r"creative commons attribution"]
ALLOW = [r"public domain", r"\bpd\b", r"\bpdm\b", r"cc0", r"no known (copyright )?restrictions", r"no restrictions",
         r"^own work", r"\bown work\b"]
LICENCE_HINT = re.compile(r"public domain|\bpd\b|pdm|cc0|cc[- ]?by|creative commons|no known|own work", re.I)


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        while b := f.read(CHUNK):
            h.update(b)
    return h.hexdigest()


def classify(lic: str) -> tuple[str, str]:
    """('ok' | 'attribution' | 'blocked', reason)"""
    low = (lic or "").strip().lower()
    if not low or low in ("unknown", "?", "n/a", "none"):
        return "blocked", "no licence recorded"
    for pat, why in DENY:
        if re.search(pat, low):
            return "blocked", f"{why}: {lic}"
    if any(re.search(p, low) for p in ATTRIBUTION):
        return "attribution", ""
    if any(re.search(p, low) for p in ALLOW):
        return "ok", ""
    return "blocked", f"licence not on the allow list: {lic}"


# ---------------------------------------------------------------- source records

def _read_records(path: Path) -> list[dict]:
    if path.suffix.lower() == ".csv":
        with open(path, encoding="utf-8", newline="") as f:
            return [dict(r) for r in csv.DictReader(f)]
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict):
        data = data.get("records", data.get("clips", [{"id": k, **v} for k, v in data.items() if isinstance(v, dict)]))
    return [r for r in data if isinstance(r, dict)]


def load_sources(root: Path, extra: list[Path]) -> dict[str, dict]:
    src: dict[str, dict] = {}

    def put(key: str, rec: dict, record: str):
        if key and key not in src:
            src[key] = {**rec, "record": record}

    for p in extra:
        for r in _read_records(p):
            rec = {k: r.get(k) for k in ("license", "source_page", "author", "title", "attribution", "holder") if r.get(k)}
            if not rec.get("source_page") and r.get("source_url"):
                rec["source_page"] = r["source_url"]
            put(str(r.get("id") or r.get("path") or r.get("file") or ""), rec, str(p))
    people = root / "public" / "clips" / "people" / "people.json"
    if people.exists():
        for c in json.loads(people.read_text(encoding="utf-8")).get("clips", []):
            put(c.get("id", ""), {"license": c.get("license", ""), "source_page": c.get("source_url", ""),
                                  "credit": c.get("credit", ""), "title": c.get("shows", "")}, "public/clips/people/people.json")
    quotes = root / "public" / "docs" / "memoirs" / "quotes.json"
    if quotes.exists():
        for q in json.loads(quotes.read_text(encoding="utf-8")):
            put(f"docs/memoirs/{q.get('file', '')}", {"license": q.get("license", ""), "source_page": q.get("source_url", ""),
                                                      "author": q.get("author", ""), "title": q.get("work", ""),
                                                      "credit": q.get("credit", "")}, "public/docs/memoirs/quotes.json")
    return src


def lookup(rel: str, sources: dict[str, dict], root: Path) -> dict:
    side = root / "public" / (rel + ".source.json")
    if side.exists():
        return {**json.loads(side.read_text(encoding="utf-8")), "record": f"public/{rel}.source.json"}
    keys = [rel, Path(rel).stem]
    if rel.startswith("clips/") and rel.endswith(".mp4"):
        keys.insert(1, rel[len("clips/"):-len(".mp4")])
    for k in keys:
        if k in sources:
            return dict(sources[k])
    return {}


# ---------------------------------------------------------------- what the render uses

def used_assets(root: Path, lang: str) -> dict[str, dict]:
    """path relative to public/ -> {kind, credits, used_at}"""
    use: dict[str, dict] = {}

    def add(rel: str, kind: str, credit: str, where: str):
        u = use.setdefault(rel, {"kind": kind, "credits": set(), "used_at": []})
        if credit:
            u["credits"].add(credit)
        u["used_at"].append(where)

    quotes = {}
    qf = root / "public" / "docs" / "memoirs" / "quotes.json"
    if qf.exists():
        quotes = {q["id"]: q for q in json.loads(qf.read_text(encoding="utf-8")) if "id" in q}
    tf = root / "src" / lang / "timings.json"
    if tf.exists():
        t = json.loads(tf.read_text(encoding="utf-8"))
        fps = t.get("fps", 30)
        for ins in t.get("inserts", []):
            at = f"insert beat {ins.get('beat')} @{ins.get('from', 0) / fps:.1f}s"
            if ins.get("clip"):
                add(f"clips/{ins['clip']}.mp4", "film", ins.get("credit", ""), at)
            if ins.get("photo"):
                add(ins["photo"], "photo", ins.get("credit", ""), at)
            if ins.get("page") and ins["page"] in quotes:
                add(f"docs/memoirs/{quotes[ins['page']]['file']}", "page", quotes[ins["page"]].get("cite", ""), at)
        for beat, b in (t.get("backdrops") or {}).items():
            if b.get("photo"):
                add(b["photo"], "photo", b.get("credit", ""), f"backdrop beat {beat}")
            if b.get("clip"):
                add(f"clips/{b['clip']}.mp4", "film", b.get("credit", ""), f"backdrop beat {beat}")
        for s in (t.get("tease") or {}).get("shots", []):
            if s.get("clip"):
                add(f"clips/{s['clip']}.mp4", "film", s.get("credit", ""), "tease")
            if s.get("photo"):
                add(s["photo"], "photo", s.get("credit", ""), "tease")
    sf = root / "src" / lang / "story.ts"
    if sf.exists():
        story = sf.read_text(encoding="utf-8")
        consts = dict(re.findall(r"^const ([A-Z_][A-Z0-9_]*) = '([^']*)';", story, re.M))  # credit constants
        arg = r"('([^']*)'|[A-Z_][A-Z0-9_]*)"

        def credit_of(m: re.Match | None, g: int) -> str:
            if not m or m.group(g) is None:
                return ""
            raw = m.group(g)
            return raw[1:-1] if raw.startswith("'") else consts.get(raw, "")

        for m in re.finditer(rf"\bph\('([^']+)',\s*{arg}", story):
            add(f"photos/{lang}/{m.group(1)}", "photo", credit_of(m, 2), "story beat")
        for m in re.finditer(rf"\bfilm\('([^']+)',\s*{arg}", story):
            add(f"clips/{m.group(1)}.mp4", "film", credit_of(m, 2), "story beat")
        for m in re.finditer(rf"\bbgf\('([^']+)'(?:,\s*{arg})?", story):
            add(f"clips/{m.group(1)}.mp4", "film", credit_of(m, 2), "story background")
        for m in re.finditer(r"\bsrc:\s*'([^']+\.(?:jpe?g|png|webp|mp4))'", story):
            add(m.group(1), "photo" if not m.group(1).endswith(".mp4") else "film", "", "story beat")
    for folder, kind in (("music", "music"), ("sfx", "sfx")):
        d = root / "public" / folder
        if d.exists():
            for p in sorted(d.iterdir()):
                if p.suffix.lower() in (".mp3", ".wav", ".m4a", ".flac", ".ogg"):
                    add(f"{folder}/{p.name}", kind, "", "mix")
    mf = root / lang / "voice" / "manifest.json"
    if mf.exists():
        for b in json.loads(mf.read_text(encoding="utf-8")):
            add(f"../{lang}/voice/{b['file']}", "voice", "", f"{b.get('speaker', '')} paragraph")
    for rel in ("paper_texture.jpg", "relief_baked.webp"):
        if (root / "public" / rel).exists():
            add(rel, "static", "", "every map frame")
    return use


# ---------------------------------------------------------------- ledger

def build(root: Path, lang: str, sources: dict[str, dict], hash_files: bool = True, strict: bool = False) -> list[dict]:
    recs = []
    for rel, u in sorted(used_assets(root, lang).items()):
        p = root / rel[3:] if rel.startswith("../") else root / "public" / rel  # ../ = outside public/ (voice takes)
        origin = lookup(rel, sources, root)
        issues: list[str] = []
        synthetic = u["kind"] == "voice"
        if synthetic and not origin.get("license"):
            origin = {"license": "own work (synthetic TTS narration)", "generator": "text-to-speech", "record": "voice manifest"}
        lic = origin.get("license", "")
        from_credit = False
        if not lic:
            hint = next((c for c in sorted(u["credits"]) if LICENCE_HINT.search(c)), "")
            if hint:
                lic, from_credit = hint, True
                issues.append("licence taken from the on-screen credit only; add a source record")
        status, why = classify(lic)
        if why:
            issues.append(why)
        if from_credit and strict:
            status = "blocked"
        if not p.exists():
            status = "blocked"
            issues.append("file referenced by the render does not exist")
        if u["kind"] in ("film", "photo", "page") and not origin.get("source_page"):
            issues.append("no source page URL")
        attribution = ""
        if status == "attribution":
            attribution = origin.get("attribution") or (
                f"{origin.get('title') or Path(rel).stem} by {origin.get('author') or 'unknown author'}, {lic}"
                + (f", {origin['source_page']}" if origin.get("source_page") else ""))
        recs.append({
            "id": rel[3:] if rel.startswith("../") else rel, "kind": u["kind"],
            "path": rel[3:] if rel.startswith("../") else f"public/{rel}",
            "sha256": sha256(p) if hash_files and p.exists() else None, "bytes": p.stat().st_size if p.exists() else None,
            "used_at": u["used_at"], "onscreen_credit": sorted(u["credits"]), "origin": origin, "license": lic,
            "synthetic": synthetic, "status": status, "attribution": attribution, "issues": issues,
        })
    return recs


def ledger_root(recs: list[dict]) -> str:
    lines = sorted(json.dumps(r, ensure_ascii=False, sort_keys=True) for r in recs)
    return hashlib.sha256("\n".join(lines).encode("utf-8")).hexdigest()


def credits_text(recs: list[dict]) -> str:
    seen: list[str] = []
    for r in recs:
        if r["kind"] in ("voice", "static"):
            continue
        for c in r["onscreen_credit"] or [r["origin"].get("credit", "")]:
            if c and c not in seen:
                seen.append(c)
    must = sorted({r["attribution"] for r in recs if r["attribution"]})
    out = ["Archival sources:"] + [f"- {c}" for c in seen]
    if must:
        out += ["", "Required attributions:"] + [f"- {m}" for m in must]
    if any(r["synthetic"] for r in recs):
        out += ["", "Narration: synthetic voice (text-to-speech)."]
    return "\n".join(out) + "\n"


def write(recs: list[dict], out: Path) -> dict:
    out.mkdir(parents=True, exist_ok=True)
    (out / "ledger.jsonl").write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True) + "\n" for r in recs), encoding="utf-8")
    counts = {s: sum(r["status"] == s for r in recs) for s in ("ok", "attribution", "blocked")}
    summary = {"generated": time.strftime("%Y-%m-%d %H:%M:%S"), "assets": len(recs), "counts": counts,
               "ledger_root": ledger_root(recs), "kinds": {k: sum(r["kind"] == k for r in recs) for k in sorted({r["kind"] for r in recs})}}
    (out / "summary.json").write_text(json.dumps(summary, indent=1), encoding="utf-8")
    md = ["# Provenance ledger", "", f"{len(recs)} assets · ok {counts['ok']} · attribution {counts['attribution']} · "
          f"blocked {counts['blocked']}", "", f"ledger root `{summary['ledger_root']}`", ""]
    for st in ("blocked", "attribution", "ok"):
        rows = [r for r in recs if r["status"] == st]
        if rows:
            md += [f"## {st} ({len(rows)})", "", "| asset | kind | source | licence | sha256 | notes |", "|---|---|---|---|---|---|"]
            for r in rows:
                md.append(f"| `{r['id']}` | {r['kind']} | {r['origin'].get('source_page', '')} | {r['license']} | "
                          f"`{(r['sha256'] or '')[:12]}` | {'; '.join(r['issues'])[:300]} |")
            md.append("")
    (out / "ledger.md").write_text("\n".join(md), encoding="utf-8")
    (out / "credits.txt").write_text(credits_text(recs), encoding="utf-8")
    return summary


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Provenance ledger and licence gate for a render.")
    ap.add_argument("--project", type=Path, default=Path("."))
    ap.add_argument("--lang", default="en")
    ap.add_argument("--sources", type=Path, action="append", default=[], help="extra source records (JSON or CSV)")
    ap.add_argument("--out", type=Path, help="default: <project>/out/provenance/<lang>")
    ap.add_argument("--strict", action="store_true", help="block licences that exist only as on-screen credits")
    ap.add_argument("--no-hash", action="store_true", help="skip SHA-256 (quick licence check)")
    ap.add_argument("--report-only", action="store_true", help="always exit 0")
    a = ap.parse_args(argv)
    root = a.project.resolve()
    recs = build(root, a.lang, load_sources(root, a.sources), hash_files=not a.no_hash, strict=a.strict)
    s = write(recs, a.out or root / "out" / "provenance" / a.lang)
    print(json.dumps(s, indent=1))
    for r in recs:
        if r["status"] == "blocked":
            print(f"  BLOCKED {r['id']}: {'; '.join(r['issues'])[:200]}")
    if s["counts"]["blocked"] and not a.report_only:
        print("no licence, no render: fix the blocked assets above (or pass --report-only to just look)")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
