# Global auto-push watcher. One process, many projects.
# A project is any git repo under a watch root that contains a file named .autopush.json
# Config: %USERPROFILE%\.autopush\config.json  { "roots": ["C:\\Users\\User\\Dev"], "quietSeconds": 90, "scanSeconds": 30 }
# Per-project .autopush.json (all optional): { "branch": "main", "quietSeconds": 90, "paused": false, "message": "auto: {n} files" }
$ErrorActionPreference = 'Continue'
$home_ = Join-Path $env:USERPROFILE '.autopush'
New-Item -ItemType Directory -Force -Path $home_ | Out-Null
$log = Join-Path $env:LOCALAPPDATA 'autopush-all.log'
function Log($m){ Add-Content $log ("{0} {1}" -f (Get-Date -Format 's'), $m) }

$created = $false
$mutex = New-Object System.Threading.Mutex($true, 'Global\AutoPushAll', [ref]$created)
if (-not $created) { exit 0 }

$cfgPath = Join-Path $home_ 'config.json'
if (-not (Test-Path $cfgPath)) {
  @{ roots = @("$env:USERPROFILE\Dev"); quietSeconds = 90; scanSeconds = 30 } | ConvertTo-Json | Set-Content $cfgPath
}
Log 'watcher started'

function Get-Projects($roots){
  foreach ($r in $roots) {
    if (-not (Test-Path $r)) { continue }
    Get-ChildItem -Path $r -Filter '.autopush.json' -Recurse -Force -Depth 3 -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
      ForEach-Object { $_.DirectoryName }
  }
}

function Latest-Change($dir){
  $files = git -C $dir status --porcelain 2>$null | ForEach-Object { $_.Substring(3).Trim('"') }
  $latest = [datetime]::MinValue
  foreach ($f in $files) {
    $p = Join-Path $dir $f
    if (Test-Path $p) { $t = (Get-Item $p -Force).LastWriteTime; if ($t -gt $latest) { $latest = $t } }
  }
  return @{ count = @($files).Count; latest = $latest }
}

function Sync($dir, $opt, $quietDefault){
  if ($opt.paused) { return }
  $stop = Join-Path $dir '.autopush.stopped'
  if (Test-Path $stop) { return }                      # conflict earlier; delete this file after you fix it
  if (-not (Test-Path (Join-Path $dir '.git'))) { return }
  $quiet = if ($opt.quietSeconds) { $opt.quietSeconds } else { $quietDefault }
  $c = Latest-Change $dir
  if ($c.count -eq 0) {
    # nothing local; still pull so this machine stays current
    git -C $dir pull --rebase --autostash 2>&1 | Out-Null
    return
  }
  if (((Get-Date) - $c.latest).TotalSeconds -lt $quiet) { return }   # still being edited
  $msg = if ($opt.message) { $opt.message -replace '\{n\}', $c.count } else { "auto: $($c.count) files" }
  git -C $dir add -A 2>&1 | Out-Null
  git -C $dir commit -m $msg 2>&1 | Out-Null
  $out = git -C $dir pull --rebase --autostash 2>&1
  if ($LASTEXITCODE -ne 0) {
    git -C $dir rebase --abort 2>&1 | Out-Null
    "conflict $(Get-Date -Format s)`n$out" | Set-Content $stop
    Log "CONFLICT $dir - stopped (delete .autopush.stopped after fixing)"
    return
  }
  $out = git -C $dir push 2>&1
  if ($LASTEXITCODE -ne 0) { Log "push failed $dir : $out" } else { Log "pushed $dir ($($c.count) files)" }
}

while ($true) {
  try {
    $cfg = Get-Content $cfgPath -Raw | ConvertFrom-Json
    $q = if ($cfg.quietSeconds) { $cfg.quietSeconds } else { 90 }
    foreach ($dir in (Get-Projects $cfg.roots | Select-Object -Unique)) {
      try { $opt = Get-Content (Join-Path $dir '.autopush.json') -Raw | ConvertFrom-Json } catch { $opt = @{} }
      Sync $dir $opt $q
    }
  } catch { Log "loop error: $_" }
  $s = 30; try { if ($cfg.scanSeconds) { $s = $cfg.scanSeconds } } catch {}
  Start-Sleep -Seconds $s
}
