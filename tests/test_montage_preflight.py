"""Preflight tests use tiny JSON fixtures; no tools or media are executed."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location(
    "montage_preflight", Path(__file__).resolve().parents[1] / "scripts/montage_preflight.py")
preflight = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(preflight)


class PreflightTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.tools = patch.object(preflight.shutil, "which", return_value="tool")
        self.tools.start()
        self.addCleanup(self.tools.stop)

    def write(self, name, data=b"fixture"):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data if isinstance(data, bytes) else json.dumps(data).encode())

    def good(self):
        self.write("en/voice/manifest.json", [
            {"file": "take.mp3", "dur": 1, "section": "ACT I", "speaker": "NARRATOR"}])
        self.write("en/voice/placement.json", {"fps": 30, "total": 90, "beats": [
            {"i": 0, "file": "tempo/take.wav", "voiceAt": 1, "dur": 1, "section": "ACT I", "speaker": "NARRATOR"}]})
        self.write("src/en/timings.json", {"fps": 30, "total": 90, "beats": [
            {"i": 0, "from": 30, "frames": 60, "section": "ACT I"}]})
        self.write("src/en/fonts.json", [{"file": "fonts/test.woff2"}])
        for name in ("world1914.json", "land.json", "rivers.json", "lakes.json", "relief.json"):
            self.write("src/en/geo/" + name)
        for name in ("public/fonts/test.woff2", "public/paper_texture.jpg",
                     "public/relief_baked.webp", "out/en/mix.wav", "en/voice/take.mp3",
                     "en/voice/tempo/take.wav"):
            self.write(name)
        (self.root / "node_modules").mkdir()

    def run_cli(self, *flags):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            code = preflight.main(["--project", str(self.root), *flags])
        return code, json.loads(output.getvalue())

    def test_good_fixture_and_no_writes(self):
        self.good()
        before = {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()}
        code, report = self.run_cli("--require-ready")
        self.assertEqual(code, 0)
        self.assertTrue(report["ready"])
        self.assertEqual(report["voice"]["available"], 1)
        self.assertEqual(before, {p.relative_to(self.root): p.read_bytes() for p in self.root.rglob("*") if p.is_file()})

    def test_missing_inputs_warn_by_default_fail_when_required(self):
        code, report = self.run_cli()
        self.assertEqual(code, 0)
        self.assertFalse(report["ready"])
        self.assertEqual(report["schemas"]["manifest"], "missing")
        self.assertEqual(self.run_cli("--require-ready")[0], 1)

    def test_missing_placed_voice_fails_readiness_even_with_original_take(self):
        self.good()
        (self.root / "en/voice/tempo/take.wav").unlink()
        code, report = self.run_cli()
        self.assertEqual(code, 0)
        self.assertEqual(report["voice"]["available"], 1)
        self.assertEqual(report["placed_voice"]["missing"], 1)
        self.assertEqual(report["placed_voice"]["missing_sample"], ["en/voice/tempo/take.wav"])
        self.assertFalse(report["ready"])
        self.assertEqual(self.run_cli("--require-ready")[0], 1)

    def test_placement_speaker_must_match_manifest(self):
        self.good()
        path = self.root / "en/voice/placement.json"
        data = json.loads(path.read_text())
        data["beats"][0]["speaker"] = "KAISER"
        self.write("en/voice/placement.json", data)
        code, report = self.run_cli()
        self.assertEqual(code, 1)
        self.assertTrue(any("speaker differs from manifest" in error for error in report["errors"]))

    def test_malformed_null_and_wrong_shapes_are_errors(self):
        for payload in (b"{broken", b"null", b"42", b'{"beats":"oops"}'):
            with self.subTest(payload=payload):
                self.write("src/en/timings.json", payload)
                code, report = self.run_cli()
                self.assertEqual(code, 1)
                self.assertEqual(report["schemas"]["timings"], "invalid")

    def test_timing_index_overlap_total_fps_and_count_failures(self):
        self.good()
        self.write("src/en/timings.json", {"fps": 24, "total": 60, "beats": [
            {"i": 1, "from": 30, "frames": 40, "section": "ACT I"},
            {"i": 1, "from": 40, "frames": 1, "section": "ACT I"}]})
        code, report = self.run_cli()
        self.assertEqual(code, 1)
        errors = " ".join(report["errors"])
        for expected in ("fps", "index mismatch", "overlaps", "exceeds total", "count differs", "total differs"):
            self.assertIn(expected, errors)

    def test_placement_start_mismatch_and_invalid_duration(self):
        self.good()
        self.write("en/voice/placement.json", {"fps": 30, "total": 90, "beats": [
            {"i": 0, "file": "tempo/take.wav", "voiceAt": 2, "dur": -1, "section": "ACT I", "speaker": "NARRATOR"}]})
        code, report = self.run_cli()
        self.assertEqual(code, 1)
        self.assertTrue(any("invalid start/duration" in e for e in report["errors"]))
        self.assertTrue(any("start differs" in e for e in report["errors"]))

    def test_missing_voice_output_is_bounded_and_contains_no_text(self):
        self.good()
        self.write("en/voice/manifest.json", [
            {"file": f"{i}.mp3", "dur": 1, "section": "ACT I", "speaker": "NARRATOR",
             "text": "PRIVATE VOICE TEXT", "plain": "PRIVATE VOICE TEXT"} for i in range(8)])
        _, report = self.run_cli()
        self.assertEqual(report["voice"]["missing"], 8)
        self.assertEqual(len(report["voice"]["missing_sample"]), 5)
        self.assertNotIn("PRIVATE VOICE TEXT", json.dumps(report))

    def test_paths_cannot_escape_voice_root(self):
        self.good()
        for filename in ("../.env", "bad\x00file.mp3", "C:/outside.mp3"):
            with self.subTest(filename=filename):
                self.write("en/voice/manifest.json", [{"file": filename, "dur": 1, "section": "ACT I", "speaker": "NARRATOR"}])
                self.assertEqual(self.run_cli()[0], 1)

    def test_nonfinite_huge_and_boolean_values_are_invalid(self):
        self.good()
        for duration in (float("inf"), float("nan"), 10**400, True):
            with self.subTest(duration=duration):
                self.write("en/voice/manifest.json", [
                    {"file": "take.mp3", "dur": duration, "section": "ACT I", "speaker": "NARRATOR"}])
                self.assertEqual(self.run_cli()[0], 1)

    def test_existing_outputs_warn_without_reading_media(self):
        self.good()
        self.write("out/en/parts/part00.mp4")
        self.write("out/bundle/index.html")
        code, report = self.run_cli()
        self.assertEqual(code, 0)
        self.assertTrue(any("stale reuse" in w for w in report["warnings"]))
        self.assertTrue(any("freshness" in w for w in report["warnings"]))


if __name__ == "__main__":
    unittest.main()
