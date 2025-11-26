#!/bin/bash

# FINAL DEPLOYMENT SCRIPT
# Usage: ./FINAL_DEPLOY.sh SERVER_IP

set -e

SERVER_IP=${1:-"IHR_SERVER_IP_HIER"}

echo "🚀 Starting WeClapp Manager Final Deployment..."
echo "📍 Server: $SERVER_IP"

# SSH zum Server und alles durchführen
ssh deploy@$SERVER_IP << EOF
echo "🔧 Setting up WeClapp Manager..."

cd /opt/weclapp-manager

# Repository klonen (ersetzen Sie mit Ihrem Git-Repo)
if [ ! -d ".git" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/your-username/weclapp-manager.git .
else
    echo "📥 Updating repository..."
    git pull origin main
fi

# Docker Image bauen
echo "🐳 Building Docker image..."
docker build -t weclapp-manager:latest .

# Environment Datei mit Ihren echten Credentials
cat > /opt/weclapp-manager/.env << ENVEOF
DOCKER_IMAGE=weclapp-manager:latest
DOMAIN=$SERVER_IP
WECLAPP_API_URL=https://ihr-weclapp.weclapp.com/webapp/api/v1
WECLAPP_API_KEY=IHR_WECLAPP_API_KEY_HIER
AZURE_CLIENT_ID=25e2203c-f668-482f-acdb-e758de9aef23
AZURE_TENANT_ID=16fb7d46-199f-417d-9460-ebb505438d0c
APP_URL=http://$SERVER_IP
CLOCKIN_API_URL=https://api.clockin.io/v1
CLOCKIN_API_KEY=IHR_CLOCKIN_API_KEY_HIER
NEXTAUTH_SECRET=o)Sd+&![vv.Yz-USKTD5?ZZm{5>C:>83
ENVEOF

echo "✅ Environment configured!"

# Docker Compose konfigurieren
envsubst < /opt/weclapp-manager/docker-compose.yml.template > /opt/weclapp-manager/docker-compose.yml

# Nginx für IP-Deployment (kein SSL)
cat > /opt/weclapp-manager/nginx.conf << NGINXEOF
events {
    worker_connections 1024;
}

http {
    upstream app {
        server weclapp-manager:3000;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
NGINXEOF

echo "🚀 Starting containers..."
docker-compose down
docker-compose up -d

echo "⏳ Waiting for application to start..."
sleep 20

# Health Check
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "🌐 App available at: http://$SERVER_IP"
    echo "🔍 Check logs: docker-compose logs -f"
else
    echo "❌ Deployment failed - checking logs..."
    docker-compose logs --tail=30
    exit 1
fi

EOF

echo "🎉 Deployment completed!"
echo "🌐 Your WeClapp Manager is available at: http://$SERVER_IP"
echo "📝 Next steps:"
echo "   1. Open browser: http://$SERVER_IP"
echo "   2. Login with Azure AD"
echo "   3. Check if all features work"
