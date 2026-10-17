# Preview of the EN cut: render a frame range from a bundle and mux it with the matching stretch of the mix (-c:v copy).
# Usage: powershell -File scripts/preview_en.ps1 -Bundle out/bundle -From 0 -To 2399 [-Out out/en/preview.mp4]
param([string]$Bundle, [int]$From = 0, [int]$To = 2399, [string]$Out = "out/en/preview.mp4", [int]$Concurrency = 4)
Set-Location (Split-Path $PSScriptRoot)
$env:TEMP = (Resolve-Path out).Path + "\tmp"; $env:TMP = $env:TEMP
"render $From-$To  $(Get-Date -Format HH:mm)"
if (Test-Path out/en/preview_video.mp4) { Move-Item -Force out/en/preview_video.mp4 out/tmp/preview_video_old.mp4 }  # never mux a stale video
# frame extraction can fail under memory pressure ("No frame found at position"): retry up to twice
for ($try = 0; -not (Test-Path out/en/preview_video.mp4) -and $try -le 2; $try++) {
	if ($try) { "RETRY $try  $(Get-Date -Format HH:mm)"; Get-Process chrome-headless-shell -ErrorAction SilentlyContinue | Stop-Process -Force }
	npx remotion render $Bundle MainEN out/en/preview_video.mp4 --frames="$From-$To" --codec=h264 --crf=18 --concurrency=$Concurrency --muted --timeout=180000 --log=error
}
if (-not (Test-Path out/en/preview_video.mp4)) { "PREVIEW FAILED (render)"; exit 1 }
# the mix may still be running: wait for it (at most 1 hour)
for ($w = 0; $w -lt 120 -and (Get-CimInstance Win32_Process -Filter "Name='python.exe' OR Name='py.exe'" | Where-Object { $_.CommandLine -like '*mix.py*' }); $w++) { Start-Sleep 30 }
$ss = $From / 30; $t = ($To - $From + 1) / 30
ffmpeg -nostdin -y -v error -i out/en/preview_video.mp4 -ss $ss -t $t -i out/en/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $Out
if (Test-Path $Out) { "PREVIEW DONE: $Out  $(Get-Date -Format HH:mm)" } else { "PREVIEW FAILED" }
