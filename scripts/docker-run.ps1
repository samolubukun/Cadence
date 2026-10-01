<#
.SYNOPSIS
    Cadence Local Docker Runner for Windows PowerShell (Gaming PC / Workstation)
.PARAMETER Topology
    "combined" (default) or "modular"
#>
param (
    [string]$Topology = "combined"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    Cadence AI - Local Engine Docker Launcher (Windows)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Topology selected: $Topology" -ForegroundColor Green

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Desktop is not installed or not in PATH."
    exit 1
}

# Check NVIDIA GPU
$hasNvidia = $false
try {
    $null = nvidia-smi
    $hasNvidia = $true
    Write-Host "--> Detected NVIDIA GPU with CUDA acceleration." -ForegroundColor Green
} catch {
    Write-Host "--> NVIDIA GPU not detected directly via nvidia-smi." -ForegroundColor Yellow
}

$composeFile = "docker/docker-compose.$Topology.yml"

if (-not (Test-Path $composeFile)) {
    Write-Error "Compose file '$composeFile' not found."
    exit 1
}

Write-Host "--> Launching Docker Compose ($composeFile)..." -ForegroundColor Cyan
docker compose -f $composeFile up --build
