#!/usr/bin/env python3
"""Inventory, generate and verify the curriculum's recorded English speech.

Uses only Python's standard library. The API key stays in ELEVENLABS_API_KEY,
never in the client, command line, generated assets, manifest, or log output.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'content/audio-manifest.json'
API = 'https://api.elevenlabs.io/v1'
MODEL = 'eleven_multilingual_v2'


def normalize(text):
    return re.sub(r'\s+', ' ', text.strip().replace('’', "'")).lower()


def speech_inventory():
    """Mirror every current onSpeak target, plus the vocabulary audio contract."""
    found = {}

    def add(text, origin):
        if isinstance(text, str) and text.strip():
            key = normalize(text)
            if key not in found:
                found[key] = {'text': text.strip(), 'origins': []}
            if origin not in found[key]['origins']:
                found[key]['origins'].append(origin)

    course = json.loads((ROOT / 'content/course.json').read_text())
    for unit_id in course['unitIds']:
        unit = json.loads((ROOT / 'content/units' / (unit_id + '.json')).read_text())
        for lesson_id in unit['lessonIds']:
            lesson = json.loads((ROOT / 'content/lessons' / (lesson_id + '.json')).read_text())
            for phase in ['setup', 'resolution']:
                for line in lesson['storyScene'][phase]:
                    add(line['text'], lesson_id + ':scene:' + phase)
            add(lesson['readingCheckpoint']['audioText'], lesson_id + ':reading')
            for exercise in lesson['exercises']:
                add(exercise.get('audioText'), exercise['id'])
    for word in json.loads((ROOT / 'content/vocabulary.json').read_text()):
        add(word['audioText'], 'vocabulary:' + word['id'])
    return found


def manifest_path(value):
    """Only permit assets within public/audio; never arbitrary file paths."""
    if not isinstance(value, str) or not value.startswith('/audio/'):
        raise ValueError('Invalid audio asset path')
    path = (ROOT / 'public' / value.lstrip('/')).resolve()
    if not path.is_relative_to((ROOT / 'public/audio').resolve()):
        raise ValueError('Audio asset escapes public/audio')
    return path


def valid_audio(path):
    if not path.is_file() or path.stat().st_size < 128:
        return False
    with path.open('rb') as audio:
        header = audio.read(12)
    return header[:3] == b'ID3' or (header[0] == 0xff and header[1] & 0xe0 == 0xe0) or (header[:4] == b'RIFF' and header[8:12] == b'WAVE')


def write_manifest(manifest):
    temporary = MANIFEST.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(MANIFEST)


def request_json(path, key):
    request = Request(API + path, headers={'xi-api-key': key, 'Accept': 'application/json'})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def choose_voice(voices, requested):
    if requested:
        selected = next((v for v in voices if v['voice_id'] == requested), None)
        if not selected:
            raise ValueError('Requested voice is not available to this ElevenLabs account')
        return selected
    # Prefer an existing clear, neutral English narration voice. No cloning or
    # custom voices are created; the identifiers always come from the live API.
    def score(voice):
        labels = voice.get('labels', {})
        description = ' '.join(str(v) for v in labels.values()).lower() + ' ' + str(voice.get('description', '')).lower()
        result = 0
        for keyword, weight in [('english', 10), ('american', 8), ('british', 8), ('clear', 5), ('educational', 8), ('narration', 5), ('calm', 3), ('neutral', 3), ('warm', 2)]:
            if keyword in description:
                result += weight
        if voice.get('category') == 'premade':
            result += 3
        return result
    eligible = [v for v in voices if v.get('category') in ['premade', 'professional']]
    if not eligible:
        raise ValueError('No suitable existing voice is available; supply --voice-id from --voices')
    return sorted(eligible, key=lambda v: (-score(v), v.get('name', ''), v['voice_id']))[0]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--generate', action='store_true', help='Generate missing clips with ElevenLabs; consumes credits')
    mode.add_argument('--verify', action='store_true', help='Fail if any curriculum clip is missing or invalid')
    mode.add_argument('--voices', action='store_true', help='List voices from the authenticated ElevenLabs account')
    parser.add_argument('--voice-id', help='Existing voice identifier from the account voice list')
    parser.add_argument('--limit', type=int, help='Generate at most this many missing clips')
    parser.add_argument('--plan-file', type=Path, help='Write the deduplicated text inventory to this JSON file')
    args = parser.parse_args()
    inventory = speech_inventory()
    manifest = json.loads(MANIFEST.read_text())
    clips = manifest['clips']
    missing = {key: item for key, item in inventory.items() if key not in clips or not valid_audio(manifest_path(clips[key]['path']))}
    characters = sum(len(item['text']) for item in missing.values())
    print(f"{len(inventory)} unique texts; {len(inventory) - len(missing)} recorded; {len(missing)} missing; {characters} characters remaining.")
    if args.plan_file:
        args.plan_file.write_text(json.dumps({'texts': inventory, 'missing': list(missing)}, ensure_ascii=False, indent=2) + '\n')
    if args.verify:
        for key in list(missing)[:10]:
            print('Missing:', inventory[key]['text'])
        return 1 if missing else 0
    if not (args.generate or args.voices):
        return 0
    key = os.environ.get('ELEVENLABS_API_KEY')
    if not key:
        print('Blocked: ELEVENLABS_API_KEY is not configured. No generation was attempted.', file=sys.stderr)
        return 2
    voices = request_json('/voices', key).get('voices', [])
    if args.voices:
        for voice in voices:
            print(json.dumps({k: voice.get(k) for k in ['voice_id', 'name', 'category', 'labels']}, ensure_ascii=False))
        return 0
    if not missing:
        return 0
    if args.limit is not None and args.limit <= 0:
        raise ValueError('--limit must be positive')
    voice = choose_voice(voices, args.voice_id)
    print('Voice:', voice.get('name', ''), voice['voice_id'], '| Model:', MODEL)
    pending = list(missing.items())[:args.limit] if args.limit else list(missing.items())
    # Refuse to buy extra credits implicitly. Stop before the batch when the
    # remaining included character allowance cannot cover it.
    subscription = request_json('/user/subscription', key)
    allowance = subscription.get('character_limit')
    used = subscription.get('character_count')
    if not isinstance(allowance, int) or not isinstance(used, int):
        raise ValueError('Cannot verify remaining ElevenLabs allowance; no generation started')
    required = sum(len(item['text']) for _, item in pending)
    if required > max(0, allowance - used):
        raise ValueError(f'Insufficient included credits: {required} characters needed, {max(0, allowance - used)} available')
    for index, (text_key, item) in enumerate(pending, start=1):
        digest = hashlib.sha256(text_key.encode()).hexdigest()[:20]
        public_path = f'/audio/elevenlabs/{digest}.mp3'
        output = manifest_path(public_path)
        uncertain = output.with_suffix('.uncertain')
        if uncertain.exists():
            raise ValueError(f'Previous request outcome uncertain for {public_path}; inspect ElevenLabs history before retrying')
        if output.exists():
            raise ValueError(f'Unindexed audio already exists: {public_path}; inspect before making another paid request')
        output.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps({'text': item['text'], 'model_id': MODEL, 'voice_settings': {'stability': 0.65, 'similarity_boost': 0.75, 'style': 0.0, 'speed': 1.0, 'use_speaker_boost': True}}).encode()
        request = Request(API + '/text-to-speech/' + voice['voice_id'] + '?output_format=mp3_44100_128', data=payload, method='POST', headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
        # A network timeout may still have consumed credits. Persist the intent
        # before POST and never retry uncertain paid requests automatically.
        uncertain.write_text(json.dumps({'text': item['text'], 'voiceId': voice['voice_id'], 'modelId': MODEL}))
        try:
            with urlopen(request, timeout=90) as response:
                audio = response.read()
                request_id = response.headers.get('request-id')
            temporary = output.with_suffix('.mp3.tmp')
            temporary.write_bytes(audio)
            if not valid_audio(temporary):
                raise ValueError('ElevenLabs returned an invalid or empty audio file')
            temporary.replace(output)
            clips[text_key] = {'path': public_path, 'source': 'elevenlabs', 'text': item['text'], 'voiceId': voice['voice_id'], 'modelId': MODEL, 'requestId': request_id}
            write_manifest(manifest)
            uncertain.unlink()
        except HTTPError as error:
            # Non-success responses do not prove the synthesis completed.
            # Keep the marker for ambiguous server outcomes, clear rejected input.
            if error.code in [400, 401, 403, 404, 422, 429]:
                uncertain.unlink()
            raise
        print(f'{index}/{len(pending)} saved {public_path}', flush=True)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except HTTPError as error:
        # Avoid echoing headers, request bodies, credentials or provider payloads.
        print(f'ElevenLabs HTTP {error.code}; stopped without automatic retry.', file=sys.stderr)
        sys.exit(2)
    except (URLError, ValueError, TimeoutError, OSError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(2)
