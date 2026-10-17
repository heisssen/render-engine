# Lessons, or: things that went wrong in October 2026

Every rule in this repo has a story. These are the ones worth keeping. Dates are when it happened on the first
episode; "mid-October" means the notes don't say exactly and nobody is going to pretend otherwise.

## The film that was all placeholders (13 Oct)

`timings.mjs` measures every clip with ffprobe to know how long it can loop. It ran while the clip cutter was still
encoding, ffprobe found no `moov` atom, the clips were skipped, and the first full preview was 39 grey boxes saying
`clip: en/red_trousers`. Now an unreadable clip is skipped quietly *during* encoding, and an insert or backdrop that
names a missing clip stops the build with its name. Rule: re-run `timings.mjs` after adding clips. Always.

## The ident was too fast (13 Oct)

The first ident ran 5.5 s and the verdict was: too fast. It is 6.5 s now (`IDENT_FRAMES = 195`), with longer
holds on the lever, the switch and the letters, and the mix's lever clunk and relay clicks are timed to the same
frames as the animation (`IDENT_T` in `Ident.tsx`, the offsets in `mix.py`). If you change one, change the other.

## The 3D map that put the French at Tannenberg (15 Oct)

A three.js "tactical map" was tried for the pseudo-3D look. It took 3.5 minutes per half-resolution frame, which
puts a 25-minute film at roughly three and a half months, and in its first test it placed French troops at Tannenberg and the
Russians under a red flag three years early. It was shelved. The staff maps stayed 2D, drawn with d3-geo, and got
better instead.

## Maps at 4.8 seconds per frame (15 Oct)

At 30 fps that is about 60 hours for the film. The fixes, measured with `scripts/bench_map.ps1`:

- clip every shape at the screen edge (`clipExtent`) so the browser stops drawing Siberia off-screen;
- bake the three relief layers (tint, multiply shadow, screen highlight) into one plain RGBA image
  (`en/bake_relief.py`; the maths is in its docstring: the stack is affine in the wash colour, so one alpha layer
  reproduces it);
- two coastline strokes instead of four;
- wobble the arrow edges in JavaScript instead of an SVG `feTurbulence` filter.

Result: about 0.9 s per frame. The `mapOff` input prop can switch each fix off for an A/B.

## Zombie browsers (15 Oct)

A killed render leaves its `chrome-headless-shell` processes running, and they keep burning CPU for nothing. The
render scripts kill them before a retry; do the same by hand before starting a new render.

## Deleting a bundle can hang forever (mid-October)

`Remove-Item -Recurse` on an old Remotion bundle sometimes never returns on Windows: a file is still locked by
something (an indexer, an antivirus, a browser that never died). The fix is to stop deleting: after a code change,
bundle into a new folder (`-Bundle out/bundle2`) and clean up later when nothing is running.

## Google Fonts reset mid-render (15 Oct)

Frames rendered while `fonts.gstatic.com` was timing out came out in a fallback font, and a film where three minutes
are in the wrong typeface is a film you render again. `scripts/fetch_fonts.mjs` downloads the five families
into `public/fonts/` and `theme.ts` loads them with `delayRender`, so a render never touches the network for fonts.

## The 81-paragraph cut (15 Oct)

The script went from 91 paragraphs to 81 after an audience-panel review. Because takes are cached by a hash of their text, and
a moved paragraph's take is renamed rather than re-voiced, only the 26 changed paragraphs cost money. `story.ts` was
rebuilt by matching new paragraphs to old ones on word overlap. Rule: never key anything on paragraph text you are
still editing; key on the index and check the counts.

## "No frame found at position" (16 Oct)

The render died at random points with this error from Remotion's frame extraction. The clips were archival
transfers with B-frames and keyframes ten seconds apart, so seeking to an exact frame was a gamble under memory
pressure. `scripts/reencode_clips.py` re-encodes every clip to constant 30 fps, no B-frames, a keyframe every second
(`-g 30 -bf 0`). The error stopped, seeking got faster, and the render scripts still retry a failed part twice,
because trust is earned.

## The laptop died twice (night of 16 to 17 Oct)

The overnight render ran on battery, and the laptop died. Then it did it again. Each time the render was lost back
to the start of its part, and parts were five minutes long. Three changes followed:

- **one-minute parts** (`-PartFrames 1800`): a power cut now costs at most one minute of rendering;
- **`render_supervisor.ps1`**: restarts the renderer whenever it is not running and the film is not done, up to
  15 times, keeping the log history;
- **`power_guard.ps1`**: logs the battery every minute and, below 15%, suspends the render processes with
  `NtSuspendProcess`, then resumes them at 40%. Suspending keeps the frame in progress; killing would not.

`render_en.ps1` also asks Windows not to sleep (`SetThreadExecutionState`) for as long as it runs.

## PowerShell and text files (mid-October)

Windows PowerShell 5.1 writes `Set-Content` in the ANSI code page and `Out-File` / `>` in UTF-16, or in UTF-8 with
a BOM if your profile changed the default. JSON
parsers dislike both. Rule: JSON is written by Python or Node, never by
PowerShell. The one exception, `bench_map.ps1`, writes pure ASCII on purpose. The `.ps1` files themselves are ASCII
only, because 5.1 reads a BOM-less UTF-8 script as ANSI and turns a stray dash into a syntax error.

## Relative paths and [IO.File] (mid-October)

`Set-Location` changes PowerShell's location, not the process working directory. .NET calls like
`[IO.File]::WriteAllText("out\x.json", ...)` resolve against the process cwd, which is wherever PowerShell started.
Use `Resolve-Path`, `Join-Path $PSScriptRoot`, or an absolute path. The render scripts start with
`Set-Location (Split-Path $PSScriptRoot)` and use cmdlets, which do follow the location.

## Python on Windows, small print (mid-October)

- `platform.uname()` can hang in its WMI query on some setups with Python 3.12; `parallax.py` disables the WMI path.
- The installed PyAV was too old for faster-whisper's own decoder, so `subs.py` decodes with ffmpeg into a numpy
  array and hands whisper the samples.
- `new URL(import.meta.url).pathname` on Windows is `/D:/...`; the scripts strip the leading slash before the drive.
- Whisper runs with few threads in `dub_subs.py` so it does not starve a render running at the same time.

## Quoted pages, checked by hand (17 Oct)

Every quote shown as a page was matched word for word against the scan, using the OCR text layer and then the image
itself, because OCR of Fraktur is a creative writing exercise. The highlight box is measured in image pixels from the
OCR line boxes plus padding.
