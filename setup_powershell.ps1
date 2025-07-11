Write-Host "================================" -ForegroundColor Cyan
Write-Host "PowerShell Setup for Asset Solution" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Setting PowerShell execution policy..." -ForegroundColor Yellow
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✓ PowerShell execution policy set successfully!" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to set execution policy. Please run as Administrator." -ForegroundColor Red
}

Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  .\run_server.ps1  - Start server (production mode)" -ForegroundColor White
Write-Host "  .\run_dev.ps1     - Start server (development mode)" -ForegroundColor White
Write-Host ""
Write-Host "Setup complete! Press any key to exit..." -ForegroundColor Green
Read-Host 