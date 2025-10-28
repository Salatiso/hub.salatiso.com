# Start Firebase Emulator with Java PATH configured
# This script ensures Java is in PATH before starting the emulator

# Add Java to PATH for this session
$javaPath = "C:\Program Files\Java\jre1.8.0_471\bin"
$env:Path += ";$javaPath"

# Verify Java is available
Write-Host "Checking Java installation..." -ForegroundColor Cyan
java -version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR: Java not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Java:" -ForegroundColor Yellow
    Write-Host "  1. Download from https://www.java.com/download/" -ForegroundColor Yellow
    Write-Host "  2. Install Java JRE" -ForegroundColor Yellow
    Write-Host "  3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ Java found successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Firebase Emulator..." -ForegroundColor Cyan
Write-Host "  - Auth Emulator: http://127.0.0.1:9099" -ForegroundColor White
Write-Host "  - Firestore Emulator: http://127.0.0.1:8080" -ForegroundColor White
Write-Host "  - Emulator UI: http://127.0.0.1:4000" -ForegroundColor White
Write-Host ""
Write-Host "Emulator is starting (this may take 10-15 seconds)..." -ForegroundColor Yellow
Write-Host ""

# Start Firebase Emulator
firebase emulators:start
