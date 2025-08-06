# ELO Learning Deployment Summary

## What We've Set Up

### 🚀 Automated GitHub Actions Deployment

**Files Created:**

- `.github/workflows/simple-deploy.yml` - Main deployment workflow for cPanel
- `.github/workflows/cpanel-deploy.yml` - Alternative deployment with package upload
- `.github/workflows/deploy.yml` - Full-featured deployment (for VPS/dedicated servers)

**Key Features:**

- Automatically builds frontend with production environment variables
- Deploys on push to `main` or `production` branches
- Can be triggered manually via GitHub Actions interface
- Handles both PM2 and cPanel Node.js App environments

### 🔧 Environment Configuration

**Files Created:**

- `frontend/.env.local` - Development environment variables
- `frontend/.env.production` - Production environment variables
- `.env.example` - Template for environment variables

**Updated Files:**

- `frontend/src/services/api.js` - Now uses `NEXT_PUBLIC_API_URL`
- `frontend/src/utils/api.js` - Now uses `NEXT_PUBLIC_API_URL`
- `frontend/src/socket.js` - Now uses `NEXT_PUBLIC_SOCKET_URL`
- `frontend/src/app/login-landing/login/page.jsx` - Now uses `NEXT_PUBLIC_FRONTEND_URL`

### 📦 Deployment Scripts & Configuration

**Files Created:**

- `deploy-cpanel.sh` - Manual deployment script for cPanel
- `setup-cpanel.sh` - Initial server setup script
- `ecosystem.config.js` - PM2 configuration for process management
- `CPANEL_DEPLOYMENT.md` - Detailed cPanel deployment guide
- `DEPLOYMENT.md` - General deployment documentation

## How It Works

### Environment Variables

- **Development**: Uses `localhost` URLs from `.env.local`
- **Production**: Uses `https://elo-learning.co.za` from `.env.production`
- **Build Time**: GitHub Actions sets production URLs during build

### Deployment Flow

1. Push code to `main` branch
2. GitHub Actions triggers deployment workflow
3. Frontend is built with production environment variables
4. Application is deployed to your cPanel server
5. Services are restarted automatically

## Required GitHub Secrets

Add these to your GitHub repository settings (Settings → Secrets and variables → Actions):

```
AFRIHOST_HOST=your.server.domain.co.za
AFRIHOST_USERNAME=your_cpanel_username
AFRIHOST_SSH_KEY=your_private_ssh_key
AFRIHOST_PORT=22
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

## First-Time Setup on Server

1. **SSH into your cPanel server:**

   ```bash
   ssh your_username@your.server.domain.co.za
   ```

2. **Run the setup script:**

   ```bash
   wget https://raw.githubusercontent.com/COS301-SE-2025/ELO-Learning/main/setup-cpanel.sh
   chmod +x setup-cpanel.sh
   ./setup-cpanel.sh
   ```

3. **Configure cPanel Node.js App** (if using cPanel interface):
   - Go to cPanel → Node.js Apps
   - Create new app with startup file: `backend/src/server.js`
   - Set environment variables in cPanel interface

## Testing the Deployment

1. **Push to main branch** or trigger manually via GitHub Actions
2. **Check deployment status** in GitHub Actions tab
3. **Verify application** at https://elo-learning.co.za
4. **Check server status:**
   ```bash
   ssh your_username@your.server.domain.co.za
   ~/check-status.sh
   ```

## URL Changes Summary

### Before (Development)

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`
- Socket: `http://localhost:3000`

### After (Production)

- Frontend: `https://elo-learning.co.za`
- Backend API: `https://elo-learning.co.za`
- Socket: `https://elo-learning.co.za`

The URLs are automatically switched based on the environment during build time.

## Troubleshooting

### If Deployment Fails

1. Check GitHub Actions logs for specific errors
2. Verify all secrets are set correctly
3. SSH into server and check logs: `~/check-status.sh`
4. Review CPANEL_DEPLOYMENT.md for detailed troubleshooting

### If Application Won't Start

1. Check cPanel → Node.js Apps interface
2. Verify environment variables are set
3. Check server resource usage (memory/CPU limits)
4. Review application logs in `~/logs/` directory

## Next Steps

1. **Set up your GitHub secrets** with your Afrihost server details
2. **Run the setup script** on your cPanel server
3. **Configure cPanel Node.js App** or PM2 for process management
4. **Test deployment** by pushing to main branch
5. **Set up SSL certificate** if not already configured
6. **Configure domain/subdomain** routing if needed

Your application will automatically deploy whenever you push changes to the main branch, with all URLs correctly set to `https://elo-learning.co.za` in production! 🎉
