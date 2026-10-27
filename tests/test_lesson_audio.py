import contextlib
import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('lesson_audio', Path(__file__).resolve().parents[1] / 'scripts/lesson_audio.py')
audio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audio)


class AudioInventoryTests(unittest.TestCase):
    def test_inventory_covers_every_lesson_and_deduplicates(self):
        inventory = audio.speech_inventory()
        origins = {origin.split(':')[0] for item in inventory.values() for origin in item['origins']}
        for unit_id in __import__('json').loads((audio.ROOT / 'content/course.json').read_text())['unitIds']:
            for number in range(1, 4):
                self.assertIn(f'{unit_id}-{number:02}', origins)
        self.assertEqual(len(inventory), len({audio.normalize(item['text']) for item in inventory.values()}))

    def test_normalization_matches_client_apostrophes_and_spaces(self):
        self.assertEqual(audio.normalize('  What’s   your name? '), "what's your name?")

    def test_manifest_rejects_paths_outside_public_audio(self):
        for path in ['/etc/passwd', '/audio/../../.env.local', 'https://example.com/audio.mp3']:
            with self.assertRaises(ValueError):
                audio.manifest_path(path)

    def test_existing_audio_is_valid(self):
        import json
        manifest = json.loads(audio.MANIFEST.read_text())
        for clip in manifest['clips'].values():
            self.assertTrue(audio.valid_audio(audio.manifest_path(clip['path'])))

    def test_every_published_speech_target_has_a_recording(self):
        import json
        manifest = json.loads(audio.MANIFEST.read_text())
        for key, item in audio.speech_inventory().items():
            with self.subTest(text=item['text']):
                self.assertIn(key, manifest['clips'])
                self.assertTrue(audio.valid_audio(audio.manifest_path(manifest['clips'][key]['path'])))

    def test_extracted_clips_have_valid_audio_and_verified_boundaries(self):
        import json
        import wave
        manifest = json.loads(audio.MANIFEST.read_text())
        for clip in manifest['clips'].values():
            if 'segmentStart' not in clip:
                continue
            with self.subTest(text=clip['text']):
                self.assertTrue(clip['transcriptVerified'])
                self.assertLess(clip['segmentStart'], clip['segmentEnd'])
                with wave.open(str(audio.manifest_path(clip['path']))) as recording:
                    self.assertEqual(recording.getnchannels(), 1)
                    self.assertEqual(recording.getsampwidth(), 2)
                    self.assertGreater(recording.getnframes(), 0)
                    expected_duration = clip['segmentEnd'] - clip['segmentStart'] + 0.18
                    self.assertAlmostEqual(recording.getnframes() / recording.getframerate(), expected_duration, places=3)

    def test_missing_key_does_not_start_generation(self):
        with patch.dict('os.environ', {}, clear=True), patch('sys.argv', ['lesson_audio.py', '--generate']), patch.object(audio, 'urlopen') as request, contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(audio.main(), 2)
            request.assert_not_called()

    def test_voice_identifier_must_come_from_the_live_account_list(self):
        voices = [{'voice_id': 'available', 'name': 'Narrator', 'category': 'premade', 'labels': {'accent': 'british', 'description': 'clear'}}]
        self.assertEqual(audio.choose_voice(voices, None)['voice_id'], 'available')
        with self.assertRaises(ValueError):
            audio.choose_voice(voices, 'invented')


if __name__ == '__main__':
    unittest.main()
