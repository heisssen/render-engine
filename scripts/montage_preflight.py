"""Read-only montage prerequisites and timeline checks; no media or licence validation."""
import argparse
import json
import math
from pathlib import Path, PurePosixPath
import shutil


def positive_int(value):
    return type(value) is int and value > 0


def nonnegative_int(value):
    return type(value) is int and value >= 0


def finite_number(value, positive=False):
    # Reject magnitudes beyond exact JSON/JavaScript integer precision before
    # float conversion; malformed huge integers must not raise OverflowError.
    return type(value) in (int, float) and abs(value) <= 2**53 - 1 and math.isfinite(value) and (
        value > 0 if positive else value >= 0
    )


def relative_file(value):
    if (not isinstance(value, str) or not value or "\\" in value or ":" in value
            or any(ord(char) < 32 for char in value)):
        return False
    path = PurePosixPath(value)
    return not path.is_absolute() and ".." not in path.parts and "." != value


def inspect(project):
    root = Path(project)
    errors, warnings = [], []
    schemas = {}

    def read(relative, name):
        try:
            value = json.loads((root / relative).read_text(encoding="utf-8-sig"))
        except FileNotFoundError:
            schemas[name] = "missing"
            warnings.append(f"{name}: missing JSON")
            return None
        except (OSError, UnicodeError, ValueError, RecursionError):
            schemas[name] = "invalid"
            errors.append(f"{name}: unreadable or malformed JSON")
            return None
        schemas[name] = "ok"
        return value

    def invalid(name, message):
        schemas[name] = "invalid"
        errors.append(f"{name}: {message}")

    manifest = read("en/voice/manifest.json", "manifest")
    placement = read("en/voice/placement.json", "placement")
    timings = read("src/en/timings.json", "timings")
    fonts = read("src/en/fonts.json", "fonts")
    # JSON null is present but does not satisfy any input schema.
    for name, value in (("manifest", manifest), ("placement", placement),
                        ("timings", timings), ("fonts", fonts)):
        if value is None and schemas[name] == "ok":
            invalid(name, "expected array or object, got null")

    voice = {"total": 0, "available": 0, "missing": 0, "missing_sample": []}
    placed_voice = {"total": 0, "available": 0, "missing": 0, "missing_sample": []}
    if manifest is not None:
        if not isinstance(manifest, list) or not manifest:
            invalid("manifest", "expected nonempty array")
        else:
            voice["total"] = len(manifest)
            for i, row in enumerate(manifest):
                if not isinstance(row, dict) or not relative_file(row.get("file")):
                    invalid("manifest", f"row {i}: invalid relative file")
                    continue
                if not isinstance(row.get("section"), str) or not isinstance(row.get("speaker"), str):
                    invalid("manifest", f"row {i}: missing section/speaker")
                if not finite_number(row.get("dur"), positive=True):
                    invalid("manifest", f"row {i}: invalid duration")
                relative = "en/voice/" + row["file"]
                if (root / relative).is_file():
                    voice["available"] += 1
                else:
                    voice["missing"] += 1
                    if len(voice["missing_sample"]) < 5:
                        voice["missing_sample"].append(relative)
            if voice["missing"]:
                warnings.append(f"voice: {voice['missing']} manifest takes missing")

    rows_by_name = {}
    for name, data in (("placement", placement), ("timings", timings)):
        if data is None:
            continue
        if not isinstance(data, dict):
            invalid(name, "expected object")
            continue
        if type(data.get("fps")) is not int or data["fps"] != 30:
            invalid(name, "fps must be 30")
        total = data.get("total")
        if not positive_int(total):
            invalid(name, "total must be a positive integer")
        rows = data.get("beats")
        if not isinstance(rows, list) or not rows:
            invalid(name, "beats must be a nonempty array")
            continue
        rows_by_name[name] = rows
        if name == "placement":
            placed_voice["total"] = len(rows)
        previous_end = 0
        for i, row in enumerate(rows):
            if not isinstance(row, dict):
                invalid(name, f"beat {i}: expected object")
                continue
            if type(row.get("i")) is not int or row["i"] != i:
                invalid(name, f"beat {i}: index mismatch")
            if not isinstance(row.get("section"), str):
                invalid(name, f"beat {i}: missing section")
            if name == "timings":
                start, duration = row.get("from"), row.get("frames")
                valid = nonnegative_int(start) and positive_int(duration)
            else:
                start, duration = row.get("voiceAt"), row.get("dur")
                valid = finite_number(start) and finite_number(duration, positive=True)
                if not relative_file(row.get("file")) or not isinstance(row.get("speaker"), str):
                    invalid(name, f"beat {i}: invalid file/speaker")
                if relative_file(row.get("file")):
                    relative = "en/voice/" + row["file"]
                    if (root / relative).is_file():
                        placed_voice["available"] += 1
                    else:
                        placed_voice["missing"] += 1
                        if len(placed_voice["missing_sample"]) < 5:
                            placed_voice["missing_sample"].append(relative)
            if not valid:
                invalid(name, f"beat {i}: invalid start/duration")
                continue
            end = start + duration
            # Placement starts are rounded to milliseconds by timings.mjs.
            tolerance = 0.001 if name == "placement" else 0
            if start + tolerance < previous_end:
                invalid(name, f"beat {i}: overlaps previous beat")
            previous_end = end
            end_frames = end * 30 if name == "placement" else end
            if positive_int(total) and end_frames > total + tolerance * 30:
                invalid(name, f"beat {i}: exceeds total")
        for segment in ("sting", "end", "seal"):
            if segment not in data:
                continue
            entry = data[segment]
            if not isinstance(entry, dict) or not nonnegative_int(entry.get("from")) or not positive_int(entry.get("frames")):
                invalid(name, f"{segment}: invalid range")
            elif positive_int(total) and entry["from"] + entry["frames"] > total:
                invalid(name, f"{segment}: exceeds total")
    if placed_voice["missing"]:
        warnings.append(f"placed voice: {placed_voice['missing']} mix input takes missing")

    if isinstance(manifest, list):
        for name, rows in rows_by_name.items():
            if len(rows) != len(manifest):
                invalid(name, "beat count differs from manifest")
            for i, (source, row) in enumerate(zip(manifest, rows)):
                if isinstance(source, dict) and isinstance(row, dict) and source.get("section") != row.get("section"):
                    invalid(name, f"beat {i}: section differs from manifest")
                if name == "placement" and isinstance(source, dict) and isinstance(row, dict) and source.get("speaker") != row.get("speaker"):
                    invalid(name, f"beat {i}: speaker differs from manifest")
    if "placement" in rows_by_name and "timings" in rows_by_name:
        if placement.get("total") != timings.get("total"):
            invalid("timings", "total differs from placement")
        if len(rows_by_name["placement"]) != len(rows_by_name["timings"]):
            invalid("timings", "beat count differs from placement")
        for i, (audio, video) in enumerate(zip(rows_by_name["placement"], rows_by_name["timings"])):
            if isinstance(audio, dict) and isinstance(video, dict) and finite_number(audio.get("voiceAt")):
                if math.floor(audio["voiceAt"] * 30 + 0.5) != video.get("from"):
                    invalid("timings", f"beat {i}: start differs from placement")

    font_files = []
    if fonts is not None:
        if not isinstance(fonts, list) or not fonts:
            invalid("fonts", "expected nonempty array")
        else:
            for i, row in enumerate(fonts):
                if not isinstance(row, dict) or not relative_file(row.get("file")):
                    invalid("fonts", f"row {i}: invalid relative file")
                else:
                    font_files.append(root / "public" / row["file"])
    tools = {name: shutil.which(name) is not None for name in ("node", "npm", "ffmpeg", "ffprobe", "claude")}
    prerequisites = {
        "node_modules": (root / "node_modules").is_dir(),
        "geo": all((root / "src/en/geo" / name).is_file() for name in (
            "world1914.json", "land.json", "rivers.json", "lakes.json", "relief.json")),
        "fonts": bool(font_files) and schemas["fonts"] == "ok" and all(p.is_file() for p in font_files),
        "paper": (root / "public/paper_texture.jpg").is_file(),
        "relief": (root / "public/relief_baked.webp").is_file(),
        "mix": (root / "out/en/mix.wav").is_file(),
    }
    missing = [name for name, found in {**tools, **prerequisites}.items() if not found]
    if missing:
        warnings.append("missing prerequisites: " + ", ".join(missing))
    if any((root / "out/en/parts").glob("part*.mp4")):
        warnings.append("existing parts: resume does not validate source/settings; stale reuse is unsafe")
    if (root / "out/bundle/index.html").is_file():
        warnings.append("existing bundle: freshness is not verified")
    ready = (not errors and not missing and voice["missing"] == 0
             and placed_voice["missing"] == 0 and all(s == "ok" for s in schemas.values()))
    return {
        "status": "error" if errors else "warning" if warnings else "ok",
        "ready": ready, "schemas": schemas, "tools": tools,
        "prerequisites": prerequisites, "voice": voice, "placed_voice": placed_voice,
        "error_count": len(errors), "errors": errors[:12], "warnings": warnings[:12],
        "scope": "presence and timeline structure only; no media, licence, or full asset validation",
    }


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--require-ready", action="store_true")
    args = parser.parse_args(argv)
    report = inspect(args.project)
    print(json.dumps(report, ensure_ascii=True, separators=(",", ":")))
    return int(report["error_count"] > 0 or (args.require_ready and not report["ready"]))


if __name__ == "__main__":
    raise SystemExit(main())
