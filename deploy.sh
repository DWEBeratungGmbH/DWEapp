#!/bin/bash

# Hetzner Cloud Deployment Script for WeClapp Manager
# Usage: ./deploy.sh [server-ip] [domain]

set -e

# Configuration
SERVER_IP=${1:-"YOUR_SERVER_IP"}
DOMAIN=${2:-"your-domain.com"}
SSH_USER="root"
APP_NAME="weclapp-manager"
REMOTE_DIR="/opt/$APP_NAME"

echo "🚀 Starting Hetzner Cloud deployment for $APP_NAME"
echo "📍 Server: $SERVER_IP"
echo "🌐 Domain: $DOMAIN"

# Check if required files exist
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found!"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found! Please create it first."
    exit 1
fi

# Create SSH key if not exists
if [ ! -f "~/.ssh/hetzner_key" ]; then
    echo "🔑 Creating SSH key for Hetzner..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/hetzner_key -N ""
    echo "⚠️  Add this public key to your Hetzner server:"
    cat ~/.ssh/hetzner_key.pub
    read -p "Press Enter after adding the key to Hetzner..."
fi

# Connect to server and setup
echo "🔧 Setting up server environment..."
ssh -i ~/.ssh/hetzner_key $SSH_USER@$SERVER_IP << 'EOF'
    # Update system
    apt update && apt upgrade -y
    
    # Install Docker and Docker Compose
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker root
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # Install additional tools
    apt install -y git curl nginx certbot python3-certbot-nginx
    
    # Create app directory
    mkdir -p /opt/weclapp-manager
    cd /opt/weclapp-manager
    
    # Setup firewall
    ufw allow 22
    ufw allow 80
    ufw allow 443
    ufw --force enable
EOF

# Copy files to server
echo "📦 Copying application files..."
scp -i ~/.ssh/hetzner_key -r . $SSH_USER@$SERVER_IP:$REMOTE_DIR/

# Deploy on server
echo "🚀 Deploying application..."
ssh -i ~/.ssh/hetzner_key $SSH_USER@$SERVER_IP << EOF
    cd $REMOTE_DIR
    
    # Update domain in nginx.conf
    sed -i "s/your-domain.com/$DOMAIN/g" nginx.conf
    
    # Build and start containers
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for application to start
    sleep 10
    
    # Setup SSL with Let's Encrypt
    if [ ! -f "/etc/nginx/ssl/cert.pem" ]; then
        mkdir -p /etc/nginx/ssl
        certbot --nginx -d $DOMAIN --d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # Copy SSL certificates
        cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/cert.pem
        cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/nginx/ssl/key.pem
    fi
    
    # Restart nginx
    docker-compose restart nginx
    
    # Setup automatic SSL renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * certbot renew --quiet && docker-compose restart nginx") | crontab -
    
    echo "✅ Deployment completed!"
    echo "🌐 Your app is available at: https://$DOMAIN"
EOF

echo "🎉 Deployment successful!"
echo "📊 Check application status: ssh -i ~/.ssh/hetzner_key root@$SERVER_IP 'cd $REMOTE_DIR && docker-compose ps'"
echo "📝 View logs: ssh -i ~/.ssh/hetzner_key root@$SERVER_IP 'cd $REMOTE_DIR && docker-compose logs -f'"
