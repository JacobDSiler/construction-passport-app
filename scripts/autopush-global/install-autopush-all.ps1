# Run once (PowerShell, normal user). Replaces the per-project CP-AutoPush task with one global watcher.
$script = Join-Path $PSScriptRoot 'autopush-all.ps1'
$dest = Join-Path $env:USERPROFILE '.autopush'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item $script (Join-Path $dest 'autopush-all.ps1') -Force

Unregister-ScheduledTask -TaskName 'CP-AutoPush' -Confirm:$false -ErrorAction SilentlyContinue
Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match 'auto-push.ps1' } | Stop-Process -Force -ErrorAction SilentlyContinue

$action  = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$dest\autopush-all.ps1`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$set     = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero)
Register-ScheduledTask -TaskName 'AutoPush-All' -Action $action -Trigger $trigger -Settings $set -Force | Out-Null
Start-ScheduledTask -TaskName 'AutoPush-All'

# Opt the Construction Passport repo in
$cp = Join-Path $env:USERPROFILE 'Dev\construction-passport-app'
if (Test-Path $cp) { '{ "branch": "main" }' | Set-Content (Join-Path $cp '.autopush.json') }
Write-Host "Installed. Add a .autopush.json to any repo under $env:USERPROFILE\Dev to include it. Log: $env:LOCALAPPDATA\autopush-all.log"
