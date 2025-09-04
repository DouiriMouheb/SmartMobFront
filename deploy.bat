@echo off
REM SmartMob Frontend Deployment Script for Windows

echo 🚀 SmartMob Frontend Deployment
echo ================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Create .env if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env >nul
    echo ✅ .env file created. Please configure it if needed.
)

REM Build and run
echo 🏗️ Building and starting SmartMob Frontend...
docker-compose up --build -d

REM Check if container is running
docker-compose ps | findstr "smartmob-frontend" >nul
if %errorlevel% equ 0 (
    echo ✅ SmartMob Frontend is running!
    echo 🌐 Access the application at: http://localhost:3000
    echo.
    echo 📋 Useful commands:
    echo    Stop:     docker-compose down
    echo    Logs:     docker-compose logs -f smartmob-frontend
    echo    Rebuild:  docker-compose up --build -d
) else (
    echo ❌ Failed to start the application
    echo 📋 Check logs with: docker-compose logs smartmob-frontend
)

pause
