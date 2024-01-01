param(
  [string]$Start   = "2024-01-01",
  [string]$End     = (Get-Date -Format "yyyy-MM-dd"),
  [int]$MaxPerDay  = 6,
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"

$root     = "C:\CODEX"
$folder   = "daily-dev-log"
$full     = Join-Path $root $folder
$logFile  = Join-Path $full "log.md"

New-Item -ItemType Directory -Force -Path $full | Out-Null
Set-Location $root

if (-not (Test-Path $logFile)) {
  Set-Content -Path $logFile -Value "# Daily Dev Log" -Encoding utf8
}

$startDate = [datetime]::ParseExact($Start, "yyyy-MM-dd", $null)
$endDate   = [datetime]::ParseExact($End,   "yyyy-MM-dd", $null)

$rand  = [System.Random]::new()
$total = 0

for ($d = $startDate; $d -le $endDate; $d = $d.AddDays(1)) {
  $n = $rand.Next(1, $MaxPerDay + 1)
  for ($i = 0; $i -lt $n; $i++) {
    $dt  = Get-Date -Year $d.Year -Month $d.Month -Day $d.Day `
          -Hour ($rand.Next(8, 23)) -Minute ($rand.Next(0, 60)) -Second ($rand.Next(0, 60))
    $iso = $dt.ToString("yyyy-MM-ddTHH:mm:ss") + "+05:00"

    $env:GIT_AUTHOR_DATE   = $iso
    $env:GIT_COMMITTER_DATE = $iso

    Add-Content -Path $logFile -Value ("- {0}  work item #{1}" -f $iso, ($total + 1)) -Encoding utf8
    git commit -q -a -m ("chore: daily log {0}" -f $dt.ToString("yyyy-MM-dd HH:mm"))
    $total++
  }
  if (($d.Month -eq 1 -and $d.Day -eq 1) -or ($d.Month -eq 12 -and $d.Day -eq 31)) {
    Write-Host ("progress {0}  total={1}" -f $d.ToString("yyyy-MM-dd"), $total)
  }
}

Write-Host ("Generated {0} commits for {1}..{2}" -f $total, $Start, $End)

if (-not $NoPush) {
  git push -q origin main
  Write-Host "Pushed to origin/main"
}
