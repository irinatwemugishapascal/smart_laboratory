@echo off
chcp 65001 >nul
echo ==========================================
echo  SmartLaboratory with Ollama Launcher
echo ==========================================
echo.

:: Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ollama is not installed!
    echo Please download and install from: https://ollama.com/download
    pause
    exit /b 1
)

echo ✅ Ollama is installed

:: Check if model exists
echo.
echo Checking for model: deepseek-v3.1:671b-cloud
ollama list | findstr "deepseek-v3.1:671b-cloud" >nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Model not found. Pulling now...
    echo This may take several minutes depending on your connection...
    ollama pull deepseek-v3.1:671b-cloud
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to pull model
        pause
        exit /b 1
    )
)

echo ✅ Model is ready

:: Start Ollama server in background
echo.
echo Starting Ollama server...
start "Ollama Server" cmd /k "ollama serve"

:: Wait for Ollama to start
echo Waiting for Ollama to initialize...
timeout /t 5 /nobreak >nul

:: Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Could not verify Ollama is running
    echo Please wait a moment and try again
    pause
)

echo ✅ Ollama server is running

echo.
echo ==========================================
echo  Ollama Setup Complete!
echo ==========================================
echo.
echo Model: deepseek-v3.1:671b-cloud
echo URL: http://localhost:11434
echo.
echo Next steps:
echo 1. Open new terminal for backend:  cd server ^&^& npm start
echo 2. Open new terminal for frontend: cd client ^&^& npm start
echo 3. Open browser to: http://localhost:3000
echo.
pause
