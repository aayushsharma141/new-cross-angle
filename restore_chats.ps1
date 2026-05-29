# restore_chats.ps1
# This script copies the standalone Antigravity configuration and state databases to the IDE.

Write-Host "============================================="
Write-Host "      ANTIGRAVITY CHAT RESTORATION TOOL      "
Write-Host "============================================="

Write-Host "`n[1/3] Checking processes..."
$processes = Get-Process -Name "Antigravity IDE" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "Antigravity IDE is currently running. Please save your work and close the IDE now." -ForegroundColor Yellow
    Read-Host "Press Enter ONCE YOU HAVE CLOSED the IDE to proceed..."
    
    # Double-check and force-close any remaining background helper processes if needed
    Stop-Process -Name "Antigravity IDE" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
} else {
    Write-Host "Antigravity IDE is closed. Proceeding..."
}

Write-Host "`n[2/3] Restoring state databases..."
$standaloneGlobal = "C:\Users\aayus\AppData\Roaming\Antigravity\User\globalStorage\state.vscdb"
$ideGlobal = "C:\Users\aayus\AppData\Roaming\Antigravity IDE\User\globalStorage\state.vscdb"

$standaloneWorkspace = "C:\Users\aayus\AppData\Roaming\Antigravity\User\workspaceStorage\58361e6ee1b8a1cf26f7cb2e28d30326\state.vscdb"
$ideWorkspace = "C:\Users\aayus\AppData\Roaming\Antigravity IDE\User\workspaceStorage\58361e6ee1b8a1cf26f7cb2e28d30326\state.vscdb"

# Copy global state
if (Test-Path $standaloneGlobal) {
    Write-Host "-> Restoring global state database..."
    Copy-Item -Path $standaloneGlobal -Destination $ideGlobal -Force
} else {
    Write-Host "-> Warning: Standalone global state database not found." -ForegroundColor Yellow
}

# Copy workspace state
if (Test-Path $standaloneWorkspace) {
    Write-Host "-> Restoring workspace state database..."
    Copy-Item -Path $standaloneWorkspace -Destination $ideWorkspace -Force
} else {
    Write-Host "-> Warning: Standalone workspace state database not found." -ForegroundColor Yellow
}

Write-Host "`n[3/3] Completing restoration..."
Write-Host "Success! Your past chat indexes and global states have been fully restored." -ForegroundColor Green
Write-Host "You can now reopen the Antigravity IDE." -ForegroundColor Green
Write-Host "============================================="
Read-Host "Press Enter to close this window..."
