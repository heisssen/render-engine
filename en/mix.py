"""Mix the EN soundtrack: voice placed from en/voice/placement.json, one music bed per act (ducked under the
voice), ident/act-break/telegram/stamp effects. Writes out/en/mix.wav (48 kHz stereo, -14 LUFS).

  py -3.12 en/mix.py
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal as sig

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
FPS = 30


def load(path: Path, mono: bool = False) -> np.ndarray:
    ch = 1 if mono else 2
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", str(ch), "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.float32).copy()
    return a.reshape(-1, ch) if not mono else a


def place(buf: np.ndarray, clip: np.ndarray, at_s: float, gain: float = 1.0) -> None:
    i = int(at_s * SR)
    if i >= len(buf) or i + len(clip) <= 0:
        return
    if i < 0:
        clip, i = clip[-i:], 0
    n = min(len(clip), len(buf) - i)
    if clip.ndim == 1:
        clip = np.stack([clip, clip], 1)
    buf[i:i + n] += clip[:n] * gain


# ---------- synthesized effects for the ident ----------
def chug(dur=1.2, rate=7.5) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    noise = np.random.default_rng(1).standard_normal(len(t))
    env = np.zeros_like(t)
    for k in range(int(dur * rate)):
        c = k / rate
        env += np.exp(-np.maximum(0, t - c) * 28) * (t >= c)
    # band-limit the hiss: vectorized one-pole low-pass
    a = 0.08
    y = sig.lfilter([a], [1.0, -(1.0 - a)], noise)
    return (y * env * 0.9).astype(np.float32)


def clack() -> np.ndarray:
    t = np.arange(int(0.25 * SR)) / SR
    s = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 40) + np.random.default_rng(2).standard_normal(len(t)) * np.exp(-t * 90) * 0.6
    return (s * 0.8).astype(np.float32)


def clunk() -> np.ndarray:
    """A heavy iron lever slamming home: low thud + metallic ring + a short rattle."""
    t = np.arange(int(0.9 * SR)) / SR
    thud = np.sin(2 * np.pi * 62 * t) * np.exp(-t * 9)
    ring = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(410, 0.35), (1130, 0.18), (2270, 0.08)]) * np.exp(-t * 7)
    rattle = np.random.default_rng(5).standard_normal(len(t)) * np.exp(-t * 35) * 0.5
    return ((thud * 1.0 + ring + rattle) * 0.7).astype(np.float32)


def hum(dur=5.0) -> np.ndarray:
    """Signal-box room tone: mains hum with a slow swell."""
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * 50 * t) * 0.6 + np.sin(2 * np.pi * 100 * t) * 0.3 + np.sin(2 * np.pi * 150 * t) * 0.1
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8)
    return (s * env * 0.25).astype(np.float32)


def bell() -> np.ndarray:
    t = np.arange(int(1.6 * SR)) / SR
    s = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(1320, 0.5), (2640, 0.25), (3960, 0.12), (1980, 0.18)])
    return (s * np.exp(-t * 3.2) * 0.35).astype(np.float32)


def whoosh(dur=0.7) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    n = np.random.default_rng(3).standard_normal(len(t))
    env = np.sin(np.pi * t / dur) ** 2
    y = np.zeros_like(n)
    for i in range(1, len(n)):
        a = 0.02 + 0.25 * (i / len(n))
        y[i] = y[i - 1] + a * (n[i] - y[i - 1])
    return (y * env * 0.5).astype(np.float32)


def swell(dur=0.7) -> np.ndarray:
    """A soft rising air swell for a film-burn cut: band-limited noise that grows into the cut and falls away."""
    t = np.arange(int(dur * SR)) / SR
    n = np.random.default_rng(int(dur * 997)).standard_normal(len(t))
    lo = sig.lfilter([0.06], [1.0, -0.94], n)
    env = np.where(t < dur * 0.6, (t / (dur * 0.6)) ** 2, np.exp(-(t - dur * 0.6) * 9))
    return (lo * env * 0.8).astype(np.float32)


def hit() -> np.ndarray:
    """A short low impact for a white flash cut."""
    t = np.arange(int(0.6 * SR)) / SR
    s = np.sin(2 * np.pi * (48 + 30 * np.exp(-t * 20)) * t) * np.exp(-t * 7)
    s += np.random.default_rng(9).standard_normal(len(t)) * np.exp(-t * 60) * 0.25
    return (s * 0.8).astype(np.float32)


def breath(dur: float) -> np.ndarray:
    t = np.arange(int(dur * SR)) / SR
    n = np.random.default_rng(int(dur * 1000)).standard_normal(len(t))
    # band-pass-ish: difference of two one-pole low-passes ~ 600 Hz .. 4 kHz
    a1, a2 = 0.40, 0.07
    lo1 = sig.lfilter([a1], [1.0, -(1.0 - a1)], n)
    lo2 = sig.lfilter([a2], [1.0, -(1.0 - a2)], n)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6 * (0.6 + 0.4 * t / dur)
    return ((lo1 - lo2) * env * 0.022).astype(np.float32)


# studio-narrator chain: warmer low end, softer 3-8 kHz edge, de-essed, gently compressed,
# a hint of a small room and tape-like saturation, so the AI voice doesn't float in a vacuum
VOICE_CHAIN = ("highpass=f=75,lowpass=f=15500,"
               "equalizer=f=140:t=q:w=0.9:g=2.2,equalizer=f=3200:t=q:w=1.4:g=-2,equalizer=f=7500:t=q:w=1.2:g=-1.5,"
               "deesser=i=0.35:m=0.5:f=0.5,"
               "acompressor=threshold=-21dB:ratio=2.2:attack=6:release=140:makeup=1.5,"
               "aecho=0.85:0.6:18|31|47:0.07|0.05|0.035,"
               "asoftclip=type=tanh:threshold=0.92")


def humanize(v: np.ndarray) -> np.ndarray:
    tmp_in = ROOT / f"out/en/voice_raw_{os.getpid()}.f32"  # per process: several mixes may run at once
    tmp_out = ROOT / f"out/en/voice_fx_{os.getpid()}.f32"
    tmp_in.parent.mkdir(parents=True, exist_ok=True)
    v[:, 0].astype(np.float32).tofile(tmp_in)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", str(tmp_in),
                    "-af", VOICE_CHAIN, "-f", "f32le", "-ar", str(SR), "-ac", "1", str(tmp_out)], check=True)
    out = np.fromfile(tmp_out, dtype=np.float32)
    tmp_in.unlink(); tmp_out.unlink()
    res = np.zeros_like(v)
    n = min(len(out), len(v))
    res[:n, 0] = out[:n]
    res[:n, 1] = out[:n]
    return res


def typical_db(x: np.ndarray) -> float:
    """Typical loudness of a signal: the 70th percentile of 400 ms block RMS over its non-silent blocks, in dBFS."""
    n = int(0.4 * SR)
    k = len(x) // n
    if k == 0:
        return -30.0
    rms = np.sqrt((x[: k * n].reshape(k, n).astype(np.float64) ** 2).mean(1) + 1e-12)
    db = 20 * np.log10(rms)
    db = db[db > -50]
    return float(np.percentile(db, 70)) if len(db) else -30.0


def loop_xfade(trk: np.ndarray, length: int, xf: int) -> np.ndarray:
    """Repeat a track to `length` samples, crossfading each seam over `xf` samples."""
    xf = min(xf, len(trk) // 4)
    out = trk.copy()
    ramp = np.linspace(0, 1, xf)[:, None]
    while len(out) < length:
        out = np.concatenate([out[:-xf], out[-xf:] * (1 - ramp) + trk[:xf] * ramp, trk[xf:]])
    return out[:length].copy()


def duck_gain(v: np.ndarray, vref: float, duck_db: float) -> np.ndarray:
    """Per-sample music gain: duck_db while speech is present (blocks within 22 dB of the voice's typical level)."""
    blk = int(0.01 * SR)
    k = len(v) // blk + 1
    pad = np.zeros(k * blk, np.float32)
    pad[: len(v)] = v
    db = 20 * np.log10(np.sqrt((pad.reshape(k, blk).astype(np.float64) ** 2).mean(1)) + 1e-9)
    speech = (db > vref - 22).astype(np.float64)
    # hold short gaps between words (< 350 ms) as speech, then look ahead 120 ms
    hold = 35
    for i in range(1, k):
        if not speech[i] and speech[i - 1]:
            j = min(k, i + hold)
            if speech[i:j].any():
                speech[i:j] = 1
    speech = np.concatenate([speech[12:], np.zeros(12)])
    target = np.where(speech > 0, duck_db, 0.0)
    g = np.empty(k)
    cur = 0.0
    a_dn, a_up = 1 - np.exp(-1 / 6), 1 - np.exp(-1 / 70)  # 60 ms attack, 700 ms release (10 ms steps)
    for i in range(k):
        cur += (target[i] - cur) * (a_dn if target[i] < cur else a_up)
        g[i] = cur
    gl = 10 ** (g / 20)
    return np.interp(np.arange(len(v)), np.arange(k) * blk, gl).astype(np.float32)


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--placement", default=str(ROOT / "en/voice/placement.json"), help="a dub's placement (en/dub.py)")
    ap.add_argument("--out", default=str(ROOT / "out/en/mix.wav"))
    args = ap.parse_args()
    pl = json.loads(Path(args.placement).read_text(encoding="utf-8"))
    total_s = pl["total"] / FPS
    N = int(total_s * SR) + SR
    voice = np.zeros((N, 2), np.float32)
    rng = np.random.default_rng(11)
    for k, b in enumerate(pl["beats"]):
        place(voice, load(ROOT / "en/voice" / b["file"], mono=True), b["voiceAt"], 1.0)
        # a soft breath before some narrator paragraphs: real narrators breathe, TTS doesn't
        if b["speaker"] == "NARRATOR" and k and (b["section"] != pl["beats"][k - 1]["section"] or rng.random() < 0.38):
            place(voice, breath(0.36 + rng.random() * 0.12), b["voiceAt"] - 0.44, 0.9)
    voice = humanize(voice)

    # ---------- music: one bed per section, crossfaded; silence at the act breaks ----------
    acts = pl["acts"]
    sting = pl["sting"]
    end_voice = max(b["voiceAt"] + b["dur"] for b in pl["beats"])
    sections = [
        ("despair", 0.0, sting["from"] / FPS, 0.16),
        ("longnote4", (sting["from"] + sting["frames"]) / FPS, acts[1]["from"] / FPS, 0.22),
        ("heavy", acts[1]["from"] / FPS, acts[2]["from"] / FPS, 0.10),
        ("echoes", acts[2]["from"] / FPS, end_voice + 22, 0.12),
    ]
    # every bed is levelled to the same typical loudness (the tracks differ by many dB), sits BED_DB under the voice's
    # typical level, loops with a 3 s crossfade (no hard restart at the seam) and fades in and out over 3 s
    BED_DB = -15.0  # music under-voice level between phrases, relative to the voice
    DUCK_DB = -10.0  # extra attenuation while someone is speaking
    vref = typical_db(voice[:, 0])
    music = np.zeros((N, 2), np.float32)
    for name, a, b, _ in sections:
        trk = load(ROOT / "public/music" / f"{name}.mp3")
        length = int((b - a) * SR)
        if length <= 0:
            continue
        bed = loop_xfade(trk, length, int(3.0 * SR))
        gain = 10 ** ((vref + BED_DB - typical_db(bed.mean(1))) / 20)
        fi, fo = min(int(3.0 * SR), len(bed) // 3), min(int(2.0 * SR), len(bed) // 3)
        bed[:fi] *= np.linspace(0, 1, fi)[:, None] ** 2
        bed[-fo:] *= np.linspace(1, 0, fo)[:, None]
        place(music, bed, a, gain)

    # duck under the voice like a sidechain compressor: speech detected on 10 ms blocks, 120 ms look-ahead,
    # 60 ms attack down, 700 ms release back up, so music never jumps in between two sentences
    music *= duck_gain(voice[:, 0], vref, DUCK_DB)[:, None]
    # the story's switch points: the music drops out for a second before the cut, then swells back over 3 s
    for tr in pl.get("transitions", []):
        if tr["type"] != "silence":
            continue
        at = int(tr["at"] / FPS * SR)
        g = np.ones(N, np.float32)
        a, b, c = max(0, at - int(1.25 * SR)), max(0, at - SR), min(N, at + int(3.0 * SR))
        g[a:b] = np.linspace(1, 0, b - a)
        g[b:at] = 0
        g[at:c] = np.linspace(0, 1, c - at) ** 2
        music *= g[:, None]

    # ---------- effects ----------
    fx = np.zeros((N, 2), np.float32)
    s0 = sting["from"] / FPS
    # signal-box ident (src/en/Ident.tsx IDENT_T): room hum, lever thrown, relays, lamp bell, letters, fly-in
    place(fx, hum(6.2), s0, 0.35)
    place(fx, clack(), s0 + 40 / FPS, 0.25)  # hand on the lever
    place(fx, clunk(), s0 + 68 / FPS, 1.0)
    for k in (70, 75, 80):
        place(fx, clack(), s0 + k / FPS, 0.45)
    place(fx, bell(), s0 + 106 / FPS, 0.6)
    for i in range(10):  # sign letters lighting up
        place(fx, clack(), s0 + (110 + i * 2.4) / FPS, 0.15)
    place(fx, whoosh(0.9), s0 + 168 / FPS, 0.55)
    for a in acts[1:]:
        place(fx, whoosh(0.7), a["from"] / FPS - 0.9, 0.55)
        place(fx, clack(), a["from"] / FPS - 0.45, 0.8)
    # the cut (planned by en/timings.mjs): sparse accents only on the few marked transitions (edit bible: no
    # whoosh on every cut); plain cuts and archival inserts stay clean
    whip_s, push_s, swell_s, hit_s = whoosh(0.45), whoosh(0.8), swell(0.7), hit()
    for tr in pl.get("transitions", []):
        at = tr["at"] / FPS
        if tr["type"] == "whip":
            place(fx, whip_s, at - 0.3, 0.35)
        elif tr["type"] == "match":
            place(fx, push_s, at - 0.8, 0.2)
        elif tr["type"] == "silence":
            place(fx, hit_s, at, 0.5)  # the music has dropped out for a second (see the ducking below)
        elif tr["type"] == "flash":
            place(fx, hit_s, at, 0.45)
    # flash-forward: a hit on every shot; kinetic keywords: a lighter hit as the words slam in
    if pl.get("tease"):
        for i in range(len(pl["tease"]["shots"])):
            place(fx, hit_s, i * pl["tease"]["shot"] / FPS, 0.55)
            place(fx, swell_s, i * pl["tease"]["shot"] / FPS - 0.5, 0.15)
    for kw in pl.get("keywords", []):
        place(fx, hit_s, kw["at"] / FPS, 0.3)
    sfx = ROOT / "public/sfx"
    key, stamp = load(sfx / "key.wav"), load(sfx / "stamp.wav")
    story = (ROOT / "src/en/story.ts").read_text(encoding="utf-8")
    # which beats are telegrams / documents: count STORY entries in order
    kinds = []
    body = story[story.index("export const STORY"):]
    import re
    for m in re.finditer(r"^\t(\{k: '(\w+)'|ph\(|film\(|map\()", body, re.M):
        kinds.append(m.group(2) or {"ph(": "photo", "film(": "film", "map(": "map"}[m.group(1)])
    for b, k in zip(pl["beats"], kinds):
        t = b["voiceAt"]
        if k == "telegram":
            for j in range(int(b["dur"] * 0.5 * 9)):
                place(fx, key, t + 0.4 + j / 9 + (j % 3) * 0.013, 0.10)
        if k == "doc":
            place(fx, stamp, t + b["dur"] * 0.55, 0.5)

    mix = voice + music + fx
    tmp = Path(args.out).with_suffix(".f32")
    tmp.parent.mkdir(parents=True, exist_ok=True)
    mix.astype(np.float32).tofile(tmp)
    out = Path(args.out)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", str(tmp),
                    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", str(SR), str(out)], check=True)
    tmp.unlink()
    print(f"mix {total_s / 60:.2f} min -> {out}")


if __name__ == "__main__":
    main()
