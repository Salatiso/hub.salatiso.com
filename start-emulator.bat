@echo off
REM This batch file starts Firebase Emulator with Java PATH configured

REM Add Java to PATH
set PATH=%PATH%;C:\Program Files\Java\jre1.8.0_471\bin

REM Verify Java is available
java -version
if errorlevel 1 (
    echo.
    echo ERROR: Java not found. Please install Java JRE 8 or later.
    echo Download from: https://www.java.com/download/
    pause
    exit /b 1
)

echo.
echo ✅ Java found successfully!
echo.
echo Starting Firebase Emulator...
echo.

REM Start Firebase Emulator
firebase emulators:start

pause
