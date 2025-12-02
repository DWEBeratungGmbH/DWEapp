# Datenbank-Regeln DWEapp

## KRITISCH: Schema-Aenderungen

### NIEMALS direkt SQL ausfuehren ohne Backup!

```bash
# 1. IMMER zuerst Backup erstellen
docker exec weclapp-manager-db-1 pg_dump -U postgres dweapp > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Schema-Aenderungen NUR ueber Prisma
docker-compose exec -T weclapp-manager npx prisma db push --accept-data-loss

# 3. Nach Aenderung: Schema exportieren
docker exec weclapp-manager-db-1 pg_dump -U postgres --schema-only dweapp > prisma/schema.sql
```

---

## PostgreSQL Konventionen (Kapitel 55)

### Spalten-Namen: snake_case mit Anfuehrungszeichen!

```sql
-- FALSCH (wird zu lowercase):
ALTER TABLE users ADD COLUMN lastLoginAt TIMESTAMP;
-- Ergebnis: lastloginat (alles lowercase!)

-- RICHTIG (camelCase erhalten):
ALTER TABLE users ADD COLUMN "lastLoginAt" TIMESTAMP;
-- Ergebnis: lastLoginAt (korrekt!)
```

### Prisma erwartet camelCase!
- Prisma Schema: `lastLoginAt`
- PostgreSQL muss: `"lastLoginAt"` (mit Quotes!)
- Ohne Quotes: PostgreSQL konvertiert zu lowercase

---

## PowerShell vs Linux Problematik

### Problem: PowerShell interpretiert Zeichen anders!

```powershell
# FALSCH - PowerShell zerstoert Backslashes und Quotes:
ssh server "psql -c \"SELECT * FROM users\""
# Ergebnis: Syntax-Fehler, kaputte Zeichen

# RICHTIG - SQL in Datei auf Server schreiben:
ssh server "cat > /tmp/query.sql << 'EOF'
SELECT * FROM users;
EOF"
ssh server "docker exec -i db psql -U postgres dweapp < /tmp/query.sql"
```

### Loesung: printf verwenden
```powershell
# Fuer einfache Befehle:
ssh server "printf '%s\n' 'SELECT * FROM users;' > /tmp/q.sql"
ssh server "docker exec -i db psql -U postgres dweapp < /tmp/q.sql"
```

### Beste Loesung: Prisma verwenden!
```bash
# Schema-Sync ohne SQL:
docker-compose exec -T weclapp-manager npx prisma db push
```

---

## Workflow: Schema-Aenderung

### 1. Lokal entwickeln
```bash
# Schema in prisma/schema.prisma aendern
# Dann lokal testen (falls DB vorhanden)
npx prisma db push
```

### 2. Auf Server deployen
```bash
ssh -i dweapp-deploy root@91.98.135.191
cd /opt/weclapp-manager

# A) Backup erstellen
docker exec weclapp-manager-db-1 pg_dump -U postgres dweapp > /tmp/backup.sql

# B) Code pullen
git pull

# C) Schema synchronisieren
docker-compose exec -T weclapp-manager npx prisma db push --accept-data-loss

# D) Image neu bauen (wichtig fuer Prisma Client!)
docker-compose build --no-cache weclapp-manager
docker-compose up -d

# E) Schema exportieren und committen
docker exec weclapp-manager-db-1 pg_dump -U postgres --schema-only dweapp > prisma/schema.sql
```

---

## Aktuelles Schema

Siehe: `prisma/schema.sql` (automatisch generiert)

### Wichtige Tabellen:
- `users` - App-Benutzer (NextAuth)
- `accounts` - OAuth-Verknuepfungen
- `sessions` - Aktive Sessions
- `weclapp_users` - WeClapp-Benutzer (Sync)
- `weclapp_tasks` - WeClapp-Aufgaben
- `login_logs` - Login-Protokollierung

### User-Tabelle Spalten:
```
id, email, name, role, department,
"lastLoginAt", "lastActiveAt", "loginCount",
"weClappUserId", "isActive", "createdAt", "updatedAt"
```

---

## Checkliste: Datenbank-Aenderung

```
[ ] Backup erstellt?
[ ] prisma/schema.prisma geaendert?
[ ] Spalten-Namen in camelCase?
[ ] prisma db push ausgefuehrt?
[ ] Docker Image neu gebaut?
[ ] prisma/schema.sql aktualisiert?
[ ] Getestet?
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
