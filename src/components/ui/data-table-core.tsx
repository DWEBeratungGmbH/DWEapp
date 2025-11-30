// DataTable Core - CASCADE-konform: <200 Zeilen

'use client'

import { useState } from 'react'
import { flexRender, type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp, ChevronsUpDown, Filter } from 'lucide-react'

// ===== TYPES =====
interface ColumnFilterOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface FilterableColumn {
  id: string
  options: ColumnFilterOption[]
}

// ===== SORTING ICON =====
export const SortIcon = ({ direction }: { direction: 'asc' | 'desc' | false }) => {
  if (direction === 'asc') return <ChevronUp className="h-4 w-4" />
  if (direction === 'desc') return <ChevronDown className="h-4 w-4" />
  return <ChevronsUpDown className="h-4 w-4" />
}

// ===== COLUMN FILTER DROPDOWN =====
export function ColumnFilterDropdown({
  column,
  filterOptions,
}: {
  column: any
  filterOptions: ColumnFilterOption[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const currentValue = column.getFilterValue() as string | undefined

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className={cn(
          "h-6 w-6 p-0",
          currentValue && "text-[var(--accent)]"
        )}
      >
        <Filter className="h-3 w-3" />
      </Button>

      {isOpen && (
        <Card className="absolute left-0 top-full mt-1 z-50 min-w-[150px] shadow-lg">
          <CardContent className="p-2">
            <div className="space-y-1">
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-[var(--bg-tertiary)] transition-colors text-left",
                  !currentValue && "bg-[var(--accent-muted)] text-[var(--accent)]"
                )}
                onClick={() => {
                  column.setFilterValue(undefined)
                  setIsOpen(false)
                }}
              >
                Alle
              </button>
              
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-[var(--bg-tertiary)] transition-colors text-left",
                    currentValue === option.value && "bg-[var(--accent-muted)] text-[var(--accent)]"
                  )}
                  onClick={() => {
                    column.setFilterValue(option.value)
                    setIsOpen(false)
                  }}
                >
                  {option.icon && <span className="w-4 h-4">{option.icon}</span>}
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ===== TABLE COMPONENT =====
interface DataTableTableProps<TData, TValue> {
  table: any
  columns: ColumnDef<TData, TValue>[]
  filterableColumns?: FilterableColumn[]
}

export function DataTableTable<TData, TValue>({
  table,
  columns,
  filterableColumns = [],
}: DataTableTableProps<TData, TValue>) {
  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <table className="w-full">
        {/* Header */}
        <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border)]">
          {table.getHeaderGroups().map((headerGroup: any) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => {
                const filterConfig = filterableColumns.find(fc => fc.id === header.column.id)
                
                return (
                  <th
                    key={header.id}
                    className={cn(
                      "h-12 px-4 text-left align-middle font-medium text-[var(--secondary)]",
                      header.column.getCanSort() && "cursor-pointer hover:bg-[var(--accent-muted)] transition-colors"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="flex items-center gap-2 flex-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <SortIcon direction={header.column.getIsSorted() as 'asc' | 'desc' | false} />
                        )}
                      </div>
                      {filterConfig && (
                        <ColumnFilterDropdown
                          column={header.column}
                          filterOptions={filterConfig.options}
                        />
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        {/* Body */}
        <tbody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: any) => (
              <tr
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                {row.getVisibleCells().map((cell: any) => (
                  <td key={cell.id} className="p-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                <p className="text-[var(--muted)]">Keine Daten gefunden</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
