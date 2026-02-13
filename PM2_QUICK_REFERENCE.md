# PM2 Quick Reference

Quick commands for managing Test Report with PM2.

## Start Services

```bash
# Development (both backend + frontend)
pm2 start ecosystem.config.cjs

# Production (backend only)
pm2 start ecosystem.production.config.cjs
```

## Monitor & Status

```bash
pm2 status                    # List all services
pm2 list                      # Same as status
pm2 monit                     # Real-time monitoring dashboard
pm2 describe <name>           # Detailed info about a service
```

## Logs

```bash
pm2 logs                      # All logs (live)
pm2 logs <name>               # Specific service logs
pm2 logs --lines 100          # Last 100 lines
pm2 flush                     # Clear all logs
```

## Control Services

```bash
pm2 stop all                  # Stop all services
pm2 stop <name>               # Stop specific service
pm2 restart all               # Restart all services
pm2 restart <name>            # Restart specific service
pm2 reload all                # Reload all (zero-downtime)
pm2 delete all                # Delete all services
pm2 delete <name>             # Delete specific service
```

## Service Names

- **Development**: `test-report-backend`, `test-report-frontend`
- **Production**: `test-report-api`

## Persistence

```bash
pm2 save                      # Save current process list
pm2 startup                   # Generate startup script
pm2 unstartup                 # Remove startup script
pm2 resurrect                 # Restore saved processes
```

## Update & Maintenance

```bash
pm2 update                    # Update PM2 in-memory
pm2 reset <name>              # Reset restart counter
pm2 --version                 # Check PM2 version
```

## Common Workflows

### Local Development

```bash
cd c:\Users\User\Desktop\Website\test_report
pm2 start ecosystem.config.cjs
pm2 logs
# When done:
pm2 stop all
```

### Production Deployment

```bash
cd /root/projects/test_report
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart ecosystem.production.config.cjs
pm2 logs test-report-api --lines 50
```

### Quick Restart After Code Changes

```bash
pm2 restart test-report-backend  # or test-report-api
```

## Troubleshooting

```bash
# Check if service is running
pm2 status

# View recent errors
pm2 logs <name> --err --lines 50

# Check service details
pm2 describe <name>

# Restart if stuck
pm2 delete <name>
pm2 start ecosystem.config.cjs
```

## More Info

See **`PM2_GUIDE.md`** for detailed documentation.
