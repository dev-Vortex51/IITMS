# Docker Helper Commands for SIWES PostgreSQL Migration (Windows PowerShell)
# Usage: .\scripts\docker-commands.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

$GREEN = "`e[32m"
$BLUE = "`e[34m"
$YELLOW = "`e[33m"
$RED = "`e[31m"
$NC = "`e[0m"

function Show-Help {
    Write-Host "🐳 SIWES Docker Management Commands" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts\docker-commands.ps1 [command]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  start        - Start PostgreSQL and pgAdmin containers" -ForegroundColor White
    Write-Host "  stop         - Stop all containers" -ForegroundColor White
    Write-Host "  restart      - Restart all containers" -ForegroundColor White
    Write-Host "  logs         - Show PostgreSQL logs" -ForegroundColor White
    Write-Host "  status       - Check container status" -ForegroundColor White
    Write-Host "  shell        - Open PostgreSQL shell (psql)" -ForegroundColor White
    Write-Host "  clean        - Remove containers and volumes (DESTRUCTIVE)" -ForegroundColor White
    Write-Host "  backup       - Backup PostgreSQL database to file" -ForegroundColor White
    Write-Host "  restore      - Restore PostgreSQL from backup file" -ForegroundColor White
    Write-Host ""
}

function Start-Containers {
    Write-Host "🚀 Starting Docker containers..." -ForegroundColor Blue
    docker-compose up -d
    Write-Host ""
    Write-Host "✅ Containers started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "PostgreSQL: localhost:5432" -ForegroundColor Cyan
    Write-Host "pgAdmin:    http://localhost:5050" -ForegroundColor Cyan
    Write-Host "  Email:    admin@siwes.local" -ForegroundColor Gray
    Write-Host "  Password: admin123" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Run '.\scripts\docker-commands.ps1 status' to check health" -ForegroundColor Yellow
}

function Stop-Containers {
    Write-Host "⏹️  Stopping Docker containers..." -ForegroundColor Blue
    docker-compose down
    Write-Host "✅ Containers stopped" -ForegroundColor Green
}

function Restart-Containers {
    Write-Host "🔄 Restarting Docker containers..." -ForegroundColor Blue
    docker-compose restart
    Write-Host "✅ Containers restarted" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "📜 PostgreSQL logs (press Ctrl+C to exit):" -ForegroundColor Blue
    docker-compose logs -f postgres
}

function Show-Status {
    Write-Host "📊 Container Status:" -ForegroundColor Blue
    docker-compose ps
    Write-Host ""
    Write-Host "🏥 PostgreSQL Health Check:" -ForegroundColor Blue
    docker exec siwes_postgres pg_isready -U siwes_user -d siwes_management
}

function Open-Shell {
    Write-Host "🐚 Opening PostgreSQL shell..." -ForegroundColor Blue
    Write-Host "Type '\q' to exit, '\l' to list databases, '\dt' to list tables" -ForegroundColor Yellow
    Write-Host ""
    docker exec -it siwes_postgres psql -U siwes_user -d siwes_management
}

function Clean-All {
    Write-Host "⚠️  WARNING: This will delete all containers and data!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure? (yes/no)"
    if ($confirm -eq "yes") {
        Write-Host "🧹 Cleaning up..." -ForegroundColor Blue
        docker-compose down -v --remove-orphans
        Write-Host "✅ Cleanup complete" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled" -ForegroundColor Yellow
    }
}

function Backup-Database {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backup\postgres"
    $backupFile = "$backupDir\backup_$timestamp.sql"
    
    if (!(Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    Write-Host "💾 Creating PostgreSQL backup..." -ForegroundColor Blue
    docker exec siwes_postgres pg_dump -U siwes_user siwes_management | Out-File -FilePath $backupFile -Encoding UTF8
    
    if ($?) {
        Write-Host "✅ Backup created: $backupFile" -ForegroundColor Green
        $fileSize = (Get-Item $backupFile).Length / 1KB
        Write-Host "   Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
    } else {
        Write-Host "❌ Backup failed" -ForegroundColor Red
    }
}

function Restore-Database {
    Write-Host "📂 Available backups:" -ForegroundColor Blue
    $backups = Get-ChildItem -Path "backup\postgres\*.sql" -ErrorAction SilentlyContinue
    
    if ($backups) {
        $backups | ForEach-Object { Write-Host "   $($_.Name) - $([math]::Round($_.Length / 1KB, 2)) KB" -ForegroundColor Gray }
    } else {
        Write-Host "   No backups found" -ForegroundColor Yellow
    }
    
    Write-Host ""
    $backupFile = Read-Host "Enter backup file path (or name from above)"
    
    if (!(Test-Path $backupFile)) {
        $backupFile = "backup\postgres\$backupFile"
    }
    
    if (Test-Path $backupFile) {
        Write-Host "🔄 Restoring from backup..." -ForegroundColor Blue
        Get-Content $backupFile | docker exec -i siwes_postgres psql -U siwes_user -d siwes_management
        Write-Host "✅ Restore complete" -ForegroundColor Green
    } else {
        Write-Host "❌ Backup file not found" -ForegroundColor Red
    }
}

# Main command router
switch ($Command.ToLower()) {
    "start" { Start-Containers }
    "stop" { Stop-Containers }
    "restart" { Restart-Containers }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "shell" { Open-Shell }
    "clean" { Clean-All }
    "backup" { Backup-Database }
    "restore" { Restore-Database }
    default { Show-Help }
}
