#!/bin/bash

# cPanel Deployment Script for ELO Learning
# This script should be run on your cPanel server

echo "🚀 Starting ELO Learning deployment..."

# Configuration
REPO_DIR="$HOME/repositories/elo-learning"
PUBLIC_HTML="$HOME/public_html"
NODE_APP_DIR="$HOME/elo-learning-app"

# Create directories if they don't exist
mkdir -p "$NODE_APP_DIR"
mkdir -p "$REPO_DIR"

# Navigate to repository
cd "$REPO_DIR" || {
    echo "❌ Repository directory not found. Please clone the repository first."
    exit 1
}

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing backend dependencies..."
cd backend
npm install --omit=dev

echo "🔧 Setting up backend environment..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_KEY=${SUPABASE_KEY}
JWT_SECRET=${JWT_SECRET}
EOF

echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build

echo "📁 Deploying files..."

# Copy backend to app directory
cp -r ../backend/* "$NODE_APP_DIR/"

# For static hosting, copy frontend build to public_html
if [ -d "$PUBLIC_HTML" ]; then
    echo "📂 Copying frontend to public_html..."
    
    # Copy Next.js build output
    cp -r .next/static "$PUBLIC_HTML/" 2>/dev/null || true
    cp -r public/* "$PUBLIC_HTML/" 2>/dev/null || true
    
    # Create a simple index.html redirect if needed
    cat > "$PUBLIC_HTML/index.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>ELO Learning</title>
    <meta http-equiv="refresh" content="0; url=/dashboard">
</head>
<body>
    <p>Redirecting to <a href="/dashboard">ELO Learning</a>...</p>
</body>
</html>
EOF
fi

echo "🔄 Managing Node.js application..."

# Check if this is a cPanel environment with Node.js support
if [ -f ~/.bashrc ] && grep -q "cloudlinux" ~/.bashrc 2>/dev/null; then
    echo "🏗️  Detected cPanel with CloudLinux Node.js support"
    
    # Try to restart Node.js app through CloudLinux selector
    cloudlinux-selector restart --json --interpreter nodejs --user $(whoami) 2>/dev/null || {
        echo "⚠️  CloudLinux selector restart failed or not available"
    }
fi

# Try PM2 if available
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting services with PM2..."
    cd "$REPO_DIR"
    pm2 restart all 2>/dev/null || pm2 start ecosystem.config.js 2>/dev/null || {
        echo "⚠️  PM2 restart failed. You may need to start the application manually."
    }
else
    echo "⚠️  PM2 not available. Please restart your Node.js application through cPanel interface."
fi

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. If using cPanel Node.js Apps, make sure to:"
echo "   - Set the startup file to: $NODE_APP_DIR/src/server.js"
echo "   - Configure environment variables in cPanel interface"
echo "   - Set the application URL in cPanel"
echo ""
echo "2. If using PM2, check status with: pm2 status"
echo ""
echo "3. Check logs:"
echo "   - Backend logs: tail -f $NODE_APP_DIR/logs/*.log"
echo "   - PM2 logs: pm2 logs"
echo ""
echo "🌐 Your application should be available at: https://elo-learning.co.za"
