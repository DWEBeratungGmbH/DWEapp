// Design-System Demo - Light & Dark Mode
// CASCADE-konform: Alle Komponenten werden importiert!

'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, Search, User, Package, Edit, Trash2, Check, X,
  ChevronDown, ChevronRight, AlertCircle, RefreshCw, Moon, Sun, Info, Clock
} from 'lucide-react'

// CASCADE: UI-Komponenten importieren
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { DataTable, type FilterableColumn } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Tooltip } from '@/components/ui/tooltip'
import { 
  TaskStatusIcon, 
  ProjectStatusIcon, 
  PriorityIcon,
  type TaskStatus,
  type ProjectStatus,
  type PriorityLevel
} from '@/components/ui/status'

// DataTable Demo Component
function DataTableDemo() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-[var(--muted)]">Lade DataTable...</div>
      </div>
    )
  }
  
  // Demo Data für DataTable
  interface DemoItem {
    id: string
    name: string
    status: 'aktiv' | 'planung' | 'abgeschlossen'
    value: number
  }
  
  const demoData: DemoItem[] = [
    { id: '1', name: 'Projekt Alpha', status: 'aktiv', value: 85 },
    { id: '2', name: 'Projekt Beta', status: 'planung', value: 45 },
    { id: '3', name: 'Projekt Gamma', status: 'abgeschlossen', value: 100 },
    { id: '4', name: 'Projekt Delta', status: 'aktiv', value: 67 },
    { id: '5', name: 'Projekt Epsilon', status: 'planung', value: 23 },
  ]
  
  // Filter Options für Status
  const statusFilterOptions: FilterableColumn = {
    id: 'status',
    options: [
      { value: 'aktiv', label: 'Aktiv' },
      { value: 'planung', label: 'In Planung' },
      { value: 'abgeschlossen', label: 'Abgeschlossen' },
    ]
  }
  
  // Column Definition
  const columns: ColumnDef<DemoItem>[] = [
    {
      accessorKey: 'name',
      header: 'Projekt',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-[var(--info)]" />
          <span className="font-medium">{row.getValue('name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterFn: 'equals',
      cell: ({ row }) => {
        const status = row.getValue('status') as ProjectStatus
        return <ProjectStatusIcon status={status} />
      },
    },
    {
      accessorKey: 'value',
      header: 'Fortschritt',
      cell: ({ row }) => {
        const value = row.getValue('value') as number
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden max-w-[100px]">
              <div 
                className="h-full bg-[var(--accent)] transition-all duration-300"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-sm text-[var(--muted)] w-12 text-right">
              {value}%
            </span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tooltip content="Bearbeiten">
            <Button size="sm" variant="ghost">
              <Edit className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Löschen">
            <Button size="sm" variant="ghost">
              <Trash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ]
  
  return (
    <DataTable
      columns={columns}
      data={demoData}
      searchPlaceholder="Projekte durchsuchen..."
      filterableColumns={[statusFilterOptions]}
      columnVisibility={{
        name: true,
        status: true,
        value: true,
        actions: true,
      }}
      onColumnVisibilityChange={(visibility) => {
        console.log('Column visibility changed:', visibility)
      }}
    />
  )
}

export default function DesignSystemPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // Dark Mode Toggle mit data-theme Attribut
  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light')
  }

  // Initial Theme setzen
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--primary)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--primary)]">
              Design-System
            </h1>
            <p className="text-[var(--secondary)]">
              CASCADE UI-Komponenten - Light & Dark Mode
            </p>
          </div>
          
          {/* Dark Mode Toggle */}
          <Button 
            variant="secondary" 
            onClick={toggleDarkMode}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>

        {/* Mode Indicator */}
        <Card variant={isDarkMode ? 'info' : 'default'}>
          <CardContent className="py-4">
            <p className="font-medium">
              Aktuell: {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </p>
          </CardContent>
        </Card>

        {/* Button Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">
            Buttons
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Button Varianten</CardTitle>
              <CardDescription>Alle 9 Button-Varianten mit 4 Größen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Varianten */}
              <div className="flex flex-wrap gap-3">
                <Button><Plus className="h-4 w-4" />Primary</Button>
                <Button variant="secondary"><Edit className="h-4 w-4" />Secondary</Button>
                <Button variant="outline"><Package className="h-4 w-4" />Outline</Button>
                <Button variant="ghost"><Search className="h-4 w-4" />Ghost</Button>
                <Button variant="destructive"><Trash2 className="h-4 w-4" />Destructive</Button>
                <Button variant="success"><Check className="h-4 w-4" />Success</Button>
                <Button variant="warning"><AlertCircle className="h-4 w-4" />Warning</Button>
                <Button variant="info"><Info className="h-4 w-4" />Info</Button>
                <Button variant="link">Link</Button>
              </div>

              {/* Größen */}
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Klein</Button>
                <Button size="default">Standard</Button>
                <Button size="lg">Groß</Button>
                <Button size="icon"><RefreshCw className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Input Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">
            Input Fields
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Input Varianten</CardTitle>
              <CardDescription>4 Varianten mit 3 Größen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--primary)]">
                    Standard Input
                  </label>
                  <Input 
                    placeholder="Text eingeben..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--primary)]">
                    Filled Input
                  </label>
                  <Input variant="filled" placeholder="Filled..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--primary)]">
                    Error Input
                  </label>
                  <Input variant="error" placeholder="Fehler..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--primary)]">
                    Success Input
                  </label>
                  <Input variant="success" placeholder="Erfolg..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--primary)]">
                    Input mit Icon
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <Input className="pl-10" placeholder="Suchen..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--primary)]">
                    Input Größen
                  </label>
                  <div className="space-y-2">
                    <Input size="sm" placeholder="Klein" />
                    <Input size="default" placeholder="Standard" />
                    <Input size="lg" placeholder="Groß" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Card Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">
            Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--secondary)]">Standard Card</p>
              </CardContent>
            </Card>
            
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--secondary)]">Mit Schatten</p>
              </CardContent>
            </Card>
            
            <Card variant="outline">
              <CardHeader>
                <CardTitle>Outline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--secondary)]">Nur Border</p>
              </CardContent>
            </Card>
            
            <Card variant="muted">
              <CardHeader>
                <CardTitle>Muted</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--secondary)]">Grauer Hintergrund</p>
              </CardContent>
            </Card>
            
            <Card variant="success">
              <CardHeader>
                <CardTitle>Success</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--secondary)]">Grüner Akzent</p>
              </CardContent>
            </Card>
            
            <Card variant="warning">
              <CardHeader>
                <CardTitle>Warning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--secondary)]">Oranger Akzent</p>
              </CardContent>
            </Card>
            
            <Card variant="error">
              <CardHeader>
                <CardTitle>Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--secondary)]">Roter Akzent</p>
              </CardContent>
            </Card>
            
            <Card variant="info">
              <CardHeader>
                <CardTitle>Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--secondary)]">Teal Akzent</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Icons Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">
            Lucide Icons
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Icon Beispiele</CardTitle>
              <CardDescription>Alle Icons von lucide-react</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <Plus className="h-5 w-5 text-[var(--accent)]" />
                  <span className="text-sm">Plus</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <Edit className="h-5 w-5 text-[var(--accent)]" />
                  <span className="text-sm">Edit</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <Trash2 className="h-5 w-5 text-[var(--error)]" />
                  <span className="text-sm">Trash</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <Search className="h-5 w-5 text-[var(--muted)]" />
                  <span className="text-sm">Search</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <Check className="h-5 w-5 text-[var(--success)]" />
                  <span className="text-sm">Check</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <X className="h-5 w-5 text-[var(--error)]" />
                  <span className="text-sm">X</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <AlertCircle className="h-5 w-5 text-[var(--warning)]" />
                  <span className="text-sm">Alert</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <Info className="h-5 w-5 text-[var(--info)]" />
                  <span className="text-sm">Info</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <User className="h-5 w-5 text-[var(--accent)]" />
                  <span className="text-sm">User</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <Package className="h-5 w-5 text-[var(--info)]" />
                  <span className="text-sm">Package</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <Clock className="h-5 w-5 text-[var(--muted)]" />
                  <span className="text-sm">Clock</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg">
                  <RefreshCw className="h-5 w-5 text-[var(--muted)]" />
                  <span className="text-sm">Refresh</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">
            Typografie
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h1 className="text-3xl font-bold text-[var(--primary)]">Heading 1</h1>
              <h2 className="text-2xl font-semibold text-[var(--primary)]">Heading 2</h2>
              <h3 className="text-xl font-medium text-[var(--primary)]">Heading 3</h3>
              <p className="text-[var(--primary)]">Primary Text - Haupttext</p>
              <p className="text-[var(--secondary)]">Secondary Text - Sekundärtext</p>
              <p className="text-[var(--muted)]">Muted Text - Gedämpfter Text</p>
              <p className="text-[var(--accent)]">Accent Text - Akzentfarbe</p>
              <p className="text-[var(--error)]">Error Text - Fehler</p>
              <p className="text-[var(--warning)]">Warning Text - Warnung</p>
              <p className="text-[var(--success)]">Success Text - Erfolg</p>
              <p className="text-[var(--info)]">Info Text - Information</p>
            </CardContent>
          </Card>
        </section>

        {/* Full Card Example */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">
            Vollständige Card
          </h2>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Beispiel Card</CardTitle>
              <CardDescription>Eine vollständige Card mit allen Elementen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--secondary)] mb-4">
                Diese Card zeigt alle verfügbaren Elemente: Header, Content und Footer.
              </p>
              <Input placeholder="Eingabe hier..." />
            </CardContent>
            <CardFooter>
              <Button>Speichern</Button>
              <Button variant="secondary">Abbrechen</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Status Icons Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">
            Status Icons
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Wiederverwendbare Status Komponenten</CardTitle>
              <CardDescription>Icons mit Tooltip - einfach importieren</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Task Status */}
                <div>
                  <h4 className="font-medium mb-3 text-[var(--primary)]">Aufgaben Status</h4>
                  
                  {/* Variante 1: Mit Text */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2 text-[var(--secondary)]">Variante 1: Mit Text</h5>
                    <div className="flex flex-wrap gap-4">
                      <TaskStatusIcon status="todo" showText={true} />
                      <TaskStatusIcon status="in-progress" showText={true} />
                      <TaskStatusIcon status="done" showText={true} />
                      <TaskStatusIcon status="blocked" showText={true} />
                      <TaskStatusIcon status="paused" showText={true} />
                    </div>
                  </div>
                  
                  {/* Variante 2: Nur Icon mit Tooltip (für Tabellen) */}
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-[var(--secondary)]">Variante 2: Nur Icon mit Tooltip (Tabellen)</h5>
                    <div className="flex flex-wrap gap-4">
                      <TaskStatusIcon status="todo" className="scale-125" />
                      <TaskStatusIcon status="in-progress" className="scale-125" />
                      <TaskStatusIcon status="done" className="scale-125" />
                      <TaskStatusIcon status="blocked" className="scale-125" />
                      <TaskStatusIcon status="paused" className="scale-125" />
                    </div>
                  </div>
                </div>
                
                {/* Project Status */}
                <div>
                  <h4 className="font-medium mb-3 text-[var(--primary)]">Projekt Status</h4>
                  
                  {/* Variante 1: Mit Text */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2 text-[var(--secondary)]">Variante 1: Mit Text</h5>
                    <div className="flex flex-wrap gap-4">
                      <ProjectStatusIcon status="aktiv" showText={true} />
                      <ProjectStatusIcon status="planung" showText={true} />
                      <ProjectStatusIcon status="abgeschlossen" showText={true} />
                      <ProjectStatusIcon status="pausiert" showText={true} />
                    </div>
                  </div>
                  
                  {/* Variante 2: Nur Icon mit Tooltip (für Tabellen) */}
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-[var(--secondary)]">Variante 2: Nur Icon mit Tooltip (Tabellen)</h5>
                    <div className="flex flex-wrap gap-4">
                      <ProjectStatusIcon status="aktiv" className="scale-125" />
                      <ProjectStatusIcon status="planung" className="scale-125" />
                      <ProjectStatusIcon status="abgeschlossen" className="scale-125" />
                      <ProjectStatusIcon status="pausiert" className="scale-125" />
                    </div>
                  </div>
                </div>
                
                {/* Priority (WeClapp: LOW, MEDIUM, HIGH) */}
                <div>
                  <h4 className="font-medium mb-3 text-[var(--primary)]">Priorität</h4>
                  
                  {/* Variante 1: Mit Text */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2 text-[var(--secondary)]">Variante 1: Mit Text</h5>
                    <div className="flex flex-wrap gap-4">
                      <PriorityIcon priority="low" showText={true} />
                      <PriorityIcon priority="medium" showText={true} />
                      <PriorityIcon priority="high" showText={true} />
                    </div>
                  </div>
                  
                  {/* Variante 2: Nur Icon mit Tooltip (für Tabellen) */}
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-[var(--secondary)]">Variante 2: Nur Icon mit Tooltip (Tabellen)</h5>
                    <div className="flex flex-wrap gap-4">
                      <PriorityIcon priority="low" className="scale-125" />
                      <PriorityIcon priority="medium" className="scale-125" />
                      <PriorityIcon priority="high" className="scale-125" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* DataTable Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">
            DataTable
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>TanStack Table Integration</CardTitle>
              <CardDescription>Sortierung, Filterung, Pagination, Spalten-Konfiguration</CardDescription>
            </CardHeader>
            <CardContent>
              
              {/* DataTable Demo Component */}
              <DataTableDemo />
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center text-[var(--muted)] py-8">
          <p>CASCADE Design-System v2.0 • Alle Komponenten zentral definiert</p>
        </footer>
      </div>
    </div>
  )
}
