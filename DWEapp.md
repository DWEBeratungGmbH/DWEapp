# DWEapp - Dokumentation

**Version:** 2.1  
**Stand:** 30.11.2025  
**Architektur:** Next.js 15 + TypeScript + Tailwind CSS + CASCADE Design System

---

## 📋 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Architektur](#architektur)
3. [CASCADE Design System](#cascade-design-system)
4. [Komponenten](#komponenten)
5. [Funktionen](#funktionen)
6. [API Integration](#api-integration)
7. [Datenbank](#datenbank)
8. [Deployment](#deployment)
9. [Entwicklung](#entwicklung)
10. [Versionen](#versionen)
11. [Ideen & Roadmap](#ideen--roadmap)

---

## 📚 **Dokumentationsübersicht**

### 🗂️ Alle Dokumentationen im Projekt

| Dokument | Zweck | Wichtigste Inhalte |
|----------|-------|-------------------|
| **`DWEapp.md`** | 📋 **Hauptdokumentation** (diese Datei) | Architektur, Komponenten, API, Entwicklung |
| **`DATABASE.md`** | 🗄️ **Datenbank-Dokumentation** | Schema, Sync-Protokoll, Tabellen, Migration |
| **`CHANGELOG.md`** | 📝 **Änderungsprotokoll** | Versionen, Schema-Änderungen, Rollback-Anleitungen |
| **`CASCADE.md`** | 🏗️ **Entwicklungsregeln** | Code-Standards, UI-Regeln, Performance |
| **`.cascade-rules.md`** | 🤖 **AI Assistant Regeln** | Mein Workflow, Checklisten, Best Practices |

### 🎯 **Schnellzugriff**

| Thema | Dokument | Abschnitt |
|-------|----------|-----------|
| **Architektur & Ordnerstruktur** | `DWEapp.md` | [Architektur](#architektur) |
| **Komponenten & UI** | `DWEapp.md` | [Komponenten](#komponenten) |
| **Datenbank & Sync** | `DATABASE.md` | [WeClapp Synchronisation](#weclapp-synchronisation) |
| **API-Endpunkte** | `DWEapp.md` | [API Integration](#api-integration) |
| **Code-Regeln** | `CASCADE.md` | [Code-Architektur](#code-architektur) |
| **Letzte Änderungen** | `CHANGELOG.md` | [Letzte Version](#latest-version) |
| **Rollback-Anleitungen** | `CHANGELOG.md` | [Vollständiger Rollback](#vollständiger-rollback) |

**🔔 Merke:** `DWEapp.md` ist immer der **erste Anlaufpunkt** für alle Fragen!

---

---

## 🎯 Überblick

DWEapp ist eine moderne Web-Anwendung für Projekt- und Aufgabenverwaltung mit Fokus auf:

- **Aufgabenverwaltung** mit erweiterten Filtern
- **Auftragsverknüpfung** zu WeClapp API
- **Benutzerverwaltung** mit Rollen
- **Responsive Design** für Desktop & Mobile
- **Dark/Light Mode** Support

### 🏗️ Tech Stack

| Technologie | Version | Zweck |
|-------------|---------|--------|
| **Next.js** | 15.5.6 | React Framework |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 3.x | Styling |
| **PostgreSQL** | 17 | Datenbank |
| **WeClapp API** | v1 | externe Datenquelle |

---

## 🏛️ Architektur

### 📁 Ordnerstruktur & Dateien

```
DWEapp/
├── 📄 DWEapp.md                   # 📚 **Hauptdokumentation** (immer aktuell halten!)
├── 📄 README.md                   # Projekt Beschreibung
├── 📄 package.json                # Dependencies & Scripts
├── 📄 tailwind.config.js          # Tailwind Konfiguration
├── 📄 docker-compose.yml          # PostgreSQL Setup
├── 📄 .env                        # Umgebungsvariablen (nicht committen)
├── 📄 CASCADE.md                  # CASCADE Design System Regeln
│
├── 📁 src/                        # 🎯 **Source Code**
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📄 globals.css         # ✅ CSS Imports (4 Dateien)
│   │   ├── 📄 layout.tsx          # 🏛️ Root Layout
│   │   ├── 📄 page.tsx            # 🏠 Startseite
│   │   └── 📁 [pages]/            # 📄 Dynamische Seiten
│   │       ├── 📄 tasks/page.tsx  # 📋 Aufgabenliste
│   │       └── 📄 dashboard/       # 📊 Dashboard
│   │
│   ├── 📁 components/             # 🧩 **React Komponenten**
│   │   ├── 📁 ui/                 # 🎨 CASCADE UI Komponenten
│   │   │   ├── 📄 button.tsx      # 🔘 Button Komponente
│   │   │   ├── 📄 input.tsx       # 📝 Input Komponente
│   │   │   ├── 📄 card.tsx        # 📋 Card Komponente
│   │   │   ├── 📄 data-table.tsx  # 📊 DataTable Komponente
│   │   │   ├── 📄 select.tsx      # 📋 Select Komponente
│   │   │   └── 📄 status.tsx      # 🏷️ Status Icons
│   │   ├── 📁 tasks/              # 📋 **Aufgaben Komponenten**
│   │   │   ├── 📄 TaskDataTable.tsx    # 📊 Haupt-Tabelle (156 Zeilen ✅)
│   │   │   ├── 📄 TaskFilters.tsx      # 🔍 Filter-UI (145 Zeilen ✅)
│   │   │   ├── 📄 TaskColumns.tsx      # 📋 Spalten-Definition (179 Zeilen ✅)
│   │   │   └── 📄 TaskGrouping.tsx     # 📦 Gruppierung (35 Zeilen ✅)
│   │   └── 📁 layout/              # 🏛️ Layout Komponenten
│   │       ├── 📄 Sidebar.tsx     # 📱 Seitenleiste
│   │       ├── 📄 Header.tsx      # 🔝 Top Navigation
│   │       └── 📄 Footer.tsx      # 🦶 Fußzeile
│   │
│   ├── 📁 styles/                 # 🎨 **CSS Design System**
│   │   ├── 📄 design-system.css   # 🎨 CSS Variablen (118 Zeilen ✅)
│   │   ├── 📄 components.css      # 🧩 UI Komponenten (178 Zeilen ✅)
│   │   ├── 📄 layout.css          # 🏛️ Layout Komponenten (185 Zeilen ✅)
│   │   └── 📄 utilities.css       # 🔧 Utility Classes (118 Zeilen ✅)
│   │
│   ├── 📁 types/                  # 📝 **TypeScript Typen**
│   │   ├── 📄 index.ts            # 🏷️ Globale Typen
│   │   ├── 📄 task.ts             # 📋 Aufgaben Typen
│   │   ├── 📄 user.ts             # 👤 Benutzer Typen
│   │   └── 📄 order.ts            # 📦 Auftrag Typen
│   │
│   ├── 📁 lib/                    # 🔧 **Helper Funktionen**
│   │   ├── 📄 api.ts              # 🌐 API Client
│   │   ├── 📄 utils.ts            # 🛠️ Utility Funktionen
│   │   └── 📄 constants.ts        # 📊 Konstanten
│   │
│   └── 📁 hooks/                  # 🎣 **Custom Hooks**
│       ├── 📄 useTasks.ts         # 📋 Aufgaben Hook
│       ├── 📄 useUsers.ts         # 👤 Benutzer Hook
│       └── 📄 useTheme.ts         # 🌙 Theme Hook
```

### 📋 **Datei-Beschreibungen**

| Kategorie | Dateien | Zweck | CASCADE |
|-----------|---------|-------|----------|
| **📚 Dokumentation** | `DWEapp.md`, `README.md`, `CASCADE.md` | Projekt-Doku & Regeln | ✅ Zentrale Quelle |
| **⚙️ Konfiguration** | `package.json`, `tailwind.config.js`, `docker-compose.yml` | Setup & Build | ✅ Automatisiert |
| **🎨 CSS** | `styles/*.css` | Design System (4 Dateien) | ✅ Alle <200 Zeilen |
| **🧩 UI Komponenten** | `components/ui/*.tsx` | Wiederverwendbare UI | ✅ <200 Zeilen |
| **📋 Task Komponenten** | `components/tasks/*.tsx` | Aufgaben-Logik | ✅ Modularisiert |
| **📝 Typen** | `types/*.ts` | TypeScript Safety | ✅ Zentral |
| **🔧 Helpers** | `lib/*.ts` | Utility Funktionen | ✅ Wiederverwendbar |
| **🎣 Hooks** | `hooks/*.ts` | React Logic | ✅ Custom |

### 🎨 CASCADE Design System

**📏 Datei-Größen (nach Typ):**

| Dateityp | Ideal | Maximum | Warum |
|----------|-------|---------|-------|
| **React Component** | 80–150 | 250 | Eine UI-Aufgabe |
| **Custom Hook** | 40–120 | 200 | Eine Logik-Aufgabe |
| **API-Funktion** | 20–80 | 150 | Ein Endpoint |
| **Utility-Funktion** | 10–50 | 100 | Helper bleiben klein |
| **Type/Interface** | 5–50 | 100 | Nur Typen, keine Logik |
| **Test-Datei** | 50–200 | 400 | Tests können länger sein |

**🎯 CASCADE Regeln:**
- **CSS-Variablen** nutzen
- **Zentrale UI-Komponenten**
- **WIEDERVERWENDUNG** bevorzugen
- **DEMO-REGEL**: Neue Komponenten zur Demo hinzufügen

**📚 WICHTIG: Dokumentation pflegen!**
- **Immer `DWEapp.md` aktualisieren** bei Änderungen
- **Neue Komponenten** hier dokumentieren
- **Version History** pflegen
- **API Änderungen** eintragen
- **CASCADE-Regeln** einhalten

**🔔 Merke:** Diese Dokumentation ist die **zentrale Wahrheitsquelle** für das gesamte Projekt!

---

## 🧩 Komponenten

### 📋 UI Komponenten (`src/components/ui/`)

| Komponente | Zweck | Varianten | CASCADE |
|------------|-------|-----------|----------|
| **Button** | Interaktionen | default, secondary, outline, ghost | ✅ <200 Zeilen |
| **Input** | Formulare | default, filled, error, success | ✅ <200 Zeilen |
| **Card** | Container | default, elevated, outline, muted | ✅ <200 Zeilen |
| **DataTable** | Tabellen | Suche, Filter, Sortierung | ✅ <200 Zeilen |
| **Status** | Status Icons | todo, in-progress, done, blocked | ✅ <200 Zeilen |

### 📋 Task Komponenten (`src/components/tasks/`)

| Komponente | Zeilen | Zweck | CASCADE |
|------------|--------|-------|----------|
| **TaskDataTable** | 156 | Haupt-Tabelle mit Filtern | ✅ <200 Zeilen |
| **TaskFilters** | 145 | Filter-UI (Suche, Status, etc.) | ✅ <200 Zeilen |
| **TaskColumns** | 179 | Spalten-Definition | ✅ <200 Zeilen |
| **TaskGrouping** | 35 | Gruppierungs-Komponente | ✅ <200 Zeilen |

---

## ⚡ Funktionen

### 📋 Aufgabenverwaltung

- **Aufgabenliste** mit erweiterten Filtern
- **Status-Tracking** (Offen, In Arbeit, Erledigt, etc.)
- **Prioritätsmanagement** (Niedrig, Mittel, Hoch)
- **Fälligkeitsdatum** mit Überwachung
- **Benutzerzuweisung** mit Rollen

### 🔗 Auftragsverknüpfung

- **WeClapp API Integration**
- **Auftragsnummern** anzeigen
- **Kundeninformationen** aus Party-Daten
- **Auftragspositionen** verknüpfen

### 🎛️ Filter & Suche

- **Globale Suche** über Aufgaben
- **Status-Filter** (Aufgabenstatus)
- **Prioritäts-Filter** (Aufgabenpriorität)
- **Benutzer-Filter** (Zugewiesen an)
- **Auftrags-Filter** (Auftragsnummer)
- **Datum-Filter** (Fälligkeitsbereich)

### 📊 Gruppierung

- **Nach Status** gruppieren
- **Nach Priorität** gruppieren
- **Nach Zuständig** gruppieren
- **Nach Auftrag** gruppieren

---

## 🔌 API Integration

### 📡 WeClapp API

**Endpunkte:**
- `/task` - Aufgaben
- `/salesOrder` - Aufträge
- `/party` - Kunden/Stammdaten

**Feld-Mapping:**
```typescript
// Task Status
'NOT_STARTED' → 'todo'
'IN_PROGRESS' → 'in-progress'
'COMPLETED' → 'done'
'DEFERRED' → 'blocked'
'WAITING_ON_OTHERS' → 'paused'

// Task Priority
'LOW' → 'low'
'MEDIUM' → 'medium'
'HIGH' → 'high'
```

**Verknüpfungen:**
```
task.orderItemId → salesOrderItem.id → salesOrder.customerId → party
```

**📝 Änderungen & Rollback:**
Siehe **[`CHANGELOG.md`](./CHANGELOG.md)** für:
- Detaillierte Änderungshistorie
- Schema-Änderungen mit SQL-Rollback
- Code-Änderungen mit Git-Befehlen

---

## 🗄️ Datenbank

### 📊 PostgreSQL v17

**Verbindung:**
- **Host:** 91.98.135.191
- **Port:** 5432
- **Datenbank:** dweapp
- **Benutzer:** postgres

**Tabellen:**
- `tasks` - Aufgaben
- `users` - Benutzer
- `orders` - Aufträge
- `parties` - Stammdaten

**📋 Detaillierte Datenbank-Dokumentation:**
Siehe **[`DATABASE.md`](./DATABASE.md)** für:
- Vollständiges Schema mit allen Tabellen
- WeClapp Sync-Protokoll
- Logging-Tabellen (sync_logs, audit_logs)
- Rollback-Anleitungen

---

## 🚀 Deployment

### 🐳 Docker Setup

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: dweapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
```

### 🌍 Umgebung

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

---

## 👨‍💻 Entwicklung

### 🔄 Mein Workflow

**🎯 Zuerst prüfen, dann denken, dann handeln!**

1. **📋 Regeln prüfen** (`.cascade-rules.md`)
   - CASCADE-Regeln checken
   - < 200 Zeilen pro Datei
   - CSS-Variablen nutzen
   - UI-Komponenten importieren

2. **📚 Doku lesen** (`DWEapp.md`)
   - Architektur & Ordnerstruktur
   - Komponenten Übersicht
   - API Integration
   - Version History

3. **🤔 Überlegen**
   - Planung der Änderung
   - CASCADE-Check durchführen
   - Bestehende Komponenten prüfen

4. **⚡ Ausführen**
   - Code schreiben
   - Tools nutzen
   - Tests durchführen

5. **🎨 Demo anpassen**
   - `/design-system` Demo aktualisieren
   - UI-Komponenten zeigen
   - Alle Varianten demonstrieren

6. **📝 Doku aktualisieren**
   - `DWEapp.md` aktualisieren
   - Neue Komponenten eintragen
   - Version History pflegen

### 🛠️ Development Setup

1. **Repository klonen**
2. **Dependencies installieren**
   ```bash
   npm install
   ```
3. **Docker starten**
   ```bash
   docker-compose up -d
   ```
4. **Development Server**
   ```bash
   npm run dev
   ```

### 📝 Coding Standards

**CASCADE Regeln:**
- **< 200 Zeilen** pro Datei
- **CSS-Variablen** nutzen
- **TypeScript** für Type Safety
- **Komponenten importieren**, nicht neu bauen
- **Deutsche UI-Texte**

**Git Workflow:**
- Feature Branches
- Code Reviews
- Automated Tests
- Documentation Updates

---

## 📚 Versionen

### v2.1 (30.11.2025) - **CASCADE Refactoring**

**Neu:**
- ✅ **CASCADE Design System** implementiert
- ✅ **TaskDataTable** auf <200 Zeilen reduziert
- ✅ **CSS-Aufteilung** in 4 Dateien
- ✅ **Runtime Error** behoben (SelectItem)
- ✅ **Lint-Fehler** behoben
- ✅ **Status Icons mit 2 Varianten** (mit Text / nur Icon + Tooltip)
- ✅ **Design-System Demo aktualisiert** (Alle Status Icons mit 2 Varianten gezeigt)

**Änderungen:**
- 📁 `design-system.css` → 4 Dateien aufgeteilt
- 🧩 `TaskDataTable` → 4 Komponenten modularisiert
- 🎨 CSS-Variablen optimiert
- 🔧 TypeScript Types verbessert
- 🏷️ **Status Icons erweitert**: `showText` Prop für Tabellen (nur Icon + Tooltip)

### v2.0 (15.11.2025) - **WeClapp Integration**

**Neu:**
- 🔗 WeClapp API Integration
- 📋 Auftragsverknüpfung
- 👥 Benutzerverwaltung
- 🎨 Dark Mode Support

### v1.0 (01.10.2025) - **Initial Release**

**Neu:**
- 🚀 Next.js 15 Setup
- 🗄️ PostgreSQL Integration
- 📱 Responsive Design
- 🎯 Grundfunktionen

---

## 🔧 CASCADE-Refactorings

### ✅ **Erledigte Refactorings (30.11.2025):**

| Datei | Vorher | Nachher | Status |
|-------|--------|---------|--------|
| **TaskHierarchyListV2.tsx** | 509 | 235 | ✅ In 4 Komponenten aufgeteilt |
| **data-table.tsx** | 441 | 115 | ✅ In 4 Komponenten aufgeteilt |

**Neue Komponenten erstellt:**
- `TaskHierarchyFilters.tsx` (92 Zeilen)
- `TaskHierarchyOrderRow.tsx` (98 Zeilen)
- `TaskHierarchyTaskRow.tsx` (175 Zeilen)
- `data-table-core.tsx` (181 Zeilen)
- `data-table-toolbar.tsx` (124 Zeilen)
- `data-table-pagination.tsx` (59 Zeilen)

### ⚠️ **Noch offen (niedrige Priorität):**

| Datei | Zeilen | Priorität | Vorschlag |
|-------|--------|-----------|-----------|
| **TaskManagement.tsx** | 285 | 🟡 Mittel | Form + List trennen |
| **TaskTable.tsx** | 282 | 🟡 Mittel | Columns + Table trennen |
| **TaskHierarchyList.tsx** | 262 | 🟡 Mittel | Ähnlich wie V2 |
| **role-editor-dialog.tsx** | 250 | 🟢 Niedrig | Am Limit |

### ✅ **Hardcoded Farben behoben:**
- `tabs.tsx` - CSS-Variablen
- `role-editor-dialog.tsx` - CSS-Variablen
- `TaskManagement.tsx` - CSS-Variablen
- `TaskHierarchyListV2.tsx` - CSS-Variablen (via neue Komponenten)

---

## 💡 Ideen & Roadmap

### 🚀 Kurzfristig (Q1 2026)

- [ ] **Dashboard** mit KPIs
- [ ] **Benachrichtigungen** für fällige Aufgaben
- [ ] **Drag & Drop** für Aufgaben
- [ ] **Mobile App** (React Native)
- [ ] **Dateianhänge** für Aufgaben

### 🎯 Mittelfristig (Q2 2026)

- [ ] **Zeiterfassung** pro Aufgabe
- [ ] **Projektmanagement** mit Gantt-Diagramm
- [ ] **Kundenportal** extern
- [ ] **API Dokumentation** (Swagger)
- [ ] **Multi-Tenant** Support

### 🌟 Langfristig (Q3/Q4 2026)

- [ ] **KI Integration** für Aufgaben-Vorschläge
- [ ] **Automatisierungen** (Workflows)
- [ ] **Reporting** & Analytics
- [ ] **Integrationen** (Slack, Teams, etc.)
- [ ] **White-Label** Lösung

---

## 📞 Support

### 📧 Kontakt

- **Entwickler:** CASCADE AI Assistant
- **Dokumentation:** [DWEapp.md](./DWEapp.md)
- **Issues:** GitHub Repository

### 🔗 Nützliche Links

- **Next.js Dokumentation:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **PostgreSQL:** https://www.postgresql.org/docs/
- **WeClapp API:** https://api.weclapp.com/

### 📚 Dokumentations-Übersicht

| Dokument | Zweck | Link |
|----------|-------|------|
| **Hauptdokumentation** | Architektur, Komponenten, API | [DWEapp.md](./DWEapp.md) |
| **Datenbank & Sync** | Schema, Protokoll, Logging | [DATABASE.md](./DATABASE.md) |
| **Änderungen & Rollback** | Versionen, Änderungen | [CHANGELOG.md](./CHANGELOG.md) |
| **Entwicklungsregeln** | Code-Standards, UI-Regeln | [CASCADE.md](./CASCADE.md) |
| **AI Assistant Regeln** | Mein Workflow, Checklisten | [.cascade-rules.md](./.cascade-rules.md) |

---

*Diese Dokumentation wird kontinuierlich aktualisiert. Letzte Änderung: 30.11.2025*
