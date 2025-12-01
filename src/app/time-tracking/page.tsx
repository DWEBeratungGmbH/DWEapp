'use client'

import { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Clock, 
  Calendar,
  RefreshCw,
  Loader2,
  FileText,
  Building2
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
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMyTimeEntries, formatDuration } from '@/hooks/useMyTimeEntries'
import type { WeClappTimeEntry } from '@/types'

// Datum formatieren
function formatDate(date?: Date | string): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Uhrzeit formatieren
function formatTime(date?: Date | string): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function TimeTrackingPage() {
  const { data: session } = useSession()
  const { 
    entries, 
    stats, 
    loading, 
    error, 
    filters, 
    setFilters, 
    pagination,
    refetch,
    nextPage,
    prevPage
  } = useMyTimeEntries()

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // TanStack Table Columns
  const columns = useMemo<ColumnDef<WeClappTimeEntry>[]>(() => [
    {
      accessorKey: 'startDate',
      header: 'Datum',
      cell: ({ row }) => {
        const entry = row.original
        return (
          <div>
            <div className="font-medium">{formatDate(entry.startDate)}</div>
            <div className="text-xs text-muted">{formatTime(entry.startDate)}</div>
          </div>
        )
      }
    },
    {
      accessorKey: 'task',
      header: 'Aufgabe',
      cell: ({ row }) => {
        const task = row.original.task
        return task ? (
          <div>
            <div className="font-medium truncate max-w-[250px]">{task.subject}</div>
            {task.identifier && (
              <div className="text-xs text-muted">{task.identifier}</div>
            )}
          </div>
        ) : (
          <span className="text-muted">-</span>
        )
      }
    },
    {
      accessorKey: 'customer',
      header: 'Kunde',
      cell: ({ row }) => {
        const customer = row.original.customer
        return customer ? (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted" />
            <span className="truncate max-w-[150px]">
              {customer.company || `${customer.firstName} ${customer.lastName}`}
            </span>
          </div>
        ) : (
          <span className="text-muted">-</span>
        )
      }
    },
    {
      accessorKey: 'description',
      header: 'Beschreibung',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-secondary">
          {row.original.description || '-'}
        </div>
      )
    },
    {
      accessorKey: 'durationSeconds',
      header: 'Dauer',
      cell: ({ row }) => (
        <div className="font-medium text-accent">
          {formatDuration(row.original.durationSeconds || 0)}
        </div>
      )
    },
    {
      accessorKey: 'salesOrder',
      header: 'Auftrag',
      cell: ({ row }) => {
        const order = row.original.salesOrder
        return order ? (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted" />
            <span>#{order.orderNumber}</span>
          </div>
        ) : (
          <span className="text-muted">-</span>
        )
      }
    }
  ], [])

  const table = useReactTable({
    data: entries,
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
            <h1 className="text-2xl font-bold">Meine Zeitbuchungen</h1>
            <p className="text-secondary">
              {session?.user?.weClappUserId 
                ? `${stats.total} Einträge`
                : 'Kein WeClapp-Benutzer verknüpft'}
            </p>
          </div>
          <Button onClick={refetch} disabled={loading} variant="secondary">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatDuration(stats.todaySeconds)}</div>
                  <div className="text-sm text-secondary">Heute</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/20">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatDuration(stats.weekSeconds)}</div>
                  <div className="text-sm text-secondary">Diese Woche</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Calendar className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatDuration(stats.monthSeconds)}</div>
                  <div className="text-sm text-secondary">Dieser Monat</div>
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
                  placeholder="Zeitbuchungen durchsuchen..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                  placeholder="Von"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                  placeholder="Bis"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Zeitbuchungen</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-error">{error}</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Zeitbuchungen gefunden</p>
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
                        <tr key={row.id} className="border-b hover:bg-bg-tertiary transition-colors">
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
                    Seite {pagination.page} von {pagination.pages} ({pagination.total} Einträge)
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
