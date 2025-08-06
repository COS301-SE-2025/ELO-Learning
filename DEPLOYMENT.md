# Deployment Guide

## Overview

This guide explains how to deploy the ELO Learning application to your Afrihost server using GitHub Actions.

## Prerequisites

### 1. Server Setup

Ensure your Afrihost server has:

- Node.js 18+ installed
- PM2 process manager (`npm install -g pm2`)
- Git installed
- Your repository cloned at `/var/www/elo-learning`

### 2. GitHub Secrets

Add the following secrets to your GitHub repository settings:

```
AFRIHOST_HOST=your.server.ip.address
AFRIHOST_USERNAME=your_username
AFRIHOST_SSH_KEY=your_private_ssh_key
AFRIHOST_PORT=22 (optional, defaults to 22)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

## Environment Configuration

### Development

The application uses these URLs in development:

- Frontend: http://localhost:8080
- Backend: http://localhost:3000

### Production

The application uses these URLs in production:

- Frontend: https://elo-learning.co.za
- Backend: https://elo-learning.co.za

## Deployment Process

### Automatic Deployment

1. Push to `main` or `production` branch
2. GitHub Actions will automatically:
   - Build the frontend with production environment variables
   - Deploy to your Afrihost server
   - Restart the services

### Manual Deployment

You can also trigger deployment manually:

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Deploy to Afrihost" workflow
4. Click "Run workflow"

## Server Setup Commands

If you're setting up the server for the first time:

```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone your repository
cd /var/www
sudo git clone https://github.com/COS301-SE-2025/ELO-Learning.git elo-learning
sudo chown -R $USER:$USER elo-learning

# Initial setup
cd elo-learning
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Create logs directory
mkdir -p logs

# Start services for the first time
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Monitoring

### Check PM2 Status

```bash
pm2 status
pm2 logs
```

### Check Application Health

```bash
# Backend health check
curl https://elo-learning.co.za/health

# Frontend check
curl https://elo-learning.co.za
```

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all environment variables are set correctly
2. **Services won't start**: Check PM2 logs with `pm2 logs`
3. **Connection refused**: Ensure the correct ports are open and services are running

### Debug Commands

```bash
# Check PM2 processes
pm2 list

# View logs
pm2 logs elo-backend
pm2 logs elo-frontend

# Restart specific service
pm2 restart elo-backend
pm2 restart elo-frontend

# Check server resources
pm2 monit
```

## Environment Variables

### Frontend (.env.production)

```
NEXT_PUBLIC_API_URL=https://elo-learning.co.za
NEXT_PUBLIC_FRONTEND_URL=https://elo-learning.co.za
NEXT_PUBLIC_SOCKET_URL=https://elo-learning.co.za
```

### Backend (.env)

```
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

## Reverse Proxy Configuration

If using Nginx as a reverse proxy, here's a sample configuration:

```nginx
server {
    listen 80;
    server_name elo-learning.co.za;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name elo-learning.co.za;

    # SSL configuration
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
