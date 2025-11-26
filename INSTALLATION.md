# WeClapp Manager - Installationsanleitung

## Schnellstart

### 1. Voraussetzungen
- Node.js 18 oder höher
- npm oder yarn
- Microsoft Azure AD Tenant
- WeClapp API Zugang

### 2. Installation

```bash
# 1. Repository klonen
git clone <repository-url>
cd weclapp-manager

# 2. Abhängigkeiten installieren
npm install

# 3. Umgebungsvariablen konfigurieren
cp .env.local.example .env.local
```

### 3. Konfiguration

Bearbeiten Sie die Datei `.env.local`:

```env
# Azure AD Configuration
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_AZURE_AD_TENANT_ID=your-tenant-id-here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000

# WeClapp API Configuration
NEXT_PUBLIC_WECLAPP_API_URL=https://your-weclapp-instance.weclapp.com/webapp/api/v1
NEXT_PUBLIC_WECLAPP_API_KEY=your-weclapp-api-key-here

# ClockIn API Configuration (optional)
NEXT_PUBLIC_CLOCKIN_API_URL=https://api.clockin.io/v1
NEXT_PUBLIC_CLOCKIN_API_KEY=your-clockin-api-key-here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### 4. Anwendung starten

```bash
npm run dev
```

Die Anwendung ist unter `http://localhost:3000` verfügbar.

## Azure AD Konfiguration

### App Registration erstellen

1. **Azure Portal aufrufen**: https://portal.azure.com
2. **Azure Active Directory** ? **App registrations**
3. **New registration**
4. **Name**: "WeClapp Manager"
5. **Supported account types**: "Accounts in any organizational directory"
6. **Redirect URI**: `http://localhost:3000`
7. **Register**

### API Berechtigungen

1. **API permissions** ? **Add a permission**
2. **Microsoft Graph** ? **Delegated permissions**
3. Folgende Berechtigungen hinzufügen:
   - `User.Read`
   - `Mail.Read`
4. **Grant admin consent**

### Client Secret erstellen

1. **Certificates & secrets** ? **New client secret**
2. **Description**: "WeClapp Manager Secret"
3. **Expires**: 24 Monate
4. **Add**
5. **Value kopieren** (wird nicht wieder angezeigt)

### Umgebungsvariablen aktualisieren

```env
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=<Application (client) ID>
NEXT_PUBLIC_AZURE_AD_TENANT_ID=<Directory (tenant) ID>
```

## WeClapp API Konfiguration

### API Key erstellen

1. **WeClapp Login**
2. **Einstellungen** ? **API-Zugriff**
3. **Neuen API-Key erstellen**
4. **Berechtigungen festlegen**:
   - Projekte: Lesen/Schreiben
   - Aufgaben: Lesen/Schreiben
   - Zeiterfassung: Lesen/Schreiben
5. **API-Key kopieren**

### Umgebungsvariablen aktualisieren

```env
NEXT_PUBLIC_WECLAPP_API_URL=https://ihre-instanz.weclapp.com/webapp/api/v1
NEXT_PUBLIC_WECLAPP_API_KEY=<ihr-api-key>
```

## ClockIn Integration (Optional)

### API Zugang anfordern

1. **ClockIn Support kontaktieren**
2. **API-Zugang beantragen**
3. **API-Key und URL erhalten**

### Umgebungsvariablen aktualisieren

```env
NEXT_PUBLIC_CLOCKIN_API_URL=https://api.clockin.io/v1
NEXT_PUBLIC_CLOCKIN_API_KEY=<ihr-clockin-api-key>
```

## Entwicklung

### Projektstruktur

```
src/
+-- app/                 # Next.js App Router
¦   +-- page.tsx        # Dashboard
¦   +-- projects/       # Projektübersicht
¦   +-- tasks/          # Aufgabenmanagement
¦   +-- time/           # Zeiterfassung
¦   +-- team/           # Teamübersicht
¦   +-- settings/       # Einstellungen
+-- components/         # React Komponenten
¦   +-- ui/            # UI Komponenten
¦   +-- layout/        # Layout Komponenten
+-- lib/               # Hilfsfunktionen
+-- hooks/             # Custom React Hooks
+-- services/          # API Services
+-- types/             # TypeScript Typen
```

### Nützliche Befehle

```bash
# Entwicklung
npm run dev

# Build für Produktion
npm run build

# Produktionsserver starten
npm start

# Linting
npm run lint

# TypeScript Prüfung
npx tsc --noEmit
```

## Häufige Probleme

### Azure AD Login funktioniert nicht

1. **Client ID und Tenant ID überprüfen**
2. **Redirect URI muss exakt übereinstimmen**
3. **API-Berechtigungen gewähren**
4. **Browser-Cache leeren**

### WeClapp API Fehler

1. **API-Key und URL überprüfen**
2. **API-Zugriff in WeClapp aktivieren**
3. **Netzwerkverbindung prüfen**
4. **CORS-Einstellungen überprüfen**

### Build Fehler

1. **Alle Umgebungsvariablen setzen**
2. **Abhängigkeiten aktualisieren**: `npm update`
3. **TypeScript-Fehler beheben**

## Nächste Schritte

1. **Konfiguration testen**: Starten Sie die Anwendung und testen Sie den Login
2. **API-Verbindungen prüfen**: Überprüfen Sie die WeClapp und ClockIn Integration
3. **Team einladen**: Laden Sie Ihre Teammitglieder ein
4. **Daten synchronisieren**: Führen Sie die erste Synchronisation durch

## Support

Bei Problemen kontaktieren Sie:
- **IT-Administration**: Azure AD Fragen
- **WeClapp Support**: API-Probleme
- **ClockIn Support**: Zeiterfassungs-Integration

## Deployment

Für Produktionseinsatz siehe `DEPLOYMENT.md`.
