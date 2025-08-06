#!/bin/bash

# Initial cPanel Server Setup for ELO Learning
# Run this script once on your cPanel server to set up the environment

echo "🛠️  Setting up ELO Learning on cPanel server..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ~/repositories
mkdir -p ~/elo-learning-app
mkdir -p ~/logs
mkdir -p ~/backups

# Check if Git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not available. Please install Git or use cPanel's Git feature."
    exit 1
fi

# Clone the repository if it doesn't exist
if [ ! -d ~/repositories/elo-learning ]; then
    echo "📥 Cloning repository..."
    cd ~/repositories
    git clone https://github.com/COS301-SE-2025/ELO-Learning.git elo-learning
    cd elo-learning
else
    echo "📥 Repository exists, pulling latest changes..."
    cd ~/repositories/elo-learning
    git pull origin main
fi

# Check Node.js availability
echo "🔍 Checking Node.js availability..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "⚠️  Node.js not found in PATH. It may be available through cPanel interface."
fi

# Check for PM2
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 found: $(pm2 --version)"
else
    echo "⚠️  PM2 not found. You can install it with: npm install -g pm2"
    echo "   Or use cPanel's Node.js App interface instead."
fi

# Check for CloudLinux
if command -v cloudlinux-selector &> /dev/null; then
    echo "✅ CloudLinux Node.js selector found"
    cloudlinux-selector list --json --interpreter nodejs 2>/dev/null || true
else
    echo "ℹ️  CloudLinux selector not found (normal for some hosting setups)"
fi

# Set up basic environment file
echo "🔧 Creating environment template..."
cat > ~/elo-learning-app/.env.template << 'EOF'
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
JWT_SECRET=your_jwt_secret_here
EOF

# Create a simple status check script
cat > ~/check-status.sh << 'EOF'
#!/bin/bash
echo "🔍 ELO Learning Status Check"
echo "=========================="

# Check if PM2 is running our apps
if command -v pm2 &> /dev/null; then
    echo "📊 PM2 Status:"
    pm2 status
    echo ""
fi

# Check running Node.js processes
echo "🔄 Node.js Processes:"
ps aux | grep -E "(node|npm)" | grep -v grep

echo ""
echo "📁 Directory Sizes:"
du -sh ~/repositories/elo-learning 2>/dev/null || echo "Repository not found"
du -sh ~/elo-learning-app 2>/dev/null || echo "App directory not found"

echo ""
echo "💾 Disk Usage:"
df -h . | tail -1

echo ""
echo "📝 Recent Logs (if available):"
if [ -d ~/logs ]; then
    ls -la ~/logs/
else
    echo "No logs directory found"
fi
EOF

chmod +x ~/check-status.sh

echo ""
echo "✅ Initial setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your GitHub secrets for automated deployment:"
echo "   - AFRIHOST_HOST: $(hostname -I | awk '{print $1}' 2>/dev/null || echo 'your.server.ip')"
echo "   - AFRIHOST_USERNAME: $(whoami)"
echo "   - AFRIHOST_SSH_KEY: Your private SSH key"
echo "   - SUPABASE_URL, SUPABASE_KEY, JWT_SECRET: Your application secrets"
echo ""
echo "2. Configure cPanel Node.js App (if using cPanel interface):"
echo "   - Application Root: elo-learning-app"
echo "   - Startup File: backend/src/server.js"
echo "   - Set environment variables in cPanel interface"
echo ""
echo "3. Or install PM2 and use ecosystem.config.js:"
echo "   npm install -g pm2"
echo "   pm2 start ~/repositories/elo-learning/ecosystem.config.js"
echo ""
echo "4. Test deployment by pushing to your main branch"
echo ""
echo "🔍 Run ~/check-status.sh anytime to check your application status"
echo ""
echo "📚 See CPANEL_DEPLOYMENT.md for detailed instructions"
