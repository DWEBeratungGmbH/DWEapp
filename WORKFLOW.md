# DWEapp Workflow

## Uebersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                    HETZNER SERVER (91.98.135.191)               │
│                                                                 │
│  ┌──────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │    db    │    │ dweapp-dev  │    │   dweapp    │            │
│  │ postgres │◄───│  Port 3001  │    │  Port 3000  │◄── nginx   │
│  │          │◄───│  Hot Reload │    │  Production │    (SSL)   │
│  └──────────┘    └──────▲──────┘    └──────▲──────┘            │
│                         │                  │                    │
└─────────────────────────┼──────────────────┼────────────────────┘
                          │                  │
                 ┌────────┴────────┐  ┌──────┴───────┐
                 │  Windsurf SSH   │  │GitHub Actions│
                 │   Entwicklung   │  │   CI/CD      │
                 └─────────────────┘  └──────────────┘
```

---

## Container

| Service | Port | Beschreibung |
|---------|------|--------------|
| **dweapp** | 3000 | Production (via nginx SSL) |
| **dweapp-dev** | 3001 | Development mit Hot Reload |
| **nginx** | 80, 443 | SSL Reverse Proxy |
| **db** | 5432 | PostgreSQL (intern) |

---

## 1. Deployment (CI/CD)

### Automatisch bei git push

```bash
git add .
git commit -m "Feature: Beschreibung"
git push
```

GitHub Actions fuehrt automatisch aus:
1. TypeScript Check (`npx tsc --noEmit`)
2. Build Test (`npm run build`)
3. SSH zum Server
4. `docker compose build --no-cache dweapp`
5. `docker compose up -d --force-recreate dweapp nginx`

**Pipeline Status:** https://github.com/DWEBeratungGmbH/DWEapp/actions

### Manuell starten

GitHub → Actions → "CI/CD Deploy" → "Run workflow"

---

## 2. Entwicklung (Windsurf SSH)

### Verbinden

1. Windsurf oeffnen
2. `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
3. Host: `root@91.98.135.191`
4. Ordner: `/opt/weclapp-manager`

### Dev-Container starten

```bash
docker compose --profile dev up -d dweapp-dev
```

### Entwickeln

- Dateien in `src/` bearbeiten
- Hot Reload auf http://91.98.135.191:3001
- Aenderungen sofort sichtbar

### Dev-Container stoppen

```bash
docker compose --profile dev stop dweapp-dev
```

---

## 3. Nuetzliche Befehle

### Status

```bash
# Alle Container
docker compose ps

# Logs (live)
docker compose logs -f dweapp
docker compose logs -f dweapp-dev

# Logs (letzte 50 Zeilen)
docker compose logs dweapp --tail=50
```

### Neustart

```bash
# Production neu starten
docker compose restart dweapp nginx

# Alles neu starten
docker compose down && docker compose up -d
```

### Build

```bash
# Production neu bauen
docker compose build --no-cache dweapp

# Alte Images loeschen
docker image prune -f
```

### Datenbank

```bash
# Backup erstellen
docker exec weclapp-manager-db-1 pg_dump -U postgres dweapp > /tmp/backup.sql

# Backup wiederherstellen
docker exec -i weclapp-manager-db-1 psql -U postgres dweapp < /tmp/backup.sql

# Prisma Schema sync
docker compose exec -T dweapp npx prisma db push
```

---

## 4. Bekannte Probleme

### 502 Bad Gateway nach Azure AD Login

**Ursache:** nginx Buffer zu klein fuer Azure AD Token.

**Loesung:** In `nginx.conf`:
```nginx
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
```

### Container startet nicht (Port belegt)

```bash
# Alten Container stoppen
docker compose down --remove-orphans

# Neu starten
docker compose up -d
```

---

## 5. Dateien

| Datei | Beschreibung |
|-------|--------------|
| `docker-compose.yml` | Container-Konfiguration |
| `Dockerfile` | Production Build |
| `Dockerfile.dev` | Development Build (Hot Reload) |
| `nginx.conf` | Nginx Konfiguration |
| `.github/workflows/deploy.yml` | CI/CD Pipeline |

---

## 6. GitHub Secrets

Repository → Settings → Secrets → Actions:

| Secret | Beschreibung |
|--------|--------------|
| `SSH_PRIVATE_KEY` | SSH Key fuer Server-Zugriff |

---

## 7. Checkliste

### Vor dem Push

```
[ ] TypeScript-Check: npx tsc --noEmit
[ ] Lokal getestet?
[ ] Commit-Message beschreibend?
```

### Nach dem Deploy

```
[ ] GitHub Actions erfolgreich?
[ ] https://91.98.135.191 erreichbar?
[ ] Login funktioniert?
```
