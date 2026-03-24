#!/bin/bash
# Build script for Commercial Operations Platform
# This builds the React frontend and serves it with Django

echo ""
echo "===== Commercial Operations Platform - Build & Run Script ====="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Or use Docker to skip Node.js:"
    echo "  docker-compose up --build"
    echo ""
    exit 1
fi

echo "[1/4] Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed"
    exit 1
fi

echo ""
echo "[2/4] Building React frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: npm run build failed"
    exit 1
fi

echo ""
echo "[3/4] Copying built files to Django backend..."
cd ..
rm -rf backend/static
mkdir -p backend/static
cp -r frontend/dist/* backend/static/

echo ""
echo "[4/4] Setting up Django backend..."
cd backend

# Activate virtual environment
source venv/bin/activate

# Run migrations
echo "Running migrations..."
python manage.py migrate --no-input

echo ""
echo "===== Setup Complete! ====="
echo ""
echo "Starting Django development server..."
echo "Frontend will be available at: http://localhost:8000"
echo "Django Admin at: http://localhost:8000/admin/"
echo ""

python manage.py runserver 0.0.0.0:8000
