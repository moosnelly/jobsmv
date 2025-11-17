@echo off

REM Build script for Docker containers
REM Usage: .\infra\scripts\build.bat

echo Building Docker containers...

REM Change to the project root directory (parent of infra)
cd /d "%~dp0.."

REM Build all services
docker compose -f infra/docker-compose.yml build

echo Build completed successfully!
