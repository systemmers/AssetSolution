Write-Host "================================" -ForegroundColor Green
Write-Host "Asset Solution Server (DEV MODE)" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# 가상환경 활성화
Write-Host "[1/3] Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# 환경변수 설정
Write-Host "[2/3] Setting development environment..." -ForegroundColor Yellow
$env:FLASK_ENV = "development"
$env:FLASK_DEBUG = "1"

# Flask 서버 실행
Write-Host "[3/3] Starting Flask server in development mode..." -ForegroundColor Yellow
python run.py

# 서버 종료 시 메시지
Write-Host ""
Write-Host "Server stopped. Press any key to exit..." -ForegroundColor Red
Read-Host 