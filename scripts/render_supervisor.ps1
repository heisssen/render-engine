# Keeps the EN render going: whenever render_en.ps1 is not running and the film is not finished, start it again
# (finished 1-minute parts are skipped, so it resumes where it stopped). Gives up after 15 restarts. ASCII only.
# Usage: powershell -File scripts/render_supervisor.ps1
$root = Split-Path $PSScriptRoot
Set-Location $root
New-Item -ItemType Directory -Force out/tmp, out/en/parts | Out-Null
$sup = "out/tmp/supervisor.log"
for ($n = 0; $n -lt 15; $n++) {
	while (Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*render_en.ps1*' -and $_.ProcessId -ne $PID -and $_.CommandLine -notlike '*render_supervisor*' }) { Start-Sleep 60 }
	$log = if (Test-Path out/en/render.log) { (Get-Content out/en/render.log -Raw) -replace "`0", '' } else { '' }
	if ($log -match 'RENDER DONE') { "$(Get-Date -Format HH:mm) render done, supervisor exits" | Add-Content $sup; exit 0 }
	"$(Get-Date -Format HH:mm) render not running and not done: restart $($n + 1)" | Add-Content $sup
	Set-Content -Path out/en/parts/.lock -Value 999999
	Get-Process chrome-headless-shell -ErrorAction SilentlyContinue | Stop-Process -Force
	if (Test-Path out/en/render.log) { Get-Content out/en/render.log -Raw | Add-Content out/tmp/render_history.log }
	Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', "& '$root\scripts\render_en.ps1' *> '$root\out\en\render.log'"
	Start-Sleep 90
}
"$(Get-Date -Format HH:mm) gave up after 15 restarts" | Add-Content $sup
