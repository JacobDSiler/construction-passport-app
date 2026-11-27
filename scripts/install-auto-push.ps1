# Run ONCE:  powershell -ExecutionPolicy Bypass -File scripts\install-auto-push.ps1
# Registers the auto-sync to start at every sign-in and starts it now. Undo with: Unregister-ScheduledTask CP-AutoPush -Confirm:$false
$script = Join-Path $PSScriptRoot 'auto-push.ps1'
$action  = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$script`""
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$set     = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero)
Register-ScheduledTask -TaskName 'CP-AutoPush' -Action $action -Trigger $trigger -Settings $set -Description 'Pushes Construction Passport changes to GitHub' -Force | Out-Null
Start-ScheduledTask -TaskName 'CP-AutoPush'
Write-Host 'Done. Auto-sync is running. Log: ' (Join-Path $env:LOCALAPPDATA 'cp-auto-push.log')
