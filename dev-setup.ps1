# Dev setup script: creates venv and installs minimal requirements
Write-Host "Creating virtual environment .venv..."
python -m venv .venv
Write-Host "Activating virtual environment..."
& .venv\Scripts\Activate.ps1
Write-Host "Upgrading pip and installing minimal backend requirements..."
python -m pip install --upgrade pip
python -m pip install -r backend/requirements-minimal.txt
Write-Host "Frontend: installing node dependencies (frontend)..."
Push-Location frontend
npm ci
Pop-Location
Write-Host "Setup complete. Run 'python backend\manage.py migrate' then 'python backend\manage.py runserver' and 'cd frontend; npm run build' to start services."
