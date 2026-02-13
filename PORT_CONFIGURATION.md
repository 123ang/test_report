# Port Configuration

This document explains the custom port setup for the Test Report application.

## Port Assignments

| Service | Port | Description |
|---------|------|-------------|
| **Backend API** | 4014 | Node.js/Express server |
| **Frontend Dev** | 3014 | Vite development server |
| **PostgreSQL** | 5432 | Database (default) |

## Configuration Files

### Backend Port (4014)

The backend API runs on port **4014**. This is configured in:

**`backend/.env`**
```env
PORT=4014
```

**`backend/.env.example`**
```env
PORT=4014
```

### Frontend Port (3014)

The frontend development server runs on port **3014**. This is configured in:

**`frontend/vite.config.js`**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3014,
    host: true
  }
})
```

**`frontend/.env`** (or `.env.example`)
```env
VITE_API_URL=http://localhost:4014/api
```

## Local Development

When running locally:

1. **Backend**: `http://localhost:4014`
   - API endpoints: `http://localhost:4014/api/*`
   - Health check: `http://localhost:4014/api/health`

2. **Frontend**: `http://localhost:3014`
   - Main app: `http://localhost:3014`

## Production Deployment (VPS)

On the VPS, the setup is:

1. **Backend**: Runs on port 4014 (managed by PM2)
   - Not directly accessible from outside (proxied through Nginx)

2. **Frontend**: Built as static files
   - Served by Nginx at `https://test-report.suntzutechnologies.com`
   - Nginx proxies `/api/*` requests to `http://127.0.0.1:4014`

3. **Nginx Configuration**:
   ```nginx
   location /api/ {
       proxy_pass http://127.0.0.1:4014;
       # ... other proxy settings
   }
   ```

## Firewall Rules (VPS)

For VPS deployment, allow these ports:

```bash
sudo ufw allow OpenSSH          # SSH access
sudo ufw allow 'Nginx Full'     # HTTP (80) and HTTPS (443)
sudo ufw allow 4014/tcp         # Backend API
sudo ufw allow 3014/tcp         # Frontend dev (optional, only if running dev mode)
```

**Note**: Ports 3014 and 4014 only need to be open if you're running the servers in dev mode on the VPS. For production, Nginx handles all external traffic on ports 80/443.

## Changing Ports

If you need to use different ports:

1. **Backend**:
   - Update `PORT=` in `backend/.env`
   - Update Nginx `proxy_pass` to match the new port
   - Update firewall rules if needed

2. **Frontend**:
   - Update `server.port` in `frontend/vite.config.js`
   - Update `VITE_API_URL` in `frontend/.env` if backend port changed
   - Update firewall rules if needed

## Troubleshooting

**Port already in use?**

Check what's using the port:
```bash
# Windows
netstat -ano | findstr :4014
netstat -ano | findstr :3014

# Linux/Mac
lsof -ti:4014
lsof -ti:3014
```

Kill the process or change the port in the configuration files.

**Can't connect to API?**

1. Verify backend is running: `curl http://localhost:4014/api/health`
2. Check `VITE_API_URL` in frontend `.env` matches backend port
3. Check firewall rules if accessing from another machine
4. Check Nginx configuration if deployed on VPS
