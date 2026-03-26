<<<<<<< HEAD
@echo off
REM Build script for Commercial Operations Platform
REM This builds the React frontend and serves it with Django

setlocal enabledelayedexpansion

echo.
echo ===== Commercial Operations Platform - Build and Run =====
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Or use Docker to skip Node.js:
    echo   docker-compose up --build
    echo.
    pause
    exit /b 1
)

echo [1/4] Installing frontend dependencies...
cd frontend
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/4] Building React frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: npm run build failed
    pause
    exit /b 1
)

echo.
echo [3/4] Copying built files to Django backend...
cd ..
if exist backend\static rmdir /s /q backend\static
mkdir backend\static
xcopy /E /I /Y frontend\dist\* backend\static\

echo.
echo [4/4] Setting up Django backend...
cd backend

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run migrations
echo Running migrations...
python manage.py migrate --no-input

echo.
echo ===== Setup Complete! =====
echo.
echo Starting Django development server...
echo Frontend will be available at: http://localhost:8000
echo Django Admin at: http://localhost:8000/admin/
echo.

python manage.py runserver 0.0.0.0:8000

pause
=======
@echo off
REM Build script for Commercial Operations Platform
REM This builds the React frontend and serves it with Django

setlocal enabledelayedexpansion

echo.
echo ===== Commercial Operations Platform - Build and Run =====
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Or use Docker to skip Node.js:
    echo   docker-compose up --build
    echo.
    pause
    exit /b 1
)

echo [1/4] Installing frontend dependencies...
cd frontend
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/4] Building React frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: npm run build failed
    pause
    exit /b 1
)

echo.
echo [3/4] Copying built files to Django backend...
cd ..
if exist backend\static rmdir /s /q backend\static
mkdir backend\static
xcopy /E /I /Y frontend\dist\* backend\static\

echo.
echo [4/4] Setting up Django backend...
cd backend

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Run migrations
echo Running migrations...
python manage.py migrate --no-input

echo.
echo ===== Setup Complete! =====
echo.
echo Starting Django development server...
echo Frontend will be available at: http://localhost:8000
echo Django Admin at: http://localhost:8000/admin/
echo.

python manage.py runserver 0.0.0.0:8000

pause
>>>>>>> ee7344b0c33673c947c3a60756a715fe3f8b3359
