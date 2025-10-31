#!/usr/bin/env powershell

# Firebase Emulator Quick Start Script
# This starts the Firebase Emulator Suite and displays status

Write-Host "🔥 Firebase Emulator Launcher" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if Firebase CLI is installed
$firebaseVersion = firebase --version 2>$null
if ($null -eq $firebaseVersion) {
    Write-Host "❌ Firebase CLI not found!" -ForegroundColor Red
    Write-Host "Install with: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Firebase CLI: $firebaseVersion" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found!" -ForegroundColor Yellow
    Write-Host "Create one with emulator settings." -ForegroundColor Yellow
}

Write-Host "🚀 Starting Firebase Emulator Suite..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Emulator services will start on:" -ForegroundColor Cyan
Write-Host "  📱 Auth Emulator:      http://127.0.0.1:9099" -ForegroundColor White
Write-Host "  🗄️  Firestore Emulator: http://127.0.0.1:8080" -ForegroundColor White
Write-Host "  💾 Storage Emulator:   http://127.0.0.1:9199" -ForegroundColor White
Write-Host "  🎮 Emulator UI:        http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "ℹ️  Keep this terminal open while developing!" -ForegroundColor Yellow
Write-Host ""

# Start emulator
firebase emulators:start

# If emulator closes/fails
Write-Host ""
Write-Host "❌ Emulator stopped" -ForegroundColor Red
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Yellow
Write-Host "  1. Make sure ports are not in use:" -ForegroundColor White
Write-Host "     netstat -ano | findstr ':8080'" -ForegroundColor Gray
Write-Host "  2. Check Firebase CLI version:" -ForegroundColor White
Write-Host "     firebase --version" -ForegroundColor Gray
Write-Host "  3. Upgrade Firebase CLI:" -ForegroundColor White
Write-Host "     npm install -g firebase-tools@latest" -ForegroundColor Gray
Write-Host ""
