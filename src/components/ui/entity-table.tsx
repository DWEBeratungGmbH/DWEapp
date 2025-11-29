'use client'

import { ReactNode } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoleBadge } from '@/components/ui/role-badge'
import { Icon } from '@/components/ui/icon'

interface TableColumn {
  key: string
  label: string
  render?: (value: any, row: any) => ReactNode
  className?: string
}

interface EntityTableProps<T> {
  data: T[]
  columns: TableColumn[]
  title?: string
  titleIcon?: ReactNode
  actions?: {
    edit?: (item: T) => void
    delete?: (item: T) => void
    custom?: (item: T) => ReactNode
  }
  emptyMessage?: string
  loading?: boolean
  className?: string
  footerActions?: ReactNode
}

export function EntityTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  titleIcon,
  actions,
  emptyMessage = 'Keine Daten gefunden',
  loading = false,
  className = '',
  footerActions
}: EntityTableProps<T>) {
  return (
    <Card className={className}>
      {(title || titleIcon) && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {titleIcon}
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2">Laden...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center p-8" style={{ color: 'var(--muted)' }}>
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((column, index) => (
                    <th
                      key={column.key}
                      className={`h-12 px-4 ${index === 0 ? 'text-left w-43' : 'text-center'} align-middle font-medium ${column.className || ''}`}
                    >
                      {column.label}
                    </th>
                  ))}
                  {actions && (
                    <th className="h-12 px-4 text-center align-middle font-medium">
                      Aktionen
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    {columns.map((column, index) => (
                      <td key={column.key} className={`p-4 ${index === 0 ? 'text-left w-43' : 'text-center'} ${column.className || ''}`}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="p-4 text-center w-auto">
                        <div className="flex items-center justify-center gap-2">
                          {actions.edit && (
                            <button
                              onClick={() => actions.edit!(row)}
                              className="p-2 hover:bg-muted rounded"
                            >
                              <Icon icon={Edit} size="md" />
                            </button>
                          )}
                          {actions.delete && (
                            <button
                              onClick={() => actions.delete!(row)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Icon icon={Trash2} size="md" />
                            </button>
                          )}
                          {actions.custom && actions.custom(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {footerActions && (
        <div className="border-t p-4">
          {footerActions}
        </div>
      )}
    </Card>
  )
}
