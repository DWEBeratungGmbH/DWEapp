#!/bin/bash

set -e

echo "🚀 Starting WeClapp Manager Server Deployment..."

# Server IP als Parameter
SERVER_IP=${1:-"localhost"}
echo "📍 Server IP: $SERVER_IP"

# SSH zum Server und alles dort durchführen
ssh deploy@$SERVER_IP << 'EOF'
echo "🔧 Setting up WeClapp Manager on server..."

# Zum App-Verzeichnis
cd /opt/weclapp-manager

# Git Repository klonen (oder aktualisieren)
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

# Environment Variablen für IP-Deployment
cat > /opt/weclapp-manager/.env << EOF
DOCKER_IMAGE=weclapp-manager:latest
DOMAIN=$SERVER_IP
WECLAPP_API_URL=IHR_WECLAPP_URL_HIER
WECLAPP_API_KEY=IHR_WECLAPP_API_KEY_HIER
AZURE_CLIENT_ID=IHR_AZURE_CLIENT_ID_HIER
AZURE_TENANT_ID=IHR_AZURE_TENANT_ID_HIER
APP_URL=http://$SERVER_IP
CLOCKIN_API_URL=https://api.clockin.io/v1
CLOCKIN_API_KEY=IHR_CLOCKIN_API_KEY_HIER
NEXTAUTH_SECRET=IHR_SUPER_GEHEIMES_SECRET_HIER
EOF

echo "⚠️  Bitte passen Sie die Environment-Variablen in /opt/weclapp-manager/.env an!"

# Docker Compose konfigurieren
envsubst < /opt/weclapp-manager/docker-compose.yml.template > /opt/weclapp-manager/docker-compose.yml

# Nginx für IP-Deployment anpassen (kein SSL)
cat > /opt/weclapp-manager/nginx.conf << EOF
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
EOF

echo "🚀 Starting containers..."
docker-compose down
docker-compose up -d

echo "⏳ Waiting for application to start..."
sleep 15

# Health Check
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
    echo "🌐 App available at: http://$SERVER_IP"
    echo "🔍 Check logs with: docker-compose logs -f"
else
    echo "❌ Deployment failed - checking logs..."
    docker-compose logs --tail=20
    exit 1
fi

EOF

echo "🎉 Server deployment completed!"
echo "🌐 Your app is available at: http://$SERVER_IP"
echo "📝 Next steps:"
echo "   1. SSH into server: ssh deploy@$SERVER_IP"
echo "   2. Edit environment: nano /opt/weclapp-manager/.env"
echo "   3. Restart containers: docker-compose restart"
