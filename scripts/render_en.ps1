# EN cut (MainEN) render in resumable 1-minute parts, then concat + mux the mix with -c:v copy (no grain).
# Re-run to continue: finished parts are skipped. ASCII only (PowerShell 5.1).
# Usage: powershell -File scripts/render_en.ps1 [-Concurrency 4] [-Bundle out/bundle2] [-Out out/en/film.mp4] [-Gate]
# -Gate: run the provenance ledger and licence gate (tools/provenance.py) first: no licence, no render.
param([int]$Concurrency = 3, [int]$PartFrames = 1800, [string]$Bundle = "out/bundle", [string]$Out = "out/en/film.mp4", [switch]$Gate)  # 1-minute parts: a power cut loses at most one
Set-Location (Split-Path $PSScriptRoot)
New-Item -ItemType Directory -Force out/tmp | Out-Null  # a fresh clone has no out/ yet
$env:TEMP = (Resolve-Path out).Path + "\tmp"; $env:TMP = $env:TEMP
New-Item -ItemType Directory -Force $env:TEMP, out/en/parts | Out-Null
# one renderer at a time: a second call while one runs just exits
$lock = "out/en/parts/.lock"
if (Test-Path $lock) {
	$other = Get-Content $lock -ErrorAction SilentlyContinue
	if ($other -and (Get-Process -Id $other -ErrorAction SilentlyContinue)) { "render already running (pid $other)"; exit 0 }
}
$PID | Set-Content $lock
Add-Type -Namespace Win -Name Power -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);'
$ES_CONTINUOUS = [uint32]"0x80000000"; $ES_SYSTEM_REQUIRED = [uint32]"0x00000001"
[Win.Power]::SetThreadExecutionState($ES_CONTINUOUS -bor $ES_SYSTEM_REQUIRED) | Out-Null
try {
	if ($Gate) {
		py -3.12 tools/provenance.py --project . --lang en
		if ($LASTEXITCODE -ne 0) { "PROVENANCE GATE: blocked assets, see out/provenance/en/ledger.md"; exit 1 }
	}
	$total = (Get-Content src/en/timings.json -Raw | ConvertFrom-Json).total
	# bundle once; a resume reuses it (deleting an old bundle can hang on Windows file locks).
	# After code changes, bundle into a NEW folder name instead of deleting this one.
	if (-not (Test-Path (Join-Path $Bundle "index.html"))) { npx remotion bundle src/en/index.tsx --out-dir $Bundle | Select-Object -Last 1 }
	$n = [math]::Ceiling($total / $PartFrames)
	$list = @()
	for ($i = 0; $i -lt $n; $i++) {
		$a = $i * $PartFrames; $b = [math]::Min($total, ($i + 1) * $PartFrames) - 1
		$part = "out/en/parts/part{0:D2}.mp4" -f $i
		$list += "file 'part{0:D2}.mp4'" -f $i
		if (Test-Path $part) { "skip $part"; continue }
		"render $part frames $a-$b of $total  $(Get-Date -Format HH:mm)"
		npx remotion render $Bundle MainEN "$part.tmp.mp4" --frames="$a-$b" --codec=h264 --crf=18 --concurrency=$Concurrency --muted --timeout=180000 2>&1 | Select-String -Pattern "Rendered|Encoded|Error|rror:" | ForEach-Object { "$(Get-Date -Format HH:mm:ss) $_" }
		# a part can die on a flaky frame extraction ("No frame found at position"): retry it up to twice
		for ($try = 1; -not (Test-Path "$part.tmp.mp4") -and $try -le 2; $try++) {
			"RETRY $try for $part  $(Get-Date -Format HH:mm)"
			Get-Process chrome-headless-shell -ErrorAction SilentlyContinue | Stop-Process -Force
			npx remotion render $Bundle MainEN "$part.tmp.mp4" --frames="$a-$b" --codec=h264 --crf=18 --concurrency=$Concurrency --muted --timeout=180000 2>&1 | Select-String -Pattern "Rendered|Encoded|Error|rror:" | ForEach-Object { "$(Get-Date -Format HH:mm:ss) $_" }
		}
		if (Test-Path "$part.tmp.mp4") { Move-Item -Force "$part.tmp.mp4" $part } else { "PART FAILED: $part"; exit 1 }
	}
	$list | Set-Content -Encoding ascii out/en/parts/list.txt
	# the mix may still be running (it is slow): wait for a fresh mix.wav, at most 2 hours
	$parts0 = (Get-Item out/en/parts/part00.mp4).LastWriteTime.AddHours(-12)
	for ($w = 0; $w -lt 240 -and -not ((Test-Path out/en/mix.wav) -and (Get-Item out/en/mix.wav).LastWriteTime -gt $parts0 -and -not (Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -like '*mix.py*' })); $w++) { Start-Sleep 30 }
	ffmpeg -nostdin -y -v error -f concat -safe 0 -i out/en/parts/list.txt -c copy out/en/raw_en.mp4
	ffmpeg -nostdin -y -v error -i out/en/raw_en.mp4 -i out/en/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $Out
	if (Test-Path $Out) { "RENDER DONE: $Out  $(Get-Date -Format HH:mm)" } else { "RENDER FAILED (mux)" }
} finally {
	Remove-Item $lock -ErrorAction SilentlyContinue
	[Win.Power]::SetThreadExecutionState($ES_CONTINUOUS) | Out-Null
}





