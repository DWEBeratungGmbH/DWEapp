# DWEapp Development Workflow

## Uebersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                         HETZNER SERVER                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │     DB      │    │  DWEappDev  │    │   DWEapp    │         │
│  │  PostgreSQL │◄───│  Port 3001  │    │  Port 3000  │         │
│  │             │◄───│  Hot Reload │    │   Stabil    │         │
│  └─────────────┘    └──────▲──────┘    └──────▲──────┘         │
│                            │                   │                │
└────────────────────────────┼───────────────────┼────────────────┘
                             │                   │
                    ┌────────┴────────┐ ┌────────┴────────┐
                    │  Windsurf SSH   │ │  GitHub Actions │
                    │  Entwicklung    │ │  CI/CD Deploy   │
                    └─────────────────┘ └─────────────────┘
```

---

## 1. Entwicklung mit Windsurf SSH

### Erstmalige Einrichtung

1. **Windsurf oeffnen**
2. `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
3. Host eingeben: `root@91.98.135.191`
4. SSH-Key auswaehlen: `dweapp-deploy`
5. Ordner oeffnen: `/opt/weclapp-manager`

### Dev-Container starten

```bash
# Auf dem Server (via Windsurf Terminal):
docker-compose --profile dev up -d DWEappDev

# Logs anschauen:
docker-compose logs -f DWEappDev
```

### Entwickeln

- Dateien in `/opt/weclapp-manager/src/` bearbeiten
- Hot Reload: Aenderungen automatisch sichtbar auf Port 3001
- Test-URL: `http://91.98.135.191:3001` (ohne SSL)

### Dev-Container stoppen

```bash
docker-compose --profile dev stop DWEappDev
```

---

## 2. Deployment mit CI/CD

### Automatisch (bei git push)

```bash
# Lokal oder auf Server:
git add .
git commit -m "Feature: ..."
git push
```

GitHub Actions:
1. ✅ TypeScript Check
2. ✅ Build Test
3. ✅ SSH auf Server
4. ✅ Docker Build (--no-cache)
5. ✅ Production Container neu starten

### Manuell (GitHub)

1. GitHub → Actions → "CI/CD Deploy"
2. "Run workflow" klicken

---

## 3. GitHub Secrets (einmalig konfigurieren)

Repository → Settings → Secrets and variables → Actions:

| Secret | Wert |
|--------|------|
| `SSH_PRIVATE_KEY` | Inhalt von `~/.ssh/dweapp-deploy` |

---

## 4. Container-Befehle

```bash
# Status aller Container
docker-compose ps

# Production Logs
docker-compose logs -f DWEapp

# Dev Logs
docker-compose logs -f DWEappDev

# Production manuell neu starten
docker-compose up -d --force-recreate DWEapp

# Alle stoppen
docker-compose down
```

---

## 5. Ports

| Container | Port | Verwendung |
|-----------|------|------------|
| DWEappDev | 3001 | Entwicklung (Hot Reload) |
| DWEapp | 3000 | Live (via nginx) |
| nginx | 80, 443 | SSL Proxy |
| db | 5432 | PostgreSQL (intern) |

---

## 6. Workflow Zusammenfassung

### Taeglich:

1. Windsurf → SSH → Server verbinden
2. Dev-Container starten: `docker-compose --profile dev up -d DWEappDev`
3. Code bearbeiten (Hot Reload auf :3001)
4. Fertig? → `git push`
5. GitHub Actions deployed automatisch!

### Bei Problemen:

```bash
# Production Logs pruefen
docker-compose logs DWEapp --tail=50

# Container neu bauen
docker-compose build --no-cache DWEapp

# Alles neu starten
docker-compose down && docker-compose up -d
```
