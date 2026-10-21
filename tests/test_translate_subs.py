"""Translation-cache regressions; all model calls are mocked and cost nothing."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from en import translate_subs


class TranslationCacheTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.cache = Path(directory.name)
        self.enterContext(patch.object(translate_subs, "CACHE", self.cache))
        self.prompt = self.enterContext(
            patch.object(translate_subs, "system_prompt", return_value="Translate briefly."))
        self.ask = self.enterContext(patch.object(translate_subs, "ask", return_value='{"1": "Bonjour"}'))
        self.batch = [{"id": 1, "text": "Hello"}]

    def translate(self, model="sonnet", before=None):
        return translate_subs.translate_batch("fr", model, self.batch, before or [])

    def test_identical_request_reuses_cache_without_model_call(self):
        expected = self.translate()
        self.assertEqual(self.translate(), expected)
        self.ask.assert_called_once()

    def test_model_context_source_and_prompt_each_invalidate_cache(self):
        self.translate()
        self.translate(model="haiku")
        self.translate(before=[{"id": 0, "text": "A greeting follows."}])
        self.batch[0]["text"] = "Good morning"
        self.translate()
        self.prompt.return_value = "Use formal greetings."
        self.translate()
        self.assertEqual(self.ask.call_count, 5)
        self.assertEqual(len(list(self.cache.glob("*.json"))), 5)

    def test_timing_only_change_reuses_cache(self):
        self.translate()
        self.batch[0].update(start=10, end=12)
        self.translate()
        self.ask.assert_called_once()

    def test_corrupt_or_incomplete_cache_is_rebuilt(self):
        self.translate()
        cache_file = next(self.cache.glob("*.json"))
        for content in ('{"1":', "[]", "{}", '{"1": null}', '{"1": ""}', '{"1": 42}'):
            with self.subTest(content=content):
                cache_file.write_text(content, encoding="utf-8")
                self.ask.reset_mock()
                self.assertEqual(self.translate(), {"1": "Bonjour"})
                self.ask.assert_called_once()
                self.assertEqual(json.loads(cache_file.read_text(encoding="utf-8")), {"1": "Bonjour"})
        self.assertFalse(list(self.cache.glob("*.tmp")))

    def test_invalid_translation_value_retries_only_missing_cue(self):
        self.batch.append({"id": 2, "text": "Goodbye"})
        self.ask.side_effect = ['{"1": "Bonjour", "2": null}', '{"2": "Au revoir"}']
        self.assertEqual(self.translate(), {"1": "Bonjour", "2": "Au revoir"})
        retry = self.ask.call_args.args[2].split("Translate these cues:\n", 1)[1]
        self.assertEqual(json.loads(retry), {"2": "Goodbye"})

    def test_failed_translation_does_not_cache_missing_cues(self):
        self.ask.return_value = '{"1": null}'
        with self.assertRaisesRegex(RuntimeError, "no translation for cue 1"):
            self.translate()
        self.assertEqual(self.ask.call_count, 4)
        self.assertFalse(list(self.cache.iterdir()))


if __name__ == "__main__":
    unittest.main()
