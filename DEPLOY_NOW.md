# 🚀 DEPLOYMENT JETZT STARTEN!

## **Schritt 1: Git Repository pushen**
```bash
git add .
git commit -m "Add Hetzner Cloud deployment configuration"
git push origin main
```

## **Schritt 2: SSH zum Server**
```bash
ssh deploy@IHR_SERVER_IP
```

## **Schritt 3: Auf dem Server deployen**
```bash
cd /opt/weclapp-manager

# Repository klonen/aktualisieren
git clone https://github.com/your-username/weclapp-manager.git .

# Docker Image bauen
docker build -t weclapp-manager:latest .

# Environment konfigurieren
cat > .env << 'EOF'
DOCKER_IMAGE=weclapp-manager:latest
DOMAIN=IHR_SERVER_IP
WECLAPP_API_URL=https://ihr-weclapp.weclapp.com/webapp/api/v1
WECLAPP_API_KEY=IHR_WECLAPP_API_KEY_HIER
AZURE_CLIENT_ID=25e2203c-f668-482f-acdb-e758de9aef23
AZURE_TENANT_ID=16fb7d46-199f-417d-9460-ebb505438d0c
APP_URL=http://IHR_SERVER_IP
CLOCKIN_API_URL=https://api.clockin.io/v1
CLOCKIN_API_KEY=IHR_CLOCKIN_API_KEY_HIER
NEXTAUTH_SECRET=o)Sd+&![vv.Yz-USKTD5?ZZm{5>C:>83
EOF

# Docker Compose konfigurieren
envsubst < docker-compose.yml.template > docker-compose.yml

# Nginx für IP anpassen
cat > nginx.conf << 'EOF'
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
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF

# Container starten
docker-compose down
docker-compose up -d

# Health Check
sleep 15
curl http://localhost:3000/api/health
```

## **Schritt 4: App testen**
Öffnen Sie im Browser: `http://IHR_SERVER_IP`

## **🔧 Fehlersuche:**
```bash
# Logs ansehen
docker-compose logs -f

# Container Status
docker-compose ps

# Neu starten
docker-compose restart
```

## **🎯 Erwartetes Ergebnis:**
- ✅ App läuft unter `http://IHR_SERVER_IP`
- ✅ Azure AD Login funktioniert
- ✅ WeClapp API verbunden
- ✅ Alle Features verfügbar

**LOS GEHT'S! 🚀**
