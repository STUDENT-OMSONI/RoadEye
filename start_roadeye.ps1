# RoadEye Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ROADEYE — Modern AI Road Safety Platform" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`nStarting RoadEye Server on http://localhost:8080..." -ForegroundColor Green
Write-Host "Opening your browser to http://localhost:8080`n" -ForegroundColor DarkGray

Start-Process "http://localhost:8080"
& "$root\myenv\Scripts\python.exe" "$root\app.py"
