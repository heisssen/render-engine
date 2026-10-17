"""Spoken years -> digits in the EN subtitles ("nineteen fourteen" -> "1914"). The script spells years out for the
voice; readers want digits. Run after en/subs.py:  py -3.12 en/subs_years.py
"""
import re
from pathlib import Path

SUBS = Path(__file__).resolve().parents[1] / "out" / "en" / "subs"
UNITS = {w: i for i, w in enumerate("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split())}
TENS = {"twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90}
CENT = {"seventeen": 17, "eighteen": 18, "nineteen": 19}
two = r"(?:(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|oh[- ](?:one|two|three|four|five|six|seven|eight|nine))"
PAT = re.compile(rf"\b(seventeen|eighteen|nineteen)\s+({two})\b", re.I)


def val(t: str) -> int:
    t = t.lower().replace("-", " ").split()
    if t[0] == "oh":
        return UNITS[t[1]]
    if t[0] in TENS:
        return TENS[t[0]] + (UNITS[t[1]] if len(t) > 1 else 0)
    return UNITS[t[0]]


def fix(text: str) -> str:
    return PAT.sub(lambda m: str(CENT[m.group(1).lower()] * 100 + val(m.group(2))), text)


for name in ("en.srt", "en.vtt"):
    p = SUBS / name
    s = p.read_text(encoding="utf-8")
    n = len(PAT.findall(s))
    p.write_text(fix(s), encoding="utf-8")
    print(f"{name}: {n} years -> digits")
