# Map render-speed A/B: the same map frames with some speed switches off (see OPT in src/en/Map.tsx).
# Usage: powershell -File scripts/bench_map.ps1 -Bundle out/bundle [-From 3000] [-To 3059]
param([string]$Bundle, [int]$From = 3000, [int]$To = 3059, [int]$Concurrency = 4)
Set-Location (Split-Path $PSScriptRoot)
$env:TEMP = (Resolve-Path out).Path + "\tmp"; $env:TMP = $env:TEMP
$variants = [ordered]@{ 'all-off' = 'clip,coast,rough'; 'clip' = 'coast,rough'; 'clip+coast' = 'rough'; 'all-on' = '' }
foreach ($name in $variants.Keys) {
	$props = '{"mapOff":"' + $variants[$name] + '"}'
	$props | Set-Content -Encoding ascii out/tmp/bench_props.json
	$t = Get-Date
	npx remotion render $Bundle MainEN "out/tmp/bench_$name.mp4" --frames="$From-$To" --codec=h264 --crf=18 --concurrency=$Concurrency --muted --timeout=180000 --log=error --props=out/tmp/bench_props.json
	$s = ((Get-Date) - $t).TotalSeconds
	"{0,-11} {1,6:N0} s  {2:N2} s/frame" -f $name, $s, ($s / ($To - $From + 1))
}
