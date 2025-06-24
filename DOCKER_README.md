# HabitFlow - Docker Deployment Guide

This guide will help you deploy HabitFlow using Docker with a complete production-ready setup including PostgreSQL database, Nginx web server, and Redis caching.

## 🏗️ Architecture Overview

The Docker deployment consists of the following services:

- **Frontend**: Next.js application served by Nginx
- **Backend**: Node.js/Express API server
- **Database**: PostgreSQL 15 with optimized configuration
- **Web Server**: Nginx with SSL support and performance optimization
- **Cache**: Redis for session storage and caching (optional)

## 📋 Prerequisites

Before you begin, ensure you have:

- Docker (v20.0 or higher)
- Docker Compose (v2.0 or higher)
- At least 2GB of available RAM
- At least 5GB of available disk space

### Installing Docker

**macOS:**
```bash
brew install --cask docker
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
```

**Windows:**
Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

## 🚀 Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd habit-tracker
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

3. **Start all services:**
   ```bash
   ./docker-manage.sh start
   ```

4. **Access the application:**
   - **Frontend**: http://localhost
   - **API**: http://localhost:3001/api
   - **Health Check**: http://localhost:3001/api/health

## 🛠️ Management Commands

The `docker-manage.sh` script provides easy management of all services:

```bash
# Start all services
./docker-manage.sh start

# Stop all services
./docker-manage.sh stop

# Restart all services
./docker-manage.sh restart

# View logs
./docker-manage.sh logs
./docker-manage.sh logs backend  # Specific service

# Check health status
./docker-manage.sh health

# Build/rebuild containers
./docker-manage.sh build
./docker-manage.sh rebuild

# Database operations
./docker-manage.sh db-shell
./docker-manage.sh backup
./docker-manage.sh restore backup_file.sql

# Cleanup
./docker-manage.sh clean
```

## 📁 Project Structure

```
habit-tracker/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── index.js        # Main server file
│   ├── sql/
│   │   └── init.sql        # Database initialization
│   ├── Dockerfile          # Backend container
│   └── package.json
├── nginx/                   # Nginx configuration
│   ├── nginx.conf          # Main Nginx config
│   └── conf.d/
│       └── default.conf    # Virtual host config
├── docker-compose.yml      # Main compose file
├── docker-manage.sh        # Management script
└── README.md
```

## ⚙️ Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
DB_HOST=postgres
DB_USER=habitflow_user
DB_PASSWORD=habitflow_password
DB_NAME=habitflow

# API
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Database Configuration

The PostgreSQL database is automatically initialized with:
- Habits and habit_entries tables
- Proper indexes for performance
- Sample data (optional)
- User settings storage

### Nginx Configuration

Nginx is configured with:
- Static file serving for the frontend
- API proxy to the backend
- Gzip compression
- Security headers
- Rate limiting
- SSL/HTTPS support (configurable)

## 🔒 Security Features

- **Rate Limiting**: API and general request limits
- **CORS Protection**: Configured for the frontend domain
- **Security Headers**: XSS protection, content type sniffing prevention
- **Input Validation**: Comprehensive API validation
- **SQL Injection Protection**: Parameterized queries
- **Container Security**: Non-root users in containers

## 📊 Monitoring & Health Checks

All services include health checks:

```bash
# Check all services
./docker-manage.sh health

# Individual health endpoints
curl http://localhost/nginx-health
curl http://localhost:3001/api/health
```

Health check endpoints provide:
- Service status
- Database connectivity
- Memory usage
- Uptime information

## 🔄 Data Migration

To migrate data from localStorage to the database:

1. **Automatic Migration**: The frontend will detect localStorage data and offer migration
2. **Manual Migration**: Use the migration service in the settings
3. **Backup**: Local data is backed up before migration

```javascript
// Frontend migration service
import MigrationService from '@/lib/migration-service'

// Check if migration is needed
if (MigrationService.needsMigration()) {
  await MigrationService.migrate()
}
```

## 🗄️ Database Management

### Backup

```bash
# Create backup
./docker-manage.sh backup

# Backups are stored in ./backups/ directory
ls backups/
```

### Restore

```bash
# Restore from backup
./docker-manage.sh restore backups/habitflow_backup_20231201_120000.sql
```

### Direct Database Access

```bash
# Connect to PostgreSQL
./docker-manage.sh db-shell

# Run SQL commands
\l                          # List databases
\dt                         # List tables
SELECT * FROM habits;       # Query habits
```

## 🚀 Production Deployment

### SSL/HTTPS Setup

1. **Get SSL certificates** (Let's Encrypt recommended):
   ```bash
   sudo certbot certonly --nginx -d yourdomain.com
   ```

2. **Update nginx configuration**:
   ```bash
   # Edit nginx/conf.d/default.conf
   # Uncomment SSL section and update paths
   ```

3. **Update environment variables**:
   ```bash
   SSL_ENABLED=true
   FRONTEND_URL=https://yourdomain.com
   ```

### Performance Optimization

- **Database**: Tune PostgreSQL configuration for your server
- **Nginx**: Enable caching and optimize buffer sizes
- **Backend**: Configure connection pooling
- **Redis**: Use for session storage and API caching

### Scaling

For high-traffic deployments:

1. **Multiple Backend Instances**:
   ```yaml
   backend:
     deploy:
       replicas: 3
   ```

2. **Load Balancer**: Use nginx upstream for multiple backends
3. **Database**: Consider read replicas for heavy read workloads
4. **CDN**: Use a CDN for static assets

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using port 80/3001
sudo lsof -i :80
sudo lsof -i :3001

# Update ports in docker-compose.yml if needed
```

**Database connection issues:**
```bash
# Check database status
./docker-manage.sh status
docker-compose logs postgres

# Reset database
docker-compose down -v
./docker-manage.sh start
```

**Frontend build issues:**
```bash
# Rebuild with no cache
./docker-manage.sh rebuild

# Check frontend build logs
docker-compose logs frontend-build
```

### Logs and Debugging

```bash
# View all logs
./docker-manage.sh logs

# Follow live logs
./docker-manage.sh logs-f

# Service-specific logs
./docker-manage.sh logs postgres
./docker-manage.sh logs backend
./docker-manage.sh logs nginx
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check container health
./docker-manage.sh health

# Database performance
./docker-manage.sh db-shell
# Run EXPLAIN ANALYZE on slow queries
```

## 📚 API Documentation

The API provides comprehensive endpoints for:

- **Habits**: CRUD operations, categories, statistics
- **Entries**: Daily tracking, bulk operations, analytics
- **Health**: System health and monitoring

API documentation is available at: http://localhost:3001/api

### Example API Usage

```bash
# Get all habits
curl http://localhost:3001/api/habits

# Create a habit
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name":"Exercise","category":"Health","color":"#FF6B6B"}'

# Track completion
curl -X POST http://localhost:3001/api/entries \
  -H "Content-Type: application/json" \
  -d '{"habitId":"uuid","date":"2023-12-01","completed":true}'
```

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes with `./docker-manage.sh rebuild`
2. Update documentation for any configuration changes
3. Ensure all health checks pass
4. Test migration scenarios

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information, visit the main [README.md](./README.md) or check the [CLAUDE.md](./CLAUDE.md) for detailed project documentation. 