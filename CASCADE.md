# CASCADE - Entwicklungsregeln & Richtlinien

## 📚 **WICHTIG: Dokumentation verwenden!**

**🔔 IMMER ZUERST in `DWEapp.md` nachschauen:**
- **Architektur & Ordnerstruktur** → Wo ist welche Datei?
- **Komponenten Übersicht** → Was gibt es bereits?
- **API Integration** → Wie funktioniert WeClapp?
- **Version History** → Was wurde wann geändert?
- **Datenbank Setup** → Wie verbinde ich mich?

**📋 DOKUMENTATIONS-REGELN:**
- **Immer `DWEapp.md` aktualisieren** bei Änderungen
- **Neue Komponenten** dort dokumentieren
- **API Änderungen** eintragen
- **CASCADE-Regeln** einhalten
- **Version History** pflegen

**🎯 MERKE:** `DWEapp.md` ist die **zentrale Wahrheitsquelle** für das gesamte Projekt!

---

## 🤖 **AI Assistant Regeln (Cascade)**

### **Sprache**
- **Kommunikation**: Immer Deutsch
- **Code-Kommentare**: Deutsch
- **Variablen/Funktionen**: Englisch (Standard in der Programmierung)
- **UI-Texte**: Deutsch

### **Grundprinzipien**
- **Minimale Änderungen**: Nur ändern was nötig ist
- **Kein Over-Engineering**: Einfache Lösungen zuerst
- **Production-Ready**: Code muss sofort funktionieren
- **Performance**: App einfach und schnell halten
- **Sicherheit**: Keine Secrets, keine unsicheren Commands

### **Code-Architektur**
- **Zentrale Komponenten**: Alles über `src/components/ui/` wiederverwenden
- **CSS-Variablen**: Immer `src/styles/design-system.css` nutzen
- **Keine Inline-Styles**: Tailwind-Klassen oder CSS-Variablen verwenden
- **Kleine Komponenten**: Siehe Datei-Größen Tabelle unten
- **Neueste Versionen**: Immer aktuelle Pakete nutzen (React 19, Next.js 15)

### **Datei-Größen (nach Typ)**

| Dateityp | Ideal | Maximum | Warum |
|----------|-------|---------|-------|
| **React Component** | 80–150 | 250 | Eine UI-Aufgabe |
| **Custom Hook** | 40–120 | 200 | Eine Logik-Aufgabe |
| **API-Funktion** | 20–80 | 150 | Ein Endpoint |
| **Utility-Funktion** | 10–50 | 100 | Helper bleiben klein |
| **Type/Interface** | 5–50 | 100 | Nur Typen, keine Logik |
| **Test-Datei** | 50–200 | 400 | Tests können länger sein |

**Über Maximum → aufteilen!**

### **Komponenten-Regeln**
- **Kleine Funktionen**: Max. 50 Zeilen
- **Single Responsibility**: Eine Aufgabe pro Funktion
- **TypeScript**: Immer Typen definieren
- **WIEDERVERWENDUNG**: Immer UI-Komponenten importieren, nicht neu bauen
- **DOKUMENTATION**: Neue Komponenten in `DWEapp.md` eintragen

### **UI-Komponenten Regeln**
```typescript
// ✅ RICHTIG: Zentrale Komponenten importieren
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// ✅ RICHTIG: Lucide Icons für UI-Elemente
import { Plus, RefreshCw, User, Package } from 'lucide-react'

// ✅ RICHTIG: TanStack Table für komplexe Tabellen
import { useReactTable } from '@tanstack/react-table'

// ❌ FALSCH: Komponenten neu bauen statt importieren
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
  Neu bauen - FALSCH!
</button>

// ✅ RICHTIG: CSS-Variablen nutzen
className="text-[var(--primary)] bg-[var(--bg-secondary)]"

// ❌ FALSCH: Hardcoded Farben
className="text-gray-900 bg-white"
```

### **Design-System Demo**
```
Live-Demo aller Komponenten: /design-system
```

**Regel: Alle neuen UI-Komponenten müssen zur Design-System Demo hinzugefügt werden!**

### **🔄 Mein Workflow**
1. **📋 Regeln prüfen** (`.cascade-rules.md`)
2. **📚 Doku lesen** (`DWEapp.md` - Architektur, Komponenten, API)
3. **🤔 Überlegen** (Planung, CASCADE-Check)
4. **⚡ Ausführen** (Code schreiben, Tools nutzen)
5. **🎨 Demo anpassen** (`/design-system` - UI-Komponenten zeigen)
6. **📝 Doku aktualisieren** (`DWEapp.md` - Änderungen dokumentieren)

**🎯 Zuerst prüfen, dann denken, dann handeln, dann demonstrieren!**

### **Dokumentations-Pflicht**
**🔔 WICHTIG: Bei jeder Änderung `DWEapp.md` aktualisieren!**
- **Neue Komponenten** → In Dateiliste eintragen
- **API Änderungen** → In API-Sektion eintragen  
- **Version Updates** → In Version History eintragen
- **Bug Fixes** → In Version History dokumentieren
- **Refactoring** → In Version History eintragen

### **🎨 Design-System Demo Pflicht**
**🔔 WICHTIG: Bei UI-Komponenten Änderungen `/design-system` Demo anpassen!**
- **Neue Komponenten** → Zur Demo hinzufügen
- **Geänderte Komponenten** → Demo aktualisieren
- **Alle Varianten** zeigen (mit/ohne Text, verschiedene Props)
- **Live-Demo** unter `/design-system` erreichbar

### **Design-System Farben**
```css
/* IMMER diese Variablen nutzen: */
--primary          /* Haupttext */
--secondary        /* Sekundärtext */
--muted            /* Gedämpfter Text */
--bg-primary       /* Seitenhintergrund */
--bg-secondary     /* Cards/Elevated */
--accent           /* Buttons, Links */
--accent-hover     /* Hover-Zustand */
--warning          /* Orange Warnungen */
--error            /* Rot Fehler */
--info             /* Teal Info/Links */
```

### **Datenbank Regeln**
- **Schema zuerst**: Immer `prisma/schema.prisma` aktualisieren
- **Generieren**: Nach Schema-Änderung `npx prisma generate`
- **User-Trennung**: `User` (App) vs `WeClappUser` (Sync-Daten)
- **Soft Delete**: `isActive: false` statt hartem Löschen

### **API Entwicklung**
- **Error Handling**: Immer try-catch mit deutschen Fehlermeldungen
- **Authentifizierung**: Session prüfen vor Verarbeitung
- **Validierung**: Inputs validieren vor DB-Operationen
- **Response-Format**: Einheitliche JSON-Struktur
```typescript
// Erfolg
{ success: true, data: {...} }

// Fehler
{ success: false, error: "Fehlermeldung auf Deutsch" }
```

### **Deployment Regeln**
- **Lokal entwickeln**: Erst testen, dann hochladen
- **CI/CD**: GitHub Actions für automatisches Deployment
- **Container Registry**: Build auf GitHub, Pull auf Server
- **Keine Secrets**: Environment-Variablen nutzen

---

## � **Projektstruktur**

```
src/
├── app/                    # Next.js App Router (Seiten)
├── components/
│   ├── ui/                # Basis-UI-Komponenten (Button, Card, Input...)
│   └── *.tsx              # Feature-Komponenten
├── lib/                   # Utilities & Konfiguration
├── styles/
│   └── design-system.css  # Zentrale CSS-Variablen
├── hooks/                 # Custom React Hooks
├── services/              # API-Service-Layer
└── types/                 # TypeScript Typen
```

---

## 🎨 **Komponenten-Hierarchie**

```
1. design-system.css       → CSS-Variablen (Farben, Abstände, Schatten)
       ↓
2. src/components/ui/      → Basis-Komponenten (Button, Card, Input)
       ↓
3. src/components/*.tsx    → Feature-Komponenten (TaskList, UserCard)
       ↓
4. src/app/*/page.tsx      → Seiten (kombinieren Komponenten)
```

### **Komponenten-Größe**
| Typ | Max. Zeilen | Beispiel |
|-----|-------------|----------|
| UI-Komponente | 100 | Button, Card, Icon |
| Feature-Komponente | 200 | TaskList, UserTable |
| Seite | 300 | TasksPage, AdminPage |

**Zu groß?** → In kleinere Komponenten aufteilen!

---

## ⚡ **Performance-Regeln**

- **Lazy Loading**: Große Komponenten dynamisch laden
- **Memoization**: `useMemo` / `useCallback` für teure Berechnungen
- **Keine unnötigen Re-Renders**: Props minimieren
- **Bilder optimieren**: Next.js `<Image />` verwenden
- **Bundle-Größe**: Regelmäßig prüfen

---

## � **Entwickler-Workflow**

### **Lokal Entwickeln**
```bash
# 1. Dependencies installieren
npm install --legacy-peer-deps

# 2. Prisma-Typen generieren
npx prisma generate

# 3. Dev-Server starten
npm run dev
# → http://localhost:3000
```

### **Code hochladen**
```bash
git add -A
git commit -m "feat: Beschreibung auf Deutsch"
git push origin main
# → CI/CD deployed automatisch
```

---

## � **Fehlerbehebung**

| Problem | Lösung |
|---------|--------|
| Prisma-Fehler | `npx prisma generate` |
| npm-Fehler | `npm install --legacy-peer-deps` |
| TypeScript-Fehler | Typen in `src/types/` prüfen |
| CSS-Fehler | CSS-Variablen in `design-system.css` prüfen |

---

## 📋 **Checkliste für neue Features**

- [ ] Design-System Farben verwendet
- [ ] Zentrale UI-Komponenten importiert
- [ ] **WIEDERVERWENDUNG**: Bestehende Komponenten nutzen, nicht neu bauen
- [ ] Lucide Icons für UI-Elemente verwendet
- [ ] TypeScript Typen definiert
- [ ] Deutsche UI-Texte
- [ ] Responsive Design
- [ ] Error Handling
- [ ] Loading States

---

## 🎯 **Aktuelle Prioritäten**

1. **Mein Bereich** - User-Ansicht mit eigenen Aufgaben
2. **Manager Bereich** - Team-Übersicht & Verwaltung
3. **Zeiterfassung** - Buchungen & Tracking
4. **Performance** - App schnell halten

---

*Zuletzt aktualisiert: 30.11.2025*
*Version: 2.0.0*
