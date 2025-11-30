// DataTable Toolbar - CASCADE-konform: <200 Zeilen

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Eye, EyeOff, Settings } from 'lucide-react'

// ===== COLUMN VISIBILITY =====
interface DataTableColumnVisibilityProps {
  table: any
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
}

export function DataTableColumnVisibility({ 
  table, 
  columnVisibility, 
  onColumnVisibilityChange 
}: DataTableColumnVisibilityProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const toggleColumn = (columnId: string, isVisible: boolean) => {
    const newVisibility = { ...columnVisibility, [columnId]: !isVisible }
    onColumnVisibilityChange?.(newVisibility)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Spalten
      </Button>
      
      {isOpen && (
        <Card className="absolute right-0 top-full mt-1 z-50 min-w-[200px] shadow-lg">
          <CardContent className="p-3">
            <div className="space-y-2">
              {table.getAllColumns().map((column: any) => {
                if (column.id === 'actions') return null
                
                const isVisible = columnVisibility?.[column.id] !== false
                
                return (
                  <div key={column.id} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--primary)]">
                      {column.columnDef.header || column.id}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleColumn(column.id, isVisible)}
                      className="h-6 w-6 p-0"
                    >
                      {isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ===== HEADER / TOOLBAR =====
interface DataTableHeaderProps {
  table: any
  searchPlaceholder?: string
  columnVisibility?: Record<string, boolean>
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void
  globalFilter: string
  setGlobalFilter: (value: string) => void
}

export function DataTableHeader({
  table,
  searchPlaceholder,
  columnVisibility,
  onColumnVisibilityChange,
  globalFilter,
  setGlobalFilter,
}: DataTableHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4 px-4">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
        <Input
          placeholder={searchPlaceholder || 'Suchen...'}
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="pl-10"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <DataTableColumnVisibility
          table={table}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
        
        {/* Pagination Info */}
        <div className="text-sm text-[var(--muted)]">
          {table.getFilteredSelectedRowModel().rows.length > 0 ? (
            <span>{table.getFilteredSelectedRowModel().rows.length} ausgewählt</span>
          ) : (
            <span>{table.getFilteredRowModel().rows.length} Einträge</span>
          )}
        </div>
      </div>
    </div>
  )
}
