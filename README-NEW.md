# DWEapp

**📋 Moderne Aufgabenverwaltung mit WeClapp Integration**

## 🚀 Schnellstart

```bash
# 1. Dependencies installieren
npm install --legacy-peer-deps

# 2. Prisma-Typen generieren
npx prisma generate

# 3. Dev-Server starten
npm run dev
# → http://localhost:3000
```

## 📚 Dokumentation

| Thema | Dokument | Beschreibung |
|-------|----------|-------------|
| **🏛️ Hauptdokumentation** | [DWEapp.md](./DWEapp.md) | Architektur, Komponenten, API |
| **🗄️ Datenbank & Sync** | [DATABASE.md](./DATABASE.md) | Schema, Protokoll, Logging |
| **📝 Änderungen & Rollback** | [CHANGELOG.md](./CHANGELOG.md) | Versionen, Änderungen |
| **🏗️ Entwicklungsregeln** | [CASCADE.md](./CASCADE.md) | Code-Standards, UI-Regeln |
| **🤖 AI Assistant Regeln** | [.cascade-rules.md](./.cascade-rules.md) | Mein Workflow |

## 🎯 Wichtigste Links

- **Live-Demo:** http://localhost:3000
- **Design-System:** http://localhost:3000/design-system
- **WeClapp API:** https://api.weclapp.com/
- **PostgreSQL:** Host 91.98.135.191:5432

## 📋 Features

- ✅ **Aufgabenverwaltung** mit erweiterten Filtern
- ✅ **WeClapp Sync** (bidirektional)
- ✅ **Benutzerverwaltung** mit Rollen
- ✅ **Responsive Design** (Desktop & Mobile)
- ✅ **Dark/Light Mode** Support
- ✅ **Audit Logging** für alle Änderungen

## 🏗️ Tech Stack

- **Next.js** 15.5.6 - React Framework
- **TypeScript** 5.x - Type Safety
- **Tailwind CSS** 3.x - Styling
- **PostgreSQL** 17 - Datenbank
- **Prisma** - ORM
- **WeClapp API** v2 - externe Datenquelle

---

**🔔 Wichtig:** Immer zuerst [DWEapp.md](./DWEapp.md) lesen!
