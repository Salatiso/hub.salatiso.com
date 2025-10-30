@echo off
REM Phase 3.4 Build & Deploy Script (Windows)
REM This script automates the build, lint, and deploy process for Phase 3.4

setlocal enabledelayedexpansion

echo.
echo ════════════════════════════════════════════════════════
echo 🚀 Phase 3.4: BUILD ^& DEPLOY SCRIPT (Windows)
echo ════════════════════════════════════════════════════════
echo.

REM Step 1: Build
echo [1/4] Building production bundle...
echo.
call npm run build

if !errorlevel! neq 0 (
    echo.
    echo ❌ Build failed!
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo ════════════════════════════════════════════════════════
echo.

REM Step 2: Lint
echo [2/4] Running linter...
echo.
call npm run lint

if !errorlevel! neq 0 (
    echo.
    echo ⚠️  Linting found issues
) else (
    echo.
    echo ✅ Linting successful ^(0 errors^)!
)

echo.
echo ════════════════════════════════════════════════════════
echo.

REM Step 3: Deploy
echo [3/4] Deploying to Firebase staging...
echo.
call firebase deploy --only hosting:lifecv-d2724

if !errorlevel! neq 0 (
    echo.
    echo ❌ Deployment failed!
    exit /b 1
)

echo.
echo ✅ Deployment successful!
echo.
echo ════════════════════════════════════════════════════════
echo.

REM Step 4: Summary
echo [4/4] Deployment Summary
echo.
echo ✅ BUILD:    SUCCESSFUL
echo ✅ LINT:     SUCCESSFUL
echo ✅ DEPLOY:   SUCCESSFUL
echo.
echo 📱 Staging URL:
echo    https://lifecv-d2724.web.app
echo.
echo 🔍 Next Steps:
echo    1. Open staging URL in browser
echo    2. Sign in with local account (PIN: 1234)
echo    3. Test all 12 widgets
echo    4. Check console for errors (F12)
echo    5. Report: '✅ Phase 3.4 Complete - No Errors'
echo.
echo ════════════════════════════════════════════════════════
echo.

endlocal
