"""Unit tests for tools/provenance.py on a tiny fake project (no media, no network).

    py -3.12 -m unittest discover tests
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import provenance as pv  # noqa: E402


def write(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(data, (bytes, bytearray)):
        p.write_bytes(data)
    elif isinstance(data, str):
        p.write_text(data, encoding="utf-8")
    else:
        p.write_text(json.dumps(data), encoding="utf-8")


def make_project(root: Path) -> None:
    pub = root / "public"
    write(pub / "clips" / "pd_film.mp4", b"film-a")
    write(pub / "clips" / "byca.mp4", b"film-b")
    write(pub / "clips" / "credit_only.mp4", b"film-c")
    write(pub / "clips" / "people" / "nc_film.mp4", b"film-d")
    write(pub / "photos" / "en" / "pd_photo.jpg", b"photo-a")
    write(pub / "photos" / "en" / "sa_photo.jpg", b"photo-b")
    write(pub / "docs" / "memoirs" / "page1.jpg", b"scan")
    write(pub / "music" / "bed.mp3", b"music")
    write(root / "en" / "voice" / "000_NARRATOR_abcd1234.mp3", b"voice")
    write(pub / "clips" / "pd_film.mp4.source.json", {"license": "Public Domain Mark 1.0", "source_page": "https://example.org/a"})
    write(pub / "clips" / "people" / "people.json", {"clips": [
        {"id": "people/nc_film", "license": "CC BY-NC 4.0", "source_url": "https://example.org/nc", "credit": "Someone"}]})
    write(pub / "docs" / "memoirs" / "quotes.json", [
        {"id": "q1", "file": "page1.jpg", "license": "Public domain (published 1922)", "source_url": "https://archive.org/x",
         "author": "A. Author", "work": "Memoirs", "cite": "A. Author, Memoirs, 1922, p. 1"}])
    write(root / "sources.json", [
        {"id": "byca", "license": "CC BY 4.0", "source_page": "https://example.org/b", "author": "Jane Doe", "title": "Harbour"},
        {"id": "sa_photo", "license": "CC BY-SA 3.0", "source_page": "https://example.org/c", "attribution": "Bild 1 / CC-BY-SA 3.0"},
        {"id": "music/bed.mp3", "license": "CC BY 4.0", "author": "A Composer", "title": "Bed"}])
    write(root / "src" / "en" / "timings.json", {"fps": 30, "inserts": [
        {"beat": 0, "from": 30, "clip": "pd_film", "credit": "archival film · public domain"},
        {"beat": 1, "from": 90, "clip": "byca", "credit": "Harbour, Jane Doe"},
        {"beat": 2, "from": 150, "clip": "credit_only", "credit": "Some archive · public domain"},
        {"beat": 3, "from": 210, "clip": "people/nc_film", "credit": "Someone"},
        {"beat": 4, "from": 270, "page": "q1"},
        {"beat": 5, "from": 330, "clip": "missing_film", "credit": "lost · public domain"}],
        "backdrops": {"6": {"photo": "photos/en/sa_photo.jpg", "credit": "Bild 1"}}, "tease": {"shots": []}})
    write(root / "src" / "en" / "story.ts", "const LOC = 'Library of Congress · public domain';\n"
          "export const STORY = [\n\tph('pd_photo.jpg', LOC, {move: 'in'}),\n];\n")
    write(root / "en" / "voice" / "manifest.json", [{"file": "000_NARRATOR_abcd1234.mp3", "speaker": "NARRATOR"}])


class Classify(unittest.TestCase):
    def test_allow_attribution_deny(self):
        self.assertEqual(pv.classify("Public Domain Mark 1.0")[0], "ok")
        self.assertEqual(pv.classify("CC0 1.0")[0], "ok")
        self.assertEqual(pv.classify("no known copyright restrictions")[0], "ok")
        self.assertEqual(pv.classify("CC BY 4.0")[0], "attribution")
        self.assertEqual(pv.classify("Bundesarchiv, Bild 183 / CC-BY-SA 3.0")[0], "attribution")
        self.assertEqual(pv.classify("CC BY-NC 4.0")[0], "blocked")
        self.assertEqual(pv.classify("CC BY-ND 2.0")[0], "blocked")
        self.assertEqual(pv.classify("Getty Images")[0], "blocked")
        self.assertEqual(pv.classify("")[0], "blocked")
        self.assertEqual(pv.classify("unknown")[0], "blocked")
        self.assertEqual(pv.classify("fair use, probably")[0], "blocked")


class Ledger(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        make_project(self.root)
        self.sources = pv.load_sources(self.root, [self.root / "sources.json"])

    def tearDown(self):
        self.tmp.cleanup()

    def by_id(self, recs):
        return {r["id"]: r for r in recs}

    def test_statuses(self):
        r = self.by_id(pv.build(self.root, "en", self.sources))
        self.assertEqual(r["clips/pd_film.mp4"]["status"], "ok")  # from the lineage sidecar
        self.assertEqual(r["clips/pd_film.mp4"]["origin"]["record"], "public/clips/pd_film.mp4.source.json")
        self.assertEqual(r["clips/byca.mp4"]["status"], "attribution")
        self.assertIn("Jane Doe", r["clips/byca.mp4"]["attribution"])
        self.assertEqual(r["photos/en/sa_photo.jpg"]["attribution"], "Bild 1 / CC-BY-SA 3.0")
        self.assertEqual(r["clips/people/nc_film.mp4"]["status"], "blocked")
        self.assertEqual(r["clips/missing_film.mp4"]["status"], "blocked")
        self.assertEqual(r["docs/memoirs/page1.jpg"]["status"], "ok")
        self.assertEqual(r["photos/en/pd_photo.jpg"]["onscreen_credit"], ["Library of Congress · public domain"])
        self.assertTrue(r["en/voice/000_NARRATOR_abcd1234.mp3"]["synthetic"])
        self.assertEqual(r["en/voice/000_NARRATOR_abcd1234.mp3"]["status"], "ok")
        self.assertEqual(r["music/bed.mp3"]["status"], "attribution")

    def test_credit_only_is_flagged_and_strict_blocks_it(self):
        r = self.by_id(pv.build(self.root, "en", self.sources))
        self.assertEqual(r["clips/credit_only.mp4"]["status"], "ok")
        self.assertTrue(any("on-screen credit only" in i for i in r["clips/credit_only.mp4"]["issues"]))
        rs = self.by_id(pv.build(self.root, "en", self.sources, strict=True))
        self.assertEqual(rs["clips/credit_only.mp4"]["status"], "blocked")

    def test_hashes_and_root(self):
        recs = pv.build(self.root, "en", self.sources)
        r = self.by_id(recs)
        self.assertEqual(r["clips/pd_film.mp4"]["sha256"], pv.sha256(self.root / "public/clips/pd_film.mp4"))
        root1 = pv.ledger_root(recs)
        self.assertEqual(root1, pv.ledger_root(list(reversed(recs))))  # order does not matter
        (self.root / "public/clips/pd_film.mp4").write_bytes(b"film-a, edited")
        self.assertNotEqual(root1, pv.ledger_root(pv.build(self.root, "en", self.sources)))  # any byte changes it

    def test_outputs_and_gate(self):
        out = self.root / "out" / "provenance" / "en"
        code = pv.main(["--project", str(self.root), "--sources", str(self.root / "sources.json")])
        self.assertEqual(code, 1)  # nc_film and missing_film are blocked: no licence, no render
        self.assertEqual(pv.main(["--project", str(self.root), "--sources", str(self.root / "sources.json"), "--report-only"]), 0)
        summary = json.loads((out / "summary.json").read_text(encoding="utf-8"))
        self.assertEqual(summary["counts"]["blocked"], 2)
        self.assertEqual(len(summary["ledger_root"]), 64)
        credits = (out / "credits.txt").read_text(encoding="utf-8")
        self.assertIn("Required attributions:", credits)
        self.assertIn("Bild 1 / CC-BY-SA 3.0", credits)
        self.assertIn("synthetic voice", credits)
        lines = (out / "ledger.jsonl").read_text(encoding="utf-8").splitlines()
        self.assertEqual(len(lines), summary["assets"])


if __name__ == "__main__":
    unittest.main()
