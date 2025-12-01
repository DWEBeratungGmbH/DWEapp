#!/bin/bash

# WeClapp Manager Deployment Script
# Usage: ./deploy.sh [server-ip]

set -e

# Configuration
SERVER_IP=${1:-"91.98.135.191"}
SSH_USER="root"
APP_NAME="weclapp-manager"
REMOTE_DIR="/opt/$APP_NAME"

echo "🚀 Starting deployment for $APP_NAME"
echo "📍 Server: $SERVER_IP"

# Check if required files exist
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found!"
    exit 1
fi

# Deploy to server
echo "🚀 Deploying application..."
ssh $SSH_USER@$SERVER_IP << EOF
    cd $REMOTE_DIR
    
    # Stop existing service
    systemctl stop weclapp-manager 2>/dev/null || true
    
    # Pull latest code
    git pull origin main
    
    # Install dependencies
    npm ci --production
    
    # Build application
    npm run build
    
    # Generate Prisma client
    npx prisma generate
    
    # Start service
    systemctl start weclapp-manager
    systemctl enable weclapp-manager
    
    echo "✅ Application deployed and started!"
EOF

echo "🎉 Deployment successful!"
echo "🌐 Your app is available at: https://$SERVER_IP"
echo "📊 Check status: ssh root@$SERVER_IP 'systemctl status weclapp-manager'"
echo "📝 View logs: ssh root@$SERVER_IP 'journalctl -u weclapp-manager -f'"
