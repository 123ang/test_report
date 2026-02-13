# PM2 Ecosystem Guide

This guide explains how to use PM2 with the ecosystem configuration files to manage the Test Report application.

## Ecosystem Configuration Files

We have two ecosystem configuration files:

1. **`ecosystem.config.cjs`** - For development (runs both backend and frontend)
2. **`ecosystem.production.config.cjs`** - For production (backend only, frontend is built and served by Nginx)

## Local Development Usage

### Start Both Services (Backend + Frontend)

```bash
pm2 start ecosystem.config.cjs
```

This will start:
- **Backend** on port 4014
- **Frontend** dev server on port 3014

### Check Status

```bash
pm2 status
```

or

```bash
pm2 list
```

### View Logs

```bash
# All logs
pm2 logs

# Backend logs only
pm2 logs test-report-backend

# Frontend logs only
pm2 logs test-report-frontend

# Last 100 lines
pm2 logs --lines 100
```

### Stop Services

```bash
# Stop all
pm2 stop all

# Stop specific service
pm2 stop test-report-backend
pm2 stop test-report-frontend
```

### Restart Services

```bash
# Restart all
pm2 restart all

# Restart specific service
pm2 restart test-report-backend
pm2 restart test-report-frontend
```

### Delete Services

```bash
# Delete all
pm2 delete all

# Delete specific service
pm2 delete test-report-backend
pm2 delete test-report-frontend
```

### Save PM2 Process List

To save the current process list (so it auto-starts on system reboot):

```bash
pm2 save
```

### Auto-start on System Boot

```bash
# Generate startup script
pm2 startup

# Follow the instructions shown (you'll need to run a command with sudo)

# After that, save the process list
pm2 save
```

## Production (VPS) Usage

### Start Backend Only

```bash
pm2 start ecosystem.production.config.cjs
```

This starts only the backend API on port 4014. The frontend is served as static files by Nginx.

### Alternative: Start Backend Manually

If you prefer not to use the ecosystem file:

```bash
cd /root/projects/test_report/backend
pm2 start src/index.js --name test-report-api
```

### Check Status

```bash
pm2 status
```

### View Logs

```bash
pm2 logs test-report-api
```

### Restart After Code Changes

```bash
pm2 restart test-report-api
```

### Save and Enable Auto-start

```bash
pm2 save
pm2 startup
```

## PM2 Commands Cheat Sheet

| Command | Description |
|---------|-------------|
| `pm2 start ecosystem.config.cjs` | Start all services from config |
| `pm2 stop all` | Stop all services |
| `pm2 restart all` | Restart all services |
| `pm2 delete all` | Delete all services |
| `pm2 list` | List all running services |
| `pm2 logs` | View logs (all services) |
| `pm2 logs <name>` | View logs for specific service |
| `pm2 monit` | Monitor CPU/memory usage |
| `pm2 describe <name>` | Show detailed info about a service |
| `pm2 save` | Save current process list |
| `pm2 startup` | Generate startup script |
| `pm2 unstartup` | Remove startup script |
| `pm2 update` | Update PM2 in-memory |
| `pm2 flush` | Flush all logs |

## Monitoring

### Real-time Monitoring

```bash
pm2 monit
```

This opens an interactive dashboard showing CPU, memory, and logs.

### Web Dashboard (Optional)

```bash
pm2 plus
```

Follow the instructions to connect to PM2 Plus for a web-based dashboard.

## Environment Variables

### Development

The ecosystem config uses environment variables from:
- `backend/.env` (loaded by the app)
- Inline env vars in `ecosystem.config.cjs`

### Production

The ecosystem config uses:
- `backend/.env` (loaded by the app)
- Inline env vars in `ecosystem.production.config.cjs`

## Log Files

Logs are stored in:
- `backend/logs/backend-error.log` (or `api-error.log` in production)
- `backend/logs/backend-out.log` (or `api-out.log` in production)
- `frontend/logs/frontend-error.log` (development only)
- `frontend/logs/frontend-out.log` (development only)

**Note**: Make sure the `logs` directories exist:

```bash
mkdir -p backend/logs
mkdir -p frontend/logs
```

## Troubleshooting

### Service Won't Start

1. Check logs: `pm2 logs <service-name>`
2. Check if port is in use: `netstat -ano | findstr :4014` (Windows) or `lsof -ti:4014` (Linux/Mac)
3. Verify `.env` files exist and are configured correctly
4. Check that dependencies are installed: `npm install`

### High Memory Usage

PM2 will automatically restart services if they exceed `max_memory_restart` (500M by default).

To change this, edit the ecosystem config file and restart:

```javascript
max_memory_restart: '1G'  // Increase to 1GB
```

### Auto-restart Not Working

If services don't auto-start on reboot:

1. Run `pm2 startup` again
2. Execute the command it shows (with sudo)
3. Start your services
4. Run `pm2 save`

## Complete Workflow Examples

### Local Development

```bash
# 1. Start services
pm2 start ecosystem.config.cjs

# 2. Check status
pm2 status

# 3. View logs
pm2 logs

# 4. When done, stop services
pm2 stop all
```

### Production Deployment

```bash
# 1. Navigate to project
cd /root/projects/test_report

# 2. Pull latest code
git pull

# 3. Install dependencies
cd backend && npm install
cd ../frontend && npm install && npm run build

# 4. Start/restart backend
pm2 restart ecosystem.production.config.cjs

# Or if not running yet:
pm2 start ecosystem.production.config.cjs

# 5. Save process list
pm2 save

# 6. Check status
pm2 status

# 7. View logs
pm2 logs test-report-api --lines 50
```

## Advanced Configuration

### Cluster Mode (Multiple Instances)

To run multiple instances of the backend for load balancing:

```javascript
{
  name: 'test-report-api',
  script: 'src/index.js',
  instances: 4,  // or 'max' for all CPU cores
  exec_mode: 'cluster',
  // ... other settings
}
```

### Watch Mode (Auto-restart on File Changes)

For development only:

```javascript
{
  watch: true,
  ignore_watch: ['node_modules', 'logs', 'uploads'],
  // ... other settings
}
```

## Additional Resources

- [PM2 Official Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Ecosystem File Reference](https://pm2.keymetrics.io/docs/usage/application-declaration/)
- [PM2 Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
