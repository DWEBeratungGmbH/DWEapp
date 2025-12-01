'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { 
  CheckSquare, 
  Clock, 
  AlertCircle,
  Calendar,
  RefreshCw,
  Loader2,
  ChevronRight,
  FileText,
  Building2,
  X
} from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMyTasks } from '@/hooks/useMyTasks'
import type { Task } from '@/types'

// Status-Badge Komponente
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    'NOT_STARTED': { label: 'Offen', className: 'bg-bg-tertiary text-secondary' },
    'IN_PROGRESS': { label: 'In Arbeit', className: 'bg-info text-white' },
    'COMPLETED': { label: 'Erledigt', className: 'bg-accent text-black' },
    'DEFERRED': { label: 'Zurückgestellt', className: 'bg-warning text-white' },
    'WAITING_ON_OTHERS': { label: 'Wartend', className: 'bg-warning text-white' },
  }
  const { label, className } = config[status] || { label: status, className: 'bg-muted' }
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

// Prioritäts-Badge Komponente
function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string }> = {
    'HIGH': { label: 'Hoch', className: 'text-error' },
    'MEDIUM': { label: 'Mittel', className: 'text-warning' },
    'LOW': { label: 'Niedrig', className: 'text-muted' },
  }
  const { label, className } = config[priority] || { label: priority, className: '' }
  
  return <span className={`text-sm font-medium ${className}`}>{label}</span>
}

// Datum formatieren
function formatDate(timestamp?: number): string {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Prüfen ob überfällig
function isOverdue(dateTo?: number): boolean {
  if (!dateTo) return false
  return dateTo < Date.now()
}

export default function MyTasksPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { 
    tasks, 
    stats, 
    loading, 
    error, 
    filters, 
    setFilters,
    showAll,
    setShowAll,
    pagination,
    refetch,
    nextPage,
    prevPage
  } = useMyTasks()

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  // Click-Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false)
      }
    }

    if (showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showStatusDropdown])

  const statusOptions = [
    { value: 'NOT_STARTED', label: 'Offen', color: 'bg-bg-tertiary' },
    { value: 'IN_PROGRESS', label: 'In Arbeit', color: 'bg-info' },
    { value: 'COMPLETED', label: 'Erledigt', color: 'bg-accent' },
    { value: 'DEFERRED', label: 'Zurückgestellt', color: 'bg-warning' },
    { value: 'WAITING_ON_OTHERS', label: 'Wartend', color: 'bg-warning' },
  ]

  const toggleStatus = (statusValue: string) => {
    const currentStatus = filters.status || []
    if (currentStatus.includes(statusValue)) {
      setFilters({ 
        ...filters, 
        status: currentStatus.filter(s => s !== statusValue) 
      })
    } else {
      setFilters({ 
        ...filters, 
        status: [...currentStatus, statusValue] 
      })
    }
  }

  // TanStack Table Columns
  const columns = useMemo<ColumnDef<Task>[]>(() => [
    {
      accessorKey: 'subject',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Aufgabe
          {column.getIsSorted() === 'asc' ? ' ↑' : column.getIsSorted() === 'desc' ? ' ↓' : ''}
        </button>
      ),
      cell: ({ row }) => {
        const task = row.original
        const overdue = isOverdue(task.dateTo) && task.taskStatus !== 'COMPLETED'
        return (
          <div className="flex items-start gap-3">
            <CheckSquare className={`h-5 w-5 mt-0.5 flex-shrink-0`} style={{ 
              color: task.taskStatus === 'COMPLETED' ? '#A6FF00' : 'var(--muted)' 
            }} />
            <div className="min-w-0">
              <div className="font-medium">{task.subject}</div>
              {task.identifier && (
                <div className="text-xs text-muted">{task.identifier}</div>
              )}
              {task.customer && (
                <div className="text-xs text-secondary">
                  {task.customer.company || `${task.customer.firstName} ${task.customer.lastName}`}
                </div>
              )}
              {overdue && (
                <div className="text-xs text-error flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Überfällig
                </div>
              )}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'taskStatus',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          {column.getIsSorted() === 'asc' ? ' ↑' : column.getIsSorted() === 'desc' ? ' ↓' : ''}
        </button>
      ),
      cell: ({ row }) => <StatusBadge status={row.original.taskStatus} />
    },
    {
      accessorKey: 'taskPriority',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Priorität
          {column.getIsSorted() === 'asc' ? ' ↑' : column.getIsSorted() === 'desc' ? ' ↓' : ''}
        </button>
      ),
      cell: ({ row }) => <PriorityBadge priority={row.original.taskPriority} />
    },
    {
      accessorKey: 'dateTo',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-primary"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fällig am
          {column.getIsSorted() === 'asc' ? ' ↑' : column.getIsSorted() === 'desc' ? ' ↓' : ''}
        </button>
      ),
      cell: ({ row }) => {
        const dateTo = row.original.dateTo
        const overdue = isOverdue(dateTo) && row.original.taskStatus !== 'COMPLETED'
        return (
          <span className={overdue ? 'text-error font-medium' : 'text-secondary'}>
            {formatDate(dateTo)}
          </span>
        )
      }
    },
    {
      accessorKey: 'plannedEffort',
      header: 'Geplant',
      cell: ({ row }) => {
        const minutes = row.original.plannedEffort || 0
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return (
          <span className="text-secondary">
            {minutes > 0 ? `${hours}h ${mins}m` : '-'}
          </span>
        )
      }
    },
    {
      accessorKey: 'order',
      header: 'Auftrag',
      cell: ({ row }) => {
        const order = row.original.order
        const customer = row.original.customer
        return order || customer ? (
          <div className="flex items-center gap-2">
            {order && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4 text-muted" />
                <span className="text-sm">#{order.orderNumber}</span>
              </div>
            )}
            {customer && (
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4 text-muted" />
                <span className="text-sm truncate max-w-[150px]">
                  {customer.company || `${customer.firstName} ${customer.lastName}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted">-</span>
        )
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link 
            href={`/tasks/${row.original.id}`}
            className="p-1.5 rounded hover:bg-bg-tertiary transition-colors"
            title="Details anzeigen"
          >
            <ChevronRight className="h-5 w-5" style={{ color: '#A6FF00' }} />
          </Link>
        </div>
      )
    }
  ], [])

  const table = useReactTable({
    data: tasks,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meine Aufgaben</h1>
            <p className="text-secondary">
              {session?.user?.weClappUserId 
                ? `${stats.total} ${showAll ? 'Aufgaben gesamt' : 'Aufgaben zugewiesen'}`
                : 'Kein WeClapp-Benutzer verknüpft'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Toggle Mir zugewiesen / Alle */}
            <div className="flex items-center gap-2 bg-bg-tertiary rounded-lg p-1">
              <button
                onClick={() => setShowAll(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !showAll ? 'bg-accent text-black' : 'text-secondary hover:text-primary'
                }`}
              >
                Mir zugewiesen
              </button>
              <button
                onClick={() => setShowAll(true)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  showAll ? 'bg-accent text-black' : 'text-secondary hover:text-primary'
                }`}
              >
                Alle
              </button>
            </div>
            <Button onClick={refetch} disabled={loading} variant="secondary">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(39, 138, 148, 0.3)' }}>
                  <CheckSquare className="h-5 w-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.open}</div>
                  <div className="text-sm text-secondary">Offen</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(208, 96, 64, 0.3)' }}>
                  <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.dueToday}</div>
                  <div className="text-sm text-secondary">Heute fällig</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(166, 255, 0, 0.25)' }}>
                  <Calendar className="h-5 w-5" style={{ color: '#A6FF00' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.dueThisWeek}</div>
                  <div className="text-sm text-secondary">Diese Woche</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(166, 255, 0, 0.25)' }}>
                  <CheckSquare className="h-5 w-5" style={{ color: '#A6FF00' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm text-secondary">Erledigt</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Aufgaben durchsuchen..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              
              {/* Multi-Select Status Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <Button
                  variant="outline"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-[200px] justify-between"
                >
                  <span>Status ({filters.status?.length || 0})</span>
                  <X className={`h-4 w-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </Button>
                
                {showStatusDropdown && (
                  <div className="absolute top-full mt-1 w-[200px] bg-card border rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      {statusOptions.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 p-2 hover:bg-bg-tertiary rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.status?.includes(option.value) || false}
                            onChange={() => toggleStatus(option.value)}
                            className="rounded"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div className={`w-3 h-3 rounded ${option.color}`} />
                            <span className="text-sm">{option.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Select 
                value={filters.priority || 'all'} 
                onValueChange={(v) => setFilters({ ...filters, priority: v === 'all' ? undefined : v })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Prioritäten</SelectItem>
                  <SelectItem value="HIGH">Hoch</SelectItem>
                  <SelectItem value="MEDIUM">Mittel</SelectItem>
                  <SelectItem value="LOW">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Task Table */}
        <Card>
          <CardHeader>
            <CardTitle>Aufgabenliste</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-error">{error}</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Aufgaben gefunden</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-bg-tertiary">
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th 
                              key={header.id}
                              className="px-4 py-3 text-left text-sm font-medium text-secondary"
                            >
                              {header.isPlaceholder ? null : (
                                <div
                                  className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                                  onClick={header.column.getToggleSortingHandler()}
                                >
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map(row => (
                        <tr 
                          key={row.id} 
                          className="border-b hover:bg-bg-tertiary transition-colors cursor-pointer"
                          onClick={() => router.push(`/tasks/${row.original.id}`)}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-4 py-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-secondary">
                    Seite {pagination.page} von {pagination.pages} ({pagination.total} Aufgaben)
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={prevPage}
                      disabled={pagination.page <= 1}
                    >
                      Zurück
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={nextPage}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Weiter
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
