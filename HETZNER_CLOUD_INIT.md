# Hetzner Cloud-Init Deployment

## 🚀 Automatischer Server Setup mit Cloud-Init

Diese Cloud-Init Konfiguration richtet Ihren Hetzner Server automatisch für die WeClapp Manager App ein.

## 📋 Was wird automatisch installiert?

### **System-Pakete:**
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- Certbot (SSL Zertifikate)
- Firewall (UFW)
- Fail2ban (Security)
- Git, Curl, Htop

### **Konfiguration:**
- Docker Service aktiviert
- Firewall Ports 22, 80, 443 geöffnet
- Fail2ban gestartet
- App-Verzeichnis erstellt
- Deploy-Benutzer mit SSH-Key

### **Templates:**
- Docker Compose Konfiguration
- Nginx Reverse Proxy
- Deployment Script
- Health Check Script

## 🔧 Nutzung bei Hetzner

### **1. Server erstellen mit Cloud-Init:**

1. **Hetzner Cloud Console öffnen**
2. **"Create Server"** klicken
3. **Server Konfiguration:**
   - **Image**: Ubuntu 22.04
   - **Server Typ**: CPX11 oder größer
   - **Standort**: Nürnberg oder Falkenstein
   - **SSH Keys**: Ihren SSH-Key hinzufügen
   - **Cloud-Init**: **"Enable"** aktivieren

4. **Cloud-Init YAML einfügen:**
   ```yaml
   # Inhalt von cloud-init.yml hier einfügen
   ```

5. **Labels hinzufügen (empfohlen):**
   Im "Labels" Abschnitt folgende Schlüssel-Wert-Paare hinzufügen:
   ```
   environment=production
   application=weclapp-manager
   owner=sebastian
   team=dwe-beratung
   backup=daily
   monitoring=enabled
   auto-update=true
   ```

6. **Server erstellen** (ca. 2-3 Minuten)

### **🏷️ Warum Labels wichtig sind:**

Diese Labels helfen bei:
- **Server-Filterung** in der Hetzner Console
- **Automatisierten Backups** (backup=daily)
- **Cost Tracking** nach Projekten
- **Team-Zuordnung** für Berechtigungen
- **Monitoring-Konfiguration**
- **Auto-Update Policies**

### **📋 Weitere nützliche Labels:**
```
project=weclapp-manager
cost-center=dwe
criticality=medium
data-sensitivity=medium
compliance=gdpr
```

### **2. Nach Server-Erstellung:**

SSH-Verbindung testen:
```bash
ssh deploy@IHR_SERVER_IP
```

### **3. Deployment durchführen:**

```bash
# SSH zum Server
ssh deploy@IHR_SERVER_IP

# Zum App-Verzeichnis
cd /opt/weclapp-manager

# Environment Variablen setzen
export WECLAPP_API_URL="https://ihr-weclapp.weclapp.com/webapp/api/v1"
export WECLAPP_API_KEY="ihr-api-key"
export AZURE_CLIENT_ID="ihr-azure-client-id"
export AZURE_TENANT_ID="ihr-azure-tenant-id"
export APP_URL="https://ihre-domain.com"
export CLOCKIN_API_URL="https://api.clockin.io/v1"
export CLOCKIN_API_KEY="ihr-clockin-key"
export NEXTAUTH_SECRET="ihr-super-geheimes-secret"

# Deployment ausführen
./deploy.sh weclapp-manager:latest ihre-domain.com
```

## 🎯 Vorteile von Cloud-Init

### **✅ Automatisierung:**
- Keine manuelle Paketinstallation
- Keine Konfigurationsfehler
- Wiederholbare Setups

### **✅ Sicherheit:**
- Firewall automatisch konfiguriert
- Fail2ban aktiviert
- SSH-Key authentifizierung

### **✅ Skalierbarkeit:**
- Einfache Server-Klonung
- Identische Setups
- Template-basiert

## 📁 Dateien die erstellt werden

```
/opt/weclapp-manager/
├── docker-compose.yml.template     # Docker Konfiguration
├── nginx.conf.template             # Nginx Konfiguration  
├── deploy.sh                       # Deployment Script
├── health-check.sh                 # Health Check Script
└── .env                           # Environment Variablen
```

## 🔍 Health Check

Server-Status prüfen:
```bash
ssh deploy@IHR_SERVER_IP
cd /opt/weclapp-manager
./health-check.sh
```

## 🚨 Fehlerbehebung

### **SSH Verbindung:**
```bash
# Falls Connection refused
ssh -o ConnectTimeout=10 deploy@IHR_SERVER_IP
```

### **Deployment Logs:**
```bash
docker-compose logs weclapp-manager
docker-compose logs nginx
```

### **Service Status:**
```bash
sudo systemctl status docker
sudo systemctl status nginx
sudo ufw status
```

## 🔄 Updates

System aktualisieren:
```bash
ssh deploy@IHR_SERVER_IP
sudo apt update && sudo apt upgrade -y
docker-compose pull
docker-compose up -d
```

## 📊 Monitoring

### **Logs ansehen:**
```bash
# App Logs
docker-compose logs -f weclapp-manager

# Nginx Logs  
docker-compose logs -f nginx

# System Logs
sudo journalctl -u docker -f
```

### **Performance:**
```bash
# System-Last
htop

# Docker-Statistiken
docker stats

# Festplatten
df -h
```

## 🌐 Domain Konfiguration

Nach Deployment:
1. **DNS A-Record** erstellen: `ihre-domain.com → SERVER_IP`
2. **SSL-Zertifikat** wird automatisch von Certbot erstellt
3. **HTTPS Redirect** wird aktiviert

## 💡 Tipps

- **Testen Sie zuerst** mit einer Subdomain
- **Backups erstellen** vor Produktions-Deployment
- **Monitoring einrichten** für kritische Systeme
- **SSH Keys rotieren** regelmäßig

## 🎉 Fertig!

Nach wenigen Minuten ist Ihre WeClapp Manager App unter `https://ihre-domain.com` erreichbar!
