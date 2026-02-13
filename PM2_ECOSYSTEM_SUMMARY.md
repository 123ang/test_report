# PM2 Ecosystem Configuration Summary

## Overview

The Test Report application includes PM2 ecosystem configuration files for easy process management.

## Files Created

### 1. `ecosystem.config.cjs`
**Purpose**: Development environment (local machine)

**Services**:
- `test-report-backend` - Backend API on port 4014
- `test-report-frontend` - Frontend dev server on port 3014

**Usage**:
```bash
pm2 start ecosystem.config.cjs
```

### 2. `ecosystem.production.config.cjs`
**Purpose**: Production environment (VPS)

**Services**:
- `test-report-api` - Backend API on port 4014 only

**Usage**:
```bash
pm2 start ecosystem.production.config.cjs
```

**Note**: In production, the frontend is built as static files and served by Nginx, so only the backend runs via PM2.

## Key Features

Both ecosystem configs include:

✅ **Auto-restart** - Services restart automatically if they crash  
✅ **Memory limits** - Auto-restart if memory exceeds 500MB  
✅ **Log management** - Separate error and output logs  
✅ **Environment variables** - Proper NODE_ENV and PORT settings  
✅ **Graceful restarts** - Minimum uptime checks before restart  

## Quick Commands

```bash
# Start services
pm2 start ecosystem.config.cjs

# Check status
pm2 status

# View logs
pm2 logs

# Restart all
pm2 restart all

# Stop all
pm2 stop all

# Save process list (for auto-start on reboot)
pm2 save

# Enable auto-start on system boot
pm2 startup
```

## Log Files Location

Logs are stored in:
- `backend/logs/backend-error.log` (development)
- `backend/logs/backend-out.log` (development)
- `backend/logs/api-error.log` (production)
- `backend/logs/api-out.log` (production)
- `frontend/logs/frontend-error.log` (development only)
- `frontend/logs/frontend-out.log` (development only)

**Important**: Create the logs directories before starting:
```bash
mkdir backend/logs
mkdir frontend/logs
```

## Configuration Details

### Development Config (`ecosystem.config.cjs`)

```javascript
{
  apps: [
    {
      name: 'test-report-backend',
      cwd: './backend',
      script: 'src/index.js',
      env: { NODE_ENV: 'production', PORT: 4014 }
    },
    {
      name: 'test-report-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev -- --port 3014 --host 0.0.0.0',
      env: { NODE_ENV: 'development' }
    }
  ]
}
```

### Production Config (`ecosystem.production.config.cjs`)

```javascript
{
  apps: [
    {
      name: 'test-report-api',
      cwd: './backend',
      script: 'src/index.js',
      env: { NODE_ENV: 'production', PORT: 4014 }
    }
  ]
}
```

## Benefits of Using PM2 Ecosystem

1. **Single Command Start** - Start all services with one command
2. **Consistent Configuration** - Same setup across team members
3. **Easy Deployment** - Simple to deploy and manage on VPS
4. **Process Monitoring** - Built-in monitoring and logging
5. **Auto-recovery** - Automatic restart on crashes
6. **Graceful Reload** - Zero-downtime deployments possible

## Integration with Existing Workflow

### Local Development

**Before** (manual):
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**After** (with PM2):
```bash
pm2 start ecosystem.config.cjs
pm2 logs
```

### Production Deployment

**Before** (manual):
```bash
cd /root/projects/test_report/backend
pm2 start src/index.js --name test-report-api
```

**After** (with ecosystem):
```bash
cd /root/projects/test_report
pm2 start ecosystem.production.config.cjs
```

## Next Steps

1. **Install PM2 globally** (if not already installed):
   ```bash
   npm install -g pm2
   ```

2. **Try it locally**:
   ```bash
   cd c:\Users\User\Desktop\Website\test_report
   pm2 start ecosystem.config.cjs
   pm2 status
   ```

3. **Deploy to VPS**:
   ```bash
   cd /root/projects/test_report
   pm2 start ecosystem.production.config.cjs
   pm2 save
   pm2 startup
   ```

4. **Read the guides**:
   - `PM2_GUIDE.md` - Comprehensive PM2 documentation
   - `PM2_QUICK_REFERENCE.md` - Quick command reference

## Troubleshooting

**Services won't start?**
- Check if ports 3014/4014 are available
- Verify `.env` files exist in backend/frontend
- Check logs: `pm2 logs`

**Want to customize?**
- Edit `ecosystem.config.cjs` or `ecosystem.production.config.cjs`
- Change ports, add environment variables, adjust memory limits
- Restart: `pm2 restart all`

## Additional Resources

- [PM2 Official Documentation](https://pm2.keymetrics.io/)
- [PM2 Ecosystem File Reference](https://pm2.keymetrics.io/docs/usage/application-declaration/)
- Project guide: `PM2_GUIDE.md`
