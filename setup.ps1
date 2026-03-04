# PowerShell helper script to quickly install all dependencies for the SkillNexus project.
# Run this from the root of the SkillNexus folder:  .\setup.ps1

Write-Host "[1/3] Installing frontend packages (npm)"
npm ci

Write-Host "[2/3] Preparing Python backend"
Push-Location backend

# create a venv if it doesn't exist
defaultVenv=".venv"
if (-not (Test-Path $defaultVenv)) {
    Write-Host "Creating virtual environment..."
    python -m venv $defaultVenv
}

Write-Host "Activating virtual environment and installing requirements..."
& .\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt

Pop-Location
Write-Host "[3/3] All dependencies installed. You can now run `npm run dev` or `npm run dev:full`."
