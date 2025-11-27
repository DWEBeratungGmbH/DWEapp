#!/bin/bash

# Quick Deploy to Server with IP
# Usage: ./quick-deploy.sh [server-ip]

set -e

SERVER_IP=${1:-"91.98.135.191"}
SSH_USER="root"
APP_NAME="weclapp-manager"
REMOTE_DIR="/opt/$APP_NAME"

echo "🚀 Quick Deploy for $APP_NAME"
echo "📍 Server: $SERVER_IP"

# Build application
echo "🔨 Building application..."
npm run build

# Copy files to server
echo "📦 Copying files to server..."
scp -r .env.production docker-compose.yml nginx.conf Dockerfile $SSH_USER@$SERVER_IP:$REMOTE_DIR/
scp -r .next/ $SSH_USER@$SERVER_IP:$REMOTE_DIR/

# Deploy on server
echo "🚀 Deploying to server..."
ssh $SSH_USER@$SERVER_IP << EOF
    cd $REMOTE_DIR
    
    # Create SSL certificate
    if [ ! -f "/etc/ssl/certs/weclapp-manager.crt" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
          -keyout /etc/ssl/private/weclapp-manager.key \
          -out /etc/ssl/certs/weclapp-manager.crt \
          -subj "/CN=$SERVER_IP"
    fi
    
    # Stop and restart containers
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    echo "✅ Deployment completed!"
    echo "🌐 HTTP: http://$SERVER_IP"
    echo "🔒 HTTPS: https://$SERVER_IP"
EOF

echo "🎉 Quick deploy successful!"
echo "📊 Check status: ssh $SSH_USER@$SERVER_IP 'cd $REMOTE_DIR && docker-compose ps'"
echo "📝 View logs: ssh $SSH_USER@$SERVER_IP 'cd $REMOTE_DIR && docker-compose logs -f'"
