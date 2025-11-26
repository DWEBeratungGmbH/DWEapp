# WeClapp Manager - Deployment Guide

## Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Microsoft Azure AD Tenant
- WeClapp API Zugang
- ClockIn API Zugang (optional)

## Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd weclapp-manager
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Bearbeiten Sie `.env.local` mit Ihren Konfigurationsdaten:
   ```env
   # Azure AD Configuration
   NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id-here
   NEXT_PUBLIC_AZURE_AD_TENANT_ID=your-tenant-id-here
   NEXT_PUBLIC_REDIRECT_URI=https://your-domain.com

   # WeClapp API Configuration
   NEXT_PUBLIC_WECLAPP_API_URL=https://your-weclapp-instance.weclapp.com/webapp/api/v1
   NEXT_PUBLIC_WECLAPP_API_KEY=your-weclapp-api-key-here

   # ClockIn API Configuration
   NEXT_PUBLIC_CLOCKIN_API_URL=https://api.clockin.io/v1
   NEXT_PUBLIC_CLOCKIN_API_KEY=your-clockin-api-key-here

   # Next.js Configuration
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-nextauth-secret-here
   ```

## Azure AD Konfiguration

1. **App Registration in Azure AD erstellen**
   - Gehen Sie zum Azure Portal
   - Navigieren Sie zu "Azure Active Directory" > "App registrations"
   - Klicken Sie auf "New registration"
   - Geben Sie einen Namen ein (z.B. "WeClapp Manager")
   - Wählen Sie "Accounts in any organizational directory (Any Azure AD directory - Multitenant)"
   - Redirect URI: `https://your-domain.com`

2. **API Berechtigungen konfigurieren**
   - Fügen Sie Microsoft Graph Berechtigungen hinzu:
     - `User.Read` (Delegated)
     - `Mail.Read` (Delegated)
   - Gewähren Sie Admin Consent

3. **Client Secret erstellen**
   - Gehen Sie zu "Certificates & secrets"
   - Erstellen Sie ein neues Client Secret
   - Kopieren Sie den Wert (wird nicht wieder angezeigt)

4. **Umgebungsvariablen aktualisieren**
   - `NEXT_PUBLIC_AZURE_AD_CLIENT_ID`: Application (client) ID
   - `NEXT_PUBLIC_AZURE_AD_TENANT_ID`: Directory (tenant) ID

## WeClapp API Konfiguration

1. **API Key in WeClapp erstellen**
   - Loggen Sie sich in WeClapp ein
   - Gehen Sie zu "Einstellungen" > "API-Zugriff"
   - Erstellen Sie einen neuen API-Key
   - Kopieren Sie den API-Key

2. **Umgebungsvariablen aktualisieren**
   - `NEXT_PUBLIC_WECLAPP_API_URL`: Ihre WeClapp Instanz URL
   - `NEXT_PUBLIC_WECLAPP_API_KEY`: Der erstellte API-Key

## ClockIn API Konfiguration (Optional)

1. **ClockIn API Zugang einrichten**
   - Kontaktieren Sie ClockIn für API-Zugang
   - Erhalten Sie API-Key und URL

2. **Umgebungsvariablen aktualisieren**
   - `NEXT_PUBLIC_CLOCKIN_API_URL`: ClockIn API URL
   - `NEXT_PUBLIC_CLOCKIN_API_KEY`: ClockIn API-Key

## Entwicklung

```bash
npm run dev
```

Die Anwendung läuft unter `http://localhost:3000`

## Production Build

```bash
npm run build
npm start
```

## Docker Deployment

1. **Dockerfile erstellen**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .

   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Docker Image bauen**
   ```bash
   docker build -t weclapp-manager .
   ```

3. **Container starten**
   ```bash
   docker run -p 3000:3000 --env-file .env.local weclapp-manager
   ```

## Vercel Deployment

1. **Vercel CLI installieren**
   ```bash
   npm i -g vercel
   ```

2. **Projekt deployen**
   ```bash
   vercel --prod
   ```

3. **Umgebungsvariablen in Vercel konfigurieren**
   - Gehen Sie zum Vercel Dashboard
   - Navigieren Sie zu Ihrem Projekt
   - Gehen Sie zu "Settings" > "Environment Variables"
   - Fügen Sie alle Variablen aus `.env.local` hinzu

## Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring und Logging

1. **Application Monitoring**
   - Integrieren Sie Vercel Analytics oder ähnliche Tools
   - Richten Sie Error Tracking ein (z.B. Sentry)

2. **API Monitoring**
   - Überwachen Sie WeClapp und ClockIn API Aufrufe
   - Richten Sie Alerts für API-Fehler ein

## Wartung

1. **Regelmäßige Updates**
   - Halten Sie Abhängigkeiten aktuell
   - Überprüfen Sie Security Advisories

2. **Backup**
   - Sichern Sie Konfigurationsdateien
   - Dokumentieren Sie API-Keys und Secrets

3. **Performance**
   - Überwachen Sie Ladezeiten
   - Optimieren Sie Bilder und Assets

## Troubleshooting

### Häufige Probleme

1. **Azure AD Login funktioniert nicht**
   - Überprüfen Sie Client ID und Tenant ID
   - Stellen Sie sicher, dass Redirect URI korrekt ist
   - Prüfen Sie API-Berechtigungen

2. **WeClapp API Fehler**
   - Überprüfen Sie API-Key und URL
   - Stellen Sie sicher, dass API-Zugriff aktiviert ist
   - Prüfen Sie Netzwerkverbindungen

3. **Build Fehler**
   - Überprüfen Sie alle Umgebungsvariablen
   - Stellen Sie sicher, dass alle Abhängigkeiten installiert sind
   - Prüfen Sie TypeScript-Fehler

### Logging

Aktivieren Sie detailliertes Logging in der Produktion:

```env
NODE_ENV=production
LOG_LEVEL=debug
```

## Sicherheit

1. **API-Keys**
   - Speichern Sie API-Keys niemals im Frontend
   - Verwenden Sie nur public API-Keys
   - Rotieren Sie Keys regelmäßig

2. **HTTPS**
   - Verwenden Sie immer HTTPS in der Produktion
   - Konfigurieren Sie SSL-Zertifikate richtig

3. **CORS**
   - Konfigurieren Sie CORS-Policies
   - Beschränken Sie erlaubte Origins

## Support

Bei Problemen wenden Sie sich bitte an:
- IT-Administration für Azure AD Fragen
- WeClapp Support für API-Probleme
- ClockIn Support für Zeiterfassungs-Integrationen
