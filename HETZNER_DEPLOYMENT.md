# Hetzner Cloud Deployment Guide

## Übersicht

Diese Anleitung führt Sie durch die komplette Einrichtung Ihrer WeClapp Manager App auf Hetzner Cloud.

## Voraussetzungen

1. **Hetzner Cloud Account** mit API Access
2. **Domain** (optional, für SSL-Zertifikat)
3. **Git Repository** mit Ihrer Anwendung

## Schritt 1: Hetzner Server erstellen

1. Melden Sie sich bei Hetzner Cloud an
2. Erstellen Sie einen neuen Server:
   - **Image**: Ubuntu 22.04
   - **Server Typ**: CPX11 (oder größer bei Bedarf)
   - **Standort**: Nürnberg oder Falkenstein
   - **SSH Keys**: Fügen Sie Ihren SSH-Key hinzu

## Schritt 2: Domain konfigurieren (optional)

Wenn Sie eine Domain verwenden:
1. DNS A-Record erstellen: `ihre-domain.com → SERVER_IP`
2. DNS A-Record erstellen: `www.ihre-domain.com → SERVER_IP`

## Schritt 3: Environment Variablen konfigurieren

Kopieren Sie `.env.production.example` zu `.env.production` und füllen Sie alle Werte:

```bash
cp .env.production.example .env.production
```

**Wichtig**: Ersetzen Sie alle Platzhalter mit Ihren echten Produktions-Werten.

## Schritt 4: Deployment durchführen

### Option A: Automatisches Deployment (empfohlen)

1. **GitHub Secrets einrichten**:
   - `HETZNER_SERVER_IP`: Ihre Server-IP
   - `HETZNER_SSH_KEY`: Ihr privater SSH-Key
   - `DOCKER_USERNAME`: Docker Hub Username
   - `DOCKER_PASSWORD`: Docker Hub Password

2. **Pushen Sie Änderungen**:
   ```bash
   git add .
   git commit -m "Add Hetzner deployment configuration"
   git push origin main
   ```

### Option B: Manuelles Deployment

1. **Deployment Script ausführen**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh IHR_SERVER_IP ihre-domain.com
   ```

## Schritt 5: SSL-Zertifikat einrichten

Das Deployment-Script richtet automatisch Let's Encrypt SSL-Zertifikate ein.

## Schritt 6: Monitoring und Wartung

### Anwendung status prüfen:
```bash
ssh root@IHR_SERVER_IP
cd /opt/weclapp-manager
docker-compose ps
```

### Logs einsehen:
```bash
docker-compose logs -f weclapp-manager
```

### Anwendung neu starten:
```bash
docker-compose restart weclapp-manager
```

### Updates durchführen:
```bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Sicherheitskonfiguration

- **Firewall**: Port 22, 80, 443 geöffnet
- **SSL**: Automatische Let's Encrypt Zertifikate
- **Updates**: Automatische SSL-Erneuerung via Cron
- **Container**: Non-root User für Next.js App

## Backup-Strategie

### Datenbank-Backups (falls zukünftig hinzugefügt):
```bash
# Automatische Backups einrichten
crontab -e
# Hinzufügen: 0 2 * * * /opt/backup-script.sh
```

### Container-Backups:
```bash
# Docker Images exportieren
docker save weclapp-manager:latest > /opt/backups/app-$(date +%Y%m%d).tar
```

## Fehlersuche

### Häufige Probleme:

1. **Port 80/443 nicht erreichbar**:
   ```bash
   ufw status
   ufw allow 80
   ufw allow 443
   ```

2. **SSL-Zertifikat Probleme**:
   ```bash
   certbot renew
   docker-compose restart nginx
   ```

3. **Container startet nicht**:
   ```bash
   docker-compose logs weclapp-manager
   docker-compose down
   docker-compose up -d
   ```

## Kostenübersicht

- **Server**: ~€5-10/Monat (CPX11)
- **Domain**: ~€10-15/Jahr
- **Optional**: Load Balancer, Backups

## Support

Bei Problemen:
1. Prüfen Sie die Logs: `docker-compose logs`
2. Server-Status: `docker-compose ps`
3. Netzwerk-Konfiguration: `nginx -t`

## Nächste Schritte

1. **Monitoring** einrichten (Prometheus/Grafana)
2. **Backup-Strategie** implementieren
3. **CI/CD Pipeline** optimieren
4. **Load Balancer** bei hohem Traffic
