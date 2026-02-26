#!/bin/bash
# Docker Helper Commands for SIWES PostgreSQL Migration
# Make executable: chmod +x scripts/docker-commands.sh

echo "🐳 SIWES Docker Management Commands"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

show_help() {
    echo "Usage: ./scripts/docker-commands.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start        - Start PostgreSQL and pgAdmin containers"
    echo "  stop         - Stop all containers"
    echo "  restart      - Restart all containers"
    echo "  logs         - Show PostgreSQL logs"
    echo "  status       - Check container status"
    echo "  shell        - Open PostgreSQL shell (psql)"
    echo "  clean        - Remove containers and volumes (DESTRUCTIVE)"
    echo "  backup       - Backup PostgreSQL database to file"
    echo "  restore      - Restore PostgreSQL from backup file"
    echo ""
}

start_containers() {
    echo -e "${BLUE}Starting Docker containers...${NC}"
    docker-compose up -d
    echo ""
    echo -e "${GREEN}✅ Containers started!${NC}"
    echo ""
    echo "PostgreSQL: localhost:5432"
    echo "pgAdmin:    http://localhost:5050"
    echo "  Email:    admin@siwes.local"
    echo "  Password: admin123"
    echo ""
    echo "Run './scripts/docker-commands.sh status' to check health"
}

stop_containers() {
    echo -e "${BLUE}Stopping Docker containers...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Containers stopped${NC}"
}

restart_containers() {
    echo -e "${BLUE}Restarting Docker containers...${NC}"
    docker-compose restart
    echo -e "${GREEN}✅ Containers restarted${NC}"
}

show_logs() {
    echo -e "${BLUE}PostgreSQL logs (press Ctrl+C to exit):${NC}"
    docker-compose logs -f postgres
}

show_status() {
    echo -e "${BLUE}Container Status:${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}PostgreSQL Health Check:${NC}"
    docker exec siwes_postgres pg_isready -U siwes_user -d siwes_management
}

open_shell() {
    echo -e "${BLUE}Opening PostgreSQL shell...${NC}"
    echo "Type '\q' to exit, '\l' to list databases, '\dt' to list tables"
    echo ""
    docker exec -it siwes_postgres psql -U siwes_user -d siwes_management
}

clean_all() {
    echo -e "${YELLOW}⚠️  WARNING: This will delete all containers and data!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${BLUE}Cleaning up...${NC}"
        docker-compose down -v --remove-orphans
        echo -e "${GREEN}✅ Cleanup complete${NC}"
    else
        echo "Cancelled"
    fi
}

backup_db() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backup/postgres/backup_${TIMESTAMP}.sql"
    mkdir -p backup/postgres
    
    echo -e "${BLUE}Creating PostgreSQL backup...${NC}"
    docker exec siwes_postgres pg_dump -U siwes_user siwes_management > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created: ${BACKUP_FILE}${NC}"
    else
        echo -e "${YELLOW}❌ Backup failed${NC}"
    fi
}

restore_db() {
    echo "Available backups:"
    ls -lh backup/postgres/*.sql 2>/dev/null || echo "No backups found"
    echo ""
    read -p "Enter backup file path: " backup_file
    
    if [ -f "$backup_file" ]; then
        echo -e "${BLUE}Restoring from backup...${NC}"
        docker exec -i siwes_postgres psql -U siwes_user -d siwes_management < "$backup_file"
        echo -e "${GREEN}✅ Restore complete${NC}"
    else
        echo -e "${YELLOW}❌ Backup file not found${NC}"
    fi
}

# Main command router
case "$1" in
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        restart_containers
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    shell)
        open_shell
        ;;
    clean)
        clean_all
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db
        ;;
    *)
        show_help
        ;;
esac
