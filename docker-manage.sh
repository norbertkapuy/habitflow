#!/bin/bash

# HabitFlow Docker Management Script
# Usage: ./docker-manage.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose >/dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "HabitFlow Docker Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  build       Build all containers"
    echo "  rebuild     Rebuild all containers from scratch"
    echo "  logs        Show logs for all services"
    echo "  logs-f      Follow logs for all services"
    echo "  status      Show status of all containers"
    echo "  clean       Clean up containers and volumes"
    echo "  db-shell    Connect to PostgreSQL database"
    echo "  backend-shell  Connect to backend container"
    echo "  health      Check health of all services"
    echo "  backup      Backup database"
    echo "  restore     Restore database from backup"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start all services"
    echo "  $0 logs backend   # Show logs for backend service"
    echo "  $0 rebuild        # Rebuild and start all services"
}

# Function to start services
start_services() {
    print_status "Starting HabitFlow services..."
    docker-compose up -d
    print_success "All services started successfully!"
    print_status "Application available at: http://localhost"
    print_status "API available at: http://localhost:3001/api"
    print_status "Use '$0 logs' to view service logs"
}

# Function to stop services
stop_services() {
    print_status "Stopping HabitFlow services..."
    docker-compose down
    print_success "All services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_status "Restarting HabitFlow services..."
    docker-compose restart
    print_success "All services restarted successfully!"
}

# Function to build containers
build_containers() {
    print_status "Building HabitFlow containers..."
    docker-compose build
    print_success "All containers built successfully!"
}

# Function to rebuild containers
rebuild_containers() {
    print_status "Rebuilding HabitFlow containers from scratch..."
    docker-compose down --volumes --remove-orphans
    docker-compose build --no-cache
    docker-compose up -d
    print_success "All containers rebuilt and started successfully!"
}

# Function to show logs
show_logs() {
    if [ -n "$2" ]; then
        print_status "Showing logs for $2 service..."
        docker-compose logs "$2"
    else
        print_status "Showing logs for all services..."
        docker-compose logs
    fi
}

# Function to follow logs
follow_logs() {
    if [ -n "$2" ]; then
        print_status "Following logs for $2 service..."
        docker-compose logs -f "$2"
    else
        print_status "Following logs for all services..."
        docker-compose logs -f
    fi
}

# Function to show status
show_status() {
    print_status "Container status:"
    docker-compose ps
    
    echo ""
    print_status "Network status:"
    docker network ls | grep habitflow
    
    echo ""
    print_status "Volume status:"
    docker volume ls | grep habitflow
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up HabitFlow containers and volumes..."
        docker-compose down --volumes --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to connect to database
db_shell() {
    print_status "Connecting to PostgreSQL database..."
    docker-compose exec postgres psql -U habitflow_user -d habitflow
}

# Function to connect to backend container
backend_shell() {
    print_status "Connecting to backend container..."
    docker-compose exec backend sh
}

# Function to check health
check_health() {
    print_status "Checking health of all services..."
    
    # Check containers
    containers=$(docker-compose ps -q)
    if [ -z "$containers" ]; then
        print_error "No containers are running!"
        return 1
    fi
    
    # Check database
    if docker-compose exec -T postgres pg_isready -U habitflow_user -d habitflow >/dev/null 2>&1; then
        print_success "✓ Database is healthy"
    else
        print_error "✗ Database is not responding"
    fi
    
    # Check backend
    if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
        print_success "✓ Backend API is healthy"
    else
        print_error "✗ Backend API is not responding"
    fi
    
    # Check frontend
    if curl -sf http://localhost/ >/dev/null 2>&1; then
        print_success "✓ Frontend is healthy"
    else
        print_error "✗ Frontend is not responding"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_success "✓ Redis is healthy"
    else
        print_warning "⚠ Redis is not responding (optional service)"
    fi
}

# Function to backup database
backup_database() {
    print_status "Creating database backup..."
    backup_file="habitflow_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker-compose exec -T postgres pg_dump -U habitflow_user habitflow > "backups/$backup_file"; then
        print_success "Database backed up to: backups/$backup_file"
    else
        print_error "Failed to create database backup"
        return 1
    fi
}

# Function to restore database
restore_database() {
    if [ -z "$2" ]; then
        print_error "Please specify backup file: $0 restore <backup_file>"
        return 1
    fi
    
    backup_file="$2"
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_warning "This will replace all data in the database. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Restoring database from: $backup_file"
        if docker-compose exec -T postgres psql -U habitflow_user -d habitflow < "$backup_file"; then
            print_success "Database restored successfully!"
        else
            print_error "Failed to restore database"
            return 1
        fi
    else
        print_status "Restore cancelled."
    fi
}

# Create backups directory if it doesn't exist
mkdir -p backups

# Check prerequisites
check_docker
check_docker_compose

# Main command handling
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    build)
        build_containers
        ;;
    rebuild)
        rebuild_containers
        ;;
    logs)
        show_logs "$@"
        ;;
    logs-f)
        follow_logs "$@"
        ;;
    status)
        show_status
        ;;
    clean)
        clean_up
        ;;
    db-shell)
        db_shell
        ;;
    backend-shell)
        backend_shell
        ;;
    health)
        check_health
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$@"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 