# DWEapp Deployment Guide

**Server:** 91.98.135.191 (Hetzner)  
**Pfad:** /opt/weclapp-manager  
**SSH:** `ssh -i dweapp-deploy root@91.98.135.191`

---

## Quick Deploy (10 Minuten)

```bash
# 1. Lokal: Code committen und pushen
git add .
git commit -m "Beschreibung"
git push

# 2. Server: SSH verbinden
ssh -i dweapp-deploy root@91.98.135.191

# 3. Server: Deploy ausfuehren
cd /opt/weclapp-manager
git pull
docker-compose build --no-cache weclapp-manager
docker-compose up -d

# 4. Server: Pruefen ob App laeuft
docker-compose logs weclapp-manager --tail=10
```

---

## Notfall: Datenbank wiederherstellen

```bash
# Backup einspielen
docker exec -i weclapp-manager-db-1 psql -U postgres dweapp < /tmp/backup.sql

# Oder komplett neu:
docker-compose down
docker volume rm weclapp-manager_postgres-data
docker-compose up -d
docker-compose exec -T weclapp-manager npx prisma db push
```

---

## Bekannte Probleme

### 502 Bad Gateway nach Azure AD Login

**Symptom:** Login funktioniert, aber Callback gibt 502.

**Ursache:** nginx Buffer zu klein fuer Azure AD Token.

**Loesung:** In `nginx.conf` hinzufuegen:
```nginx
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
```

Dann: `docker-compose restart nginx`

---

## WICHTIG - Haeufige Fehler vermeiden!

### 1. Docker Image MUSS neu gebaut werden!
- `git pull` alleine reicht NICHT
- `docker-compose.yml` nutzt `build: .` (lokaler Build)
- IMMER: `docker-compose build --no-cache weclapp-manager`

### 2. ALLE Seiten pruefen!
- Root-Seite `/` = `src/app/page.tsx`
- Login-Seite `/auth/signin` = `src/app/auth/signin/page.tsx`
- Beide muessen konsistent sein!

### 3. Browser-Cache leeren!
- Hard Refresh: `Ctrl + Shift + R`
- Oder: Inkognito-Fenster testen
- Server liefert richtig, Browser cached falsch

### 4. PowerShell Zeichenprobleme
- Doppelte Quotes funktionieren oft nicht
- Loesung: Einfache Quotes verwenden
- SQL direkt in DB ausfuehren statt via Prisma CLI

---

## Checkliste vor Deploy

```
[ ] Code lokal getestet?
[ ] Alle betroffenen Seiten geaendert? (/, /auth/signin, etc.)
[ ] git commit und push erfolgreich?
[ ] SSH-Key vorhanden? (dweapp-deploy)
```

## Checkliste nach Deploy

```
[ ] docker-compose build ausgefuehrt?
[ ] docker-compose up -d ausgefuehrt?
[ ] Logs pruefen: docker-compose logs weclapp-manager --tail=10
[ ] Im Browser testen (mit Hard Refresh!)
```

---

## Debugging

### Container Status pruefen
```bash
docker-compose ps
docker-compose logs weclapp-manager --tail=20
```

### Was laeuft auf welchem Port?
```bash
netstat -tlnp | grep -E ':80|:443|:3000'
```

### Welches Image laeuft?
```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.CreatedAt}}'
```

### Build-ID im Container pruefen
```bash
docker exec weclapp-manager-weclapp-manager-1 cat /app/.next/BUILD_ID
```

---

## SSH-Keys

| Geraet | Key-Datei | Status |
|--------|-----------|--------|
| Laptop | dweapp-deploy | Aktiv |
| Desktop (Buero) | dwe-desktop-sebi | Aktiv |

---

## Architektur

```
Browser -> nginx (443) -> weclapp-manager (3000) -> db (5432)
                |
                v
        docker-compose.yml
        - db: postgres:16
        - weclapp-manager: build: . (LOKAL!)
        - nginx: nginx:alpine
```

---

## Was wir gelernt haben (01.12.2025)

### Fehler die 2 Stunden gekostet haben:
1. **Externes Image nicht erkannt** - docker-compose nutzte `ghcr.io/...` Image
2. **git pull ohne rebuild** - Code war da, aber altes Image lief weiter
3. **Falsche Seite geprueft** - `/auth/signin` geaendert, aber User ging auf `/`
4. **Browser-Cache ignoriert** - Server war richtig, Browser zeigte altes

### So waere es in 10 Minuten gegangen:
1. Code aendern und pushen
2. SSH zum Server
3. `git pull && docker-compose build --no-cache && docker-compose up -d`
4. Browser Cache leeren und testen
5. Fertig!

---

**Merke: Docker Image = gebaut, nicht gepullt!**
