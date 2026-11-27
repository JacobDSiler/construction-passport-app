# Construction Passport auto-sync. Commits and pushes this folder to GitHub shortly after files stop changing.
# Safe by design: never forces, never touches .env (it is git-ignored), stops on any conflict and says why in the log.
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$log  = Join-Path $env:LOCALAPPDATA 'cp-auto-push.log'
$quietSeconds = 90
$mutex = New-Object System.Threading.Mutex($false, 'Global\cp-auto-push')
if (-not $mutex.WaitOne(0)) { exit 0 }   # already running
function Log($m) { Add-Content -Path $log -Value ("{0}  {1}" -f (Get-Date -Format 's'), $m) }
Set-Location $repo
Log "watching $repo"
$halted = $false
while ($true) {
  try {
    $dirty = git status --porcelain
    if ($dirty -and -not $halted) {
      $newest = (git ls-files -m -o --exclude-standard | ForEach-Object { if (Test-Path $_) { (Get-Item $_).LastWriteTime } } | Sort-Object -Descending | Select-Object -First 1)
      if ($newest -and ((Get-Date) - $newest).TotalSeconds -ge $quietSeconds) {
        git add -A
        git commit -q -m "Auto-sync from laptop" 2>&1 | Out-Null
        git pull --rebase --autostash origin main 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
          git rebase --abort 2>&1 | Out-Null
          Log "STOPPED: pull --rebase hit a conflict. Nothing was pushed. Ask Claude to resolve it, then delete this log line to resume."
          $halted = $true
        } else {
          git push origin main 2>&1 | Out-Null
          if ($LASTEXITCODE -eq 0) { Log "pushed $(git rev-parse --short HEAD)" }
          else { Log "push failed (will retry). Check you are signed in to GitHub on this laptop." }
        }
      }
    }
  } catch { Log "error: $($_.Exception.Message)" }
  Start-Sleep -Seconds 30
}
