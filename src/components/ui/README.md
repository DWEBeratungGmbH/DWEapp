# UI Components - CASCADE Design System

## 🎨 **Design System Variablen**

Alle Farben und Abstände werden über CSS-Variablen gesteuert:

```css
/* Farben */
--primary          /* Haupttext - dunkel */
--secondary        /* Sekundärtext - mittel */
--muted            /* Gedämpfter Text - hell */
--bg-primary       /* Seitenhintergrund */
--bg-secondary     /* Cards/Elevated */
--bg-tertiary      /* Hover/Disabled */
--accent           /* Buttons, Links - blau */
--accent-hover     /* Hover-Zustand */
--warning          /* Orange Warnungen */
--error            /* Rot Fehler */
--success          /* Grün Erfolg */
--info             /* Teal Info */
--border           /* Rahmenfarbe */
```

## 🧩 **Verfügbare UI-Komponenten**

### **Button** (`@/components/ui/button`)
```typescript
import { Button } from '@/components/ui/button'

// Varianten
<Button>Primary (Grün)</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive (Rot)</Button>
<Button variant="success">Success (Grün)</Button>
<Button variant="warning">Warning (Orange)</Button>
<Button variant="info">Info (Teal)</Button>
<Button variant="link">Link</Button>

// Größen
<Button size="sm">Klein</Button>
<Button size="default">Standard</Button>
<Button size="lg">Groß</Button>
<Button size="icon"><Plus className="h-4 w-4" /></Button>

// Mit Icon
<Button>
  <Plus className="h-4 w-4" />
  Mit Icon
</Button>
```

### **Input** (`@/components/ui/input`)
```typescript
import { Input } from '@/components/ui/input'

// Varianten
<Input placeholder="Standard" />
<Input variant="filled" placeholder="Filled" />
<Input variant="error" placeholder="Error" />
<Input variant="success" placeholder="Success" />

// Größen
<Input size="sm" placeholder="Klein" />
<Input size="default" placeholder="Standard" />
<Input size="lg" placeholder="Groß" />

// Input mit Icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
  <Input className="pl-10" placeholder="Suchen..." />
</div>
```

### **Text Elements**
```typescript
// Headings
<h1 className="text-3xl font-bold text-[var(--primary)]">Heading 1</h1>
<h2 className="text-2xl font-semibold text-[var(--primary)]">Heading 2</h2>
<h3 className="text-xl font-medium text-[var(--primary)]">Heading 3</h3>

// Body Text
<p className="text-[var(--primary)]">Normaler Text</p>
<p className="text-[var(--secondary)]">Sekundärer Text</p>
<p className="text-[var(--muted)]">Gedämpfter Text</p>

// Special Text
<p className="text-[var(--accent)]">Accent Text</p>
<p className="text-[var(--error)]">Error Text</p>
<p className="text-[var(--warning)]">Warning Text</p>
<p className="text-[var(--success)]">Success Text</p>
```

### **Lucide Icons**
```typescript
import { Plus, Edit, Trash2, Search, User, Package, Check, X } from 'lucide-react'

// Action Icons
<Plus className="h-4 w-4 text-[var(--accent)]" />
<Edit className="h-4 w-4 text-[var(--muted)]" />
<Trash2 className="h-4 w-4 text-[var(--error)]" />

// Navigation Icons
<ChevronDown className="h-4 w-4 text-[var(--muted)]" />
<ChevronRight className="h-4 w-4 text-[var(--muted)]" />

// Status Icons
<Check className="h-4 w-4 text-[var(--success)]" />
<X className="h-4 w-4 text-[var(--error)]" />
<AlertCircle className="h-4 w-4 text-[var(--warning)]" />
```

### **Card** (`@/components/ui/card`)
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

// Varianten
<Card>Standard Card</Card>
<Card variant="elevated">Elevated (mit Schatten)</Card>
<Card variant="outline">Outline (nur Border)</Card>
<Card variant="muted">Muted (grauer Hintergrund)</Card>
<Card variant="success">Success (grüner Akzent)</Card>
<Card variant="warning">Warning (oranger Akzent)</Card>
<Card variant="error">Error (roter Akzent)</Card>
<Card variant="info">Info (teal Akzent)</Card>

// Vollständige Card
<Card>
  <CardHeader>
    <CardTitle>Titel</CardTitle>
    <CardDescription>Beschreibung</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Inhalt der Card</p>
  </CardContent>
  <CardFooter>
    <Button>Aktion</Button>
  </CardFooter>
</Card>
```

### **DataTable** (`@/components/ui/data-table`)
```typescript
import { DataTable, StatusIcon, type FilterableColumn } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

// Filter Options für Spalten
const statusFilter: FilterableColumn = {
  id: 'status',
  options: [
    { value: 'aktiv', label: 'Aktiv' },
    { value: 'planung', label: 'In Planung' },
  ]
}

// Columns Definition mit StatusIcon
const columns: ColumnDef<TaskType>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    filterFn: 'equals',
    cell: ({ row }) => (
      <StatusIcon 
        icon={<Check />} 
        tooltip="Aktiv" 
        color="text-[var(--success)]" 
      />
    )
  },
]

// Usage
<DataTable
  columns={columns}
  data={tasks}
  searchPlaceholder="Suchen..."
  filterableColumns={[statusFilter]}
  columnVisibility={{ name: true, status: true }}
  onColumnVisibilityChange={(vis) => console.log(vis)}
/>
```

**Features:**
- 🔍 **Global-Suche** über alle Spalten
- 🎯 **Spalten-Filter** mit Dropdown pro Spalte
- ⚙️ **Spalten-Konfiguration** ein/ausblenden
- 📊 **Sortierung** über Header-Klick
- 📄 **Pagination** (10 Einträge/Seite)
- 💬 **StatusIcon** mit Tooltip/Hover-Text
- 🎨 **CASCADE-konform** mit CSS-Variablen

### **Tooltip** (`@/components/ui/tooltip`)
```typescript
import { Tooltip } from '@/components/ui/tooltip'

<Tooltip content="Hover-Text hier" position="top">
  <Button><Edit /></Button>
</Tooltip>
```

**Positionen:** top, bottom, left, right

### **Status** (`@/components/ui/status`)
```typescript
import { 
  TaskStatusIcon, 
  ProjectStatusIcon, 
  PriorityIcon,
  taskStatusFilterOptions,
  priorityFilterOptions
} from '@/components/ui/status'

// Task Status (todo, in-progress, done, blocked, paused)
<TaskStatusIcon status="in-progress" />

// Project Status (aktiv, planung, abgeschlossen, pausiert)
<ProjectStatusIcon status="aktiv" />

// Priority (low, medium, high, critical)
<PriorityIcon priority="high" />
```

**Filter Options für DataTable:**
- `taskStatusFilterOptions` - Task Status Filter
- `priorityFilterOptions` - Priorität Filter

## 📋 **WeClapp API Feldnamen**

**WICHTIG: Alle Feldnamen müssen exakt mit WeClapp übereinstimmen!**

### Task-Status (`taskProgressStatus`)
| WeClapp Wert | Beschreibung |
|--------------|--------------|
| `NOT_STARTED` | Offen |
| `IN_PROGRESS` | In Arbeit |
| `COMPLETED` | Erledigt |
| `DEFERRED` | Zurückgestellt |
| `WAITING_ON_OTHERS` | Wartend |

### Task-Priorität (`taskPriority`)
| WeClapp Wert | Beschreibung |
|--------------|--------------|
| `LOW` | Niedrig |
| `MEDIUM` | Mittel |
| `HIGH` | Hoch |

### Task-Felder
| WeClapp Feld | Typ | Beschreibung |
|--------------|-----|--------------|
| `id` | String | Task ID |
| `subject` | String | Titel |
| `description` | String (HTML) | Beschreibung |
| `taskStatus` | Enum | Status (s.o.) |
| `taskPriority` | Enum | Priorität (s.o.) |
| `dateFrom` | Timestamp (ms) | Startdatum |
| `dateTo` | Timestamp (ms) | Enddatum/Fällig |
| `assignees` | Array<TaskAssignee> | Zuständige |
| `orderItemId` | String | Verknüpfte Auftragsposition |
| `parentTaskId` | String | Übergeordnete Aufgabe |
| `creatorUserId` | String | Ersteller |

### TaskAssignee-Struktur
```json
{ "userId": "3471", "plannedEffort": 3600000 }
```

---

## 📋 **CASCADE Checkliste**

Für jede neue Komponente:

- [ ] **CSS-Variablen** statt Hardcoded Farben
- [ ] **Lucide Icons** für UI-Elemente
- [ ] **WIEDERVERWENDUNG**: Bestehende Komponenten importieren, nicht neu bauen
- [ ] **WeClapp-Feldnamen**: Exakt wie in der API (siehe oben!)
- [ ] **Consistentes Padding**: px-4 py-2 (Buttons), px-3 py-2 (Inputs)
- [ ] **Hover-States** mit transition-colors
- [ ] **Focus-States** mit ring-2 und accent-color
- [ ] **Deutsche UI-Texte**
- [ ] **< 200 Zeilen** pro Komponente

## 🚫 **Nicht verwenden**

```typescript
// ❌ FALSCH - Hardcoded Farben
className="bg-white text-gray-900 border-gray-300"

// ❌ FALSCH - Andere Icon-Libraries
import { Icon } from 'react-icons/ri'

// ❌ FALSCH - Inline Styles
style={{ backgroundColor: 'white', color: 'black' }}

// ❌ FALSCH - Inconsistent Padding
className="px-2 py-1"  // Nicht standardisiert
```

## ✅ **RICHTIG - CASCADE konform**

```typescript
// ✅ RICHTIG - CSS-Variablen
className="bg-[var(--bg-primary)] text-[var(--primary)] border-[var(--border)]"

// ✅ RICHTIG - Lucide Icons
import { Plus, User } from 'lucide-react'

// ✅ RICHTIG - Consistentes Design
className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
```

---

## 📊 **Varianten-Übersicht**

### **Button Varianten**
| Variante | Farbe | Verwendung |
|----------|-------|------------|
| `default` | Grün (accent) | Hauptaktion |
| `secondary` | Grau | Sekundäre Aktion |
| `outline` | Transparent + Border | Alternative Aktion |
| `ghost` | Transparent | Minimale Aktion |
| `destructive` | Rot | Löschen/Gefahr |
| `success` | Grün | Erfolgsmeldung |
| `warning` | Orange | Warnung |
| `info` | Teal | Information |
| `link` | Text nur | Links |

### **Button Größen**
| Größe | Klasse | Verwendung |
|-------|--------|------------|
| `sm` | h-9 px-3 | Kompakte Buttons |
| `default` | h-10 px-4 | Standard |
| `lg` | h-11 px-8 | Prominente Buttons |
| `icon` | h-10 w-10 | Nur Icon |

### **Input Varianten**
| Variante | Beschreibung |
|----------|--------------|
| `default` | Standard Input |
| `filled` | Grauer Hintergrund |
| `error` | Roter Border |
| `success` | Grüner Border |

### **Card Varianten**
| Variante | Beschreibung |
|----------|--------------|
| `default` | Standard mit Schatten |
| `elevated` | Mehr Schatten + Hover |
| `outline` | Nur Border |
| `muted` | Grauer Hintergrund |
| `success` | Grüner Akzent links |
| `warning` | Oranger Akzent links |
| `error` | Roter Akzent links |
| `info` | Teal Akzent links |

---

## 📁 **Datei-Struktur**

```
src/components/ui/
├── button.tsx     # Button mit 9 Varianten + 4 Größen
├── input.tsx      # Input mit 4 Varianten + 3 Größen
├── card.tsx       # Card mit 8 Varianten
├── data-table.tsx # DataTable mit TanStack Table
├── tooltip.tsx    # Tooltip mit Hover-Text
├── status.tsx     # Status Icons (Task, Project, Priority)
└── README.md      # Diese Dokumentation
```

## 🎨 **Live-Demo**

```
Design-System Demo: /design-system
```

**Alle UI-Komponenten an einem Ort:**
- 🌞/🌙 Dark/Light Mode Toggle
- 🔍 DataTable mit Spalten-Filter
- 💬 StatusIcon mit Tooltip
- ⚙️ Spalten-Konfiguration

**DEMO-REGEL**: Alle neuen UI-Komponenten müssen zur Design-System Demo hinzugefügt werden!

---

## 🎯 **Verwendung - NUR IMPORTIEREN!**

```typescript
// ✅ RICHTIG: Komponenten importieren
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

// ✅ RICHTIG: Varianten nutzen
<Button variant="destructive">Löschen</Button>
<Input variant="error" />
<Card variant="success">Erfolg!</Card>

// ✅ RICHTIG: DataTable nutzen
<DataTable columns={columns} data={tasks} />

// ❌ FALSCH: Eigene Komponenten bauen
<button className="px-4 py-2 bg-red-500">Löschen</button>
<table className="w-full">...</table>
```

---

**Alle Komponenten sind zentral definiert - NUR IMPORTIEREN!** 🎯
