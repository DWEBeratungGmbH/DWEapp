// Data Table Komponente - CASCADE konform refactored
// Haupt-Export, Subkomponenten in separate Dateien ausgelagert

'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip } from '@/components/ui/tooltip'

// Ausgelagerte Subkomponenten
import { DataTableHeader } from './data-table-toolbar'
import { DataTableTable, type FilterableColumn } from './data-table-core'
import { DataTablePagination } from './data-table-pagination'

// ===== TYPES =====
interface ColumnFilterOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  emptyMessage?: string
  filterableColumns?: FilterableColumn[]
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
  onColumnsChange?: (columns: ColumnDef<TData, TValue>[]) => void
}

// ===== STATUS ICON COMPONENT (mit Tooltip) =====
interface StatusIconProps {
  icon: React.ReactNode
  tooltip: string
  color?: string
}

export const StatusIcon = ({ icon, tooltip, color }: StatusIconProps) => (
  <Tooltip content={tooltip}>
    <div className={cn("flex items-center justify-center", color)}>
      {icon}
    </div>
  </Tooltip>
)

// ===== MAIN DATA TABLE COMPONENT =====
export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  emptyMessage = 'Keine Daten gefunden',
  filterableColumns = [],
  columnVisibility = {},
  onColumnVisibilityChange,
  onColumnsChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [columnVisibilityState, setColumnVisibilityState] = useState<VisibilityState>(columnVisibility)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibilityState,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility: columnVisibilityState,
    },
  })

  return (
    <Card>
      <CardContent className="p-0">
        <DataTableHeader 
          table={table} 
          searchPlaceholder={searchPlaceholder}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <DataTableTable 
          table={table} 
          columns={columns} 
          filterableColumns={filterableColumns}
        />
        <DataTablePagination table={table} />
      </CardContent>
    </Card>
  )
}

// ===== EXPORTS =====
export type { ColumnDef, DataTableProps, FilterableColumn, ColumnFilterOption, StatusIconProps }
