# Battery guard for long renders on the laptop: logs charge every minute; below 15% it suspends Remotion/ffmpeg/python
# work (finished parts stay on disk), and resumes it once the battery is back at 40%. ASCII only (PowerShell 5.1).
# Usage: powershell -File scripts/power_guard.ps1   (runs until stopped)
$log = Join-Path (Split-Path $PSScriptRoot) "out\tmp\power.log"
New-Item -ItemType Directory -Force (Split-Path $log) | Out-Null
Add-Type -Namespace Win -Name Proc -MemberDefinition @'
[DllImport("ntdll.dll")] public static extern int NtSuspendProcess(IntPtr h);
[DllImport("ntdll.dll")] public static extern int NtResumeProcess(IntPtr h);
'@
$paused = $false
function Workers { Get-Process chrome-headless-shell, node, ffmpeg, python -ErrorAction SilentlyContinue }
while ($true) {
	$b = Get-CimInstance -Namespace root\wmi -ClassName BatteryStatus -ErrorAction SilentlyContinue | Select-Object -First 1
	$full = (Get-CimInstance -Namespace root\wmi -ClassName BatteryFullChargedCapacity -ErrorAction SilentlyContinue | Select-Object -First 1).FullChargedCapacity
	$pct = if ($full) { [math]::Round(100 * $b.RemainingCapacity / $full) } else { -1 }
	"{0:HH:mm} {1}% online={2} charge={3}mW discharge={4}mW paused={5}" -f (Get-Date), $pct, $b.PowerOnline, $b.ChargeRate, $b.DischargeRate, $paused | Add-Content $log
	if (-not $paused -and $pct -ge 0 -and $pct -lt 15) {
		Workers | ForEach-Object { [void][Win.Proc]::NtSuspendProcess($_.Handle) }
		$paused = $true; "{0:HH:mm} PAUSED work at {1}%" -f (Get-Date), $pct | Add-Content $log
	} elseif ($paused -and $pct -ge 40) {
		Workers | ForEach-Object { [void][Win.Proc]::NtResumeProcess($_.Handle) }
		$paused = $false; "{0:HH:mm} RESUMED work at {1}%" -f (Get-Date), $pct | Add-Content $log
	}
	Start-Sleep 60
}
