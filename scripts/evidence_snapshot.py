"""Save a dated snapshot of the repository's public reach: traffic (views, clones, referrers, popular paths), stars,
forks, watchers, and download counts of every release asset.

    py -3.12 scripts/evidence_snapshot.py                     # repo = the one `gh` sees in this folder
    py -3.12 scripts/evidence_snapshot.py --repo owner/name

Writes evidence/YYYY-MM-DD.json (evidence/ is gitignored). GitHub keeps traffic for 14 days only, so run it at least
every two weeks (monthly loses data; fortnightly does not) if you want an unbroken history. Traffic needs push access
to the repo; `gh auth login` first. Nothing is sent anywhere: it only reads the GitHub API through `gh`.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def gh(*args: str):
    r = subprocess.run(["gh", *args], capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        raise RuntimeError(f"gh {' '.join(args)}: {r.stderr.strip()[:300]}")
    return json.loads(r.stdout) if r.stdout.strip() else None


def api(path: str):
    try:
        return gh("api", "-H", "Accept: application/vnd.github+json", path)
    except RuntimeError as e:
        return {"error": str(e)}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", help="owner/name (default: the repo of the current folder)")
    ap.add_argument("--out", type=Path, default=ROOT / "evidence")
    a = ap.parse_args()
    repo = a.repo or gh("repo", "view", "--json", "nameWithOwner")["nameWithOwner"]
    meta = api(f"repos/{repo}")
    releases = api(f"repos/{repo}/releases?per_page=100")
    snap = {
        "repo": repo,
        "taken_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "stars": meta.get("stargazers_count"), "forks": meta.get("forks_count"),
        "watchers": meta.get("subscribers_count"), "open_issues": meta.get("open_issues_count"),
        "traffic": {
            "views": api(f"repos/{repo}/traffic/views"),
            "clones": api(f"repos/{repo}/traffic/clones"),
            "referrers": api(f"repos/{repo}/traffic/popular/referrers"),
            "paths": api(f"repos/{repo}/traffic/popular/paths"),
        },
        "releases": [
            {"tag": r.get("tag_name"), "published_at": r.get("published_at"),
             "assets": [{"name": x.get("name"), "downloads": x.get("download_count")} for x in r.get("assets", [])]}
            for r in (releases if isinstance(releases, list) else [])
        ],
    }
    a.out.mkdir(parents=True, exist_ok=True)
    dst = a.out / f"{time.strftime('%Y-%m-%d')}.json"
    dst.write_text(json.dumps(snap, indent=1, ensure_ascii=False), encoding="utf-8")
    v, c = snap["traffic"]["views"], snap["traffic"]["clones"]
    print(f"{repo}: {snap['stars']} stars, {snap['forks']} forks, views {v.get('count')} ({v.get('uniques')} unique), "
          f"clones {c.get('count')} ({c.get('uniques')} unique) over 14 days -> {dst}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
