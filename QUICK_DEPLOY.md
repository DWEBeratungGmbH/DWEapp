# Quick Deploy mit IP-Adresse

## 🚀 Schnelles Deployment ohne Domain

### **Schritt 1: SSH zum Server**
```bash
ssh deploy@IHR_SERVER_IP
```

### **Schritt 2: Repository klonen und bauen**
```bash
# Zum App-Verzeichnis
cd /opt/weclapp-manager

# Repository klonen (ersetzen Sie mit Ihrem Git-Repo)
git clone https://github.com/your-username/weclapp-manager.git .

# Docker Image bauen
docker build -t weclapp-manager:latest .
```

### **Schritt 3: Environment konfigurieren**
```bash
# Environment Datei erstellen
nano /opt/weclapp-manager/.env
```

**Inhalt für .env Datei:**
```bash
DOCKER_IMAGE=weclapp-manager:latest
DOMAIN=IHR_SERVER_IP
WECLAPP_API_URL=https://ihr-weclapp.weclapp.com/webapp/api/v1
WECLAPP_API_KEY=IHR_WECLAPP_API_KEY
AZURE_CLIENT_ID=IHR_AZURE_CLIENT_ID
AZURE_TENANT_ID=IHR_AZURE_TENANT_ID
APP_URL=http://IHR_SERVER_IP
CLOCKIN_API_URL=https://api.clockin.io/v1
CLOCKIN_API_KEY=IHR_CLOCKIN_API_KEY
NEXTAUTH_SECRET=IHR_SUPER_GEHEIMES_SECRET
```

### **Schritt 4: Docker Compose konfigurieren**
```bash
# Template anpassen
envsubst < docker-compose.yml.template > docker-compose.yml

# Nginx für IP anpassen (kein SSL)
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
```

### **Schritt 5: Container starten**
```bash
# Container starten
docker-compose down
docker-compose up -d

# Warten und prüfen
sleep 15
curl http://localhost:3000/api/health
```

### **Schritt 6: App testen**
```bash
# App sollte erreichbar sein unter:
http://IHR_SERVER_IP
```

## 🔧 Was Sie noch benötigen:

### **Azure AD Credentials:**
1. **Azure Portal** → **App registrations**
2. **New registration** → Name: "WeClapp Manager"
3. **Redirect URI**: `http://IHR_SERVER_IP/api/auth/callback/azure-ad`
4. **Client ID** und **Tenant ID** kopieren

### **NextAuth Secret generieren:**
```bash
# Auf dem Server
openssl rand -base64 32
```

### **ClockIn API (optional):**
- Falls nicht vorhanden: `CLOCKIN_API_KEY=""` und `CLOCKIN_API_URL=""` lassen

## 🚨 Fehlersuche:

### **Logs ansehen:**
```bash
docker-compose logs -f weclapp-manager
docker-compose logs -f nginx
```

### **Container Status:**
```bash
docker-compose ps
```

### **Neu starten:**
```bash
docker-compose restart
```

## 🎯 Fertig!

Nach wenigen Minuten ist Ihre App unter `http://IHR_SERVER_IP` erreichbar!
