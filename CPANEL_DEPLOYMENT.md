# cPanel Deployment Guide for ELO Learning

## Overview

This guide specifically covers deploying the ELO Learning application to Afrihost's cPanel hosting environment.

## Prerequisites

### 1. cPanel Setup

- Node.js App support enabled in cPanel
- SSH access enabled
- Git repositories feature available
- Sufficient resources (memory/CPU) for Node.js apps

### 2. GitHub Repository Secrets

Add these secrets to your GitHub repository:

```
AFRIHOST_HOST=your-domain.co.za (or IP address)
AFRIHOST_USERNAME=your_cpanel_username
AFRIHOST_SSH_KEY=your_private_ssh_key
AFRIHOST_PORT=22
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret_key
```

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

The simplest approach using our automated workflow:

1. **Setup Repository on Server**

   ```bash
   # SSH into your server
   ssh your_username@your-domain.co.za

   # Create repository directory
   mkdir -p ~/repositories
   cd ~/repositories

   # Clone your repository
   git clone https://github.com/COS301-SE-2025/ELO-Learning.git elo-learning
   ```

2. **Push to Main Branch**
   - Any push to `main` or `production` branch triggers automatic deployment
   - Or manually trigger via GitHub Actions interface

### Method 2: Manual Deployment Script

Use the included deployment script:

1. **Upload and run the script**

   ```bash
   # Copy the script to your server
   scp deploy-cpanel.sh your_username@your-domain.co.za:~/

   # SSH and run
   ssh your_username@your-domain.co.za
   chmod +x ~/deploy-cpanel.sh
   ./deploy-cpanel.sh
   ```

### Method 3: cPanel Git Deployment (If Available)

If your cPanel has Git Deployment feature:

1. Go to cPanel → Git Version Control
2. Create a new repository or clone existing
3. Set deployment path to `public_html` or app directory
4. Configure post-receive hooks for automatic deployment

## cPanel Node.js App Configuration

### Setting up the Node.js Application

1. **Access cPanel → Node.js Apps**
2. **Create New App** with these settings:

   - **App Name**: ELO Learning Backend
   - **Node.js Version**: 18.x or latest
   - **Application Mode**: Production
   - **Application Root**: `elo-learning-app` (or your preferred directory)
   - **Application URL**: Your domain or subdomain
   - **Application Startup File**: `src/server.js`

3. **Environment Variables** (Add in cPanel interface):
   ```
   NODE_ENV=production
   PORT=3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   JWT_SECRET=your_jwt_secret
   ```

### Frontend Configuration Options

#### Option A: Static Export (Simplest)

For static hosting, update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // ... other config
};
```

Then build and copy to `public_html`:

```bash
npm run build
cp -r out/* ~/public_html/
```

#### Option B: Node.js Server (Full Features)

Keep the current setup and run Next.js as a Node.js app through cPanel.

## Directory Structure in cPanel

```
~/
├── public_html/              # Web root (for static files)
├── repositories/
│   └── elo-learning/        # Git repository
│       ├── backend/
│       ├── frontend/
│       └── ecosystem.config.js
├── elo-learning-app/        # Node.js app directory (backend)
├── logs/                    # Application logs
└── deploy-cpanel.sh         # Deployment script
```

## Troubleshooting

### Common cPanel Issues

1. **Memory Limits**

   - cPanel shared hosting often has memory restrictions
   - Monitor usage in cPanel → Resource Usage
   - Consider upgrading if hitting limits

2. **Port Restrictions**

   - Some ports may be blocked
   - Use cPanel's assigned ports for Node.js apps
   - Check cPanel → Node.js Apps for assigned ports

3. **File Permissions**

   ```bash
   # Fix common permission issues
   chmod -R 755 ~/repositories/elo-learning
   chmod +x ~/repositories/elo-learning/backend/src/server.js
   ```

4. **Node.js Version Issues**

   ```bash
   # Check available versions
   ls /opt/alt/alt-nodejs*/bin/

   # Update package.json engines if needed
   ```

### Debug Commands

```bash
# Check Node.js app status in cPanel
cloudlinux-selector list --json --interpreter nodejs

# Check running processes
ps aux | grep node

# Monitor logs
tail -f ~/logs/*.log
tail -f ~/repositories/elo-learning/logs/*.log

# Check disk usage
du -sh ~/repositories/elo-learning
df -h
```

## Performance Optimization for Shared Hosting

1. **Enable caching** in Next.js config
2. **Minimize dependencies** - use `--omit=dev`
3. **Optimize images** - use Next.js Image component
4. **Monitor resource usage** regularly
5. **Use CDN** for static assets if possible

## SSL Certificate

If not automatically provided:

1. Go to cPanel → SSL/TLS
2. Use Let's Encrypt (if available) or upload custom certificate
3. Force HTTPS redirects

## Backup Strategy

1. **Database**: Regular Supabase backups
2. **Files**: cPanel backup feature
3. **Repository**: Already on GitHub

## Support

- **Afrihost Support**: For server/cPanel specific issues
- **Repository Issues**: GitHub issues page
- **Documentation**: This file and DEPLOYMENT.md
