// Task-Spalten Definition
// CASCADE-konforme Spalten für TaskDataTable

'use client'

import { Eye, Edit, Trash2, Package, User, Calendar, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { TaskStatusIcon, PriorityIcon } from '@/components/ui/status'

// Status Mapping (lokal, nicht importiert)
const mapWeClappStatus = (status: string) => {
  const statusMap: Record<string, 'todo' | 'in-progress' | 'done' | 'blocked' | 'paused'> = {
    'NOT_STARTED': 'todo',
    'IN_PROGRESS': 'in-progress',
    'COMPLETED': 'done',
    'DEFERRED': 'blocked',
    'WAITING_ON_OTHERS': 'paused',
  }
  return statusMap[status] || 'todo'
}

const mapWeClappPriority = (priority: string) => {
  const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
    'LOW': 'low',
    'MEDIUM': 'medium',
    'HIGH': 'high',
  }
  return priorityMap[priority] || 'medium'
}

export interface TaskColumnProps {
  onTaskClick?: (task: any) => void
  onTaskEdit?: (task: any) => void
  onTaskDelete?: (task: any) => void
  orders: Record<string, any>
}

export function createTaskColumns({ onTaskClick, onTaskEdit, onTaskDelete, orders }: TaskColumnProps) {
  return [
    {
      accessorKey: 'subject',
      header: 'Aufgabe',
      cell: ({ row }: { row: any }) => {
        const task = row.original
        const isGrouped = row.getIsGrouped()
        
        if (isGrouped) {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => row.toggleExpanded()}
              className="flex items-center gap-2"
            >
              {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="font-medium">{row.getValue('subject')}</span>
              <span className="text-xs text-[var(--muted)]">({row.subRows.length})</span>
            </Button>
          )
        }
        
        return (
          <div 
            className="flex items-center gap-2 cursor-pointer hover:text-[var(--accent)]"
            onClick={() => onTaskClick?.(task)}
          >
            <Package className="h-4 w-4 text-[var(--info)]" />
            <span className="font-medium truncate max-w-[300px]">
              {task.subject || 'Ohne Titel'}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'taskStatus',
      header: 'Status',
      cell: ({ row, getValue }: { row: any; getValue: any }) => {
        const value = getValue() as string
        if (row.getIsGrouped()) {
          return <span className="font-medium">{value}</span>
        }
        return <TaskStatusIcon status={mapWeClappStatus(value)} />
      },
    },
    {
      accessorKey: 'taskPriority',
      header: 'Priorität',
      cell: ({ row, getValue }: { row: any; getValue: any }) => {
        const value = getValue() as string
        if (row.getIsGrouped()) {
          return <span className="font-medium">{value}</span>
        }
        return <PriorityIcon priority={mapWeClappPriority(value)} />
      },
    },
    {
      accessorKey: 'assigneeName',
      header: 'Zuständig',
      cell: ({ row, getValue }: { row: any; getValue: any }) => {
        if (row.getIsGrouped()) {
          return <span className="font-medium">{getValue() as string}</span>
        }
        const name = getValue() as string
        return (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4 text-[var(--muted)]" />
            <span className="text-sm truncate max-w-[100px]">{name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'orderNumber',
      header: 'Auftrag / Kunde',
      cell: ({ row, getValue }: { row: any; getValue: any }) => {
        if (row.getIsGrouped()) {
          return <span className="font-medium">{getValue() as string}</span>
        }
        const orderNum = getValue() as string
        const customerName = row.original.customerName
        
        if (orderNum === 'Ohne Auftrag') {
          return <span className="text-[var(--muted)]">-</span>
        }
        
        return (
          <div className="flex flex-col">
            <span className="text-sm font-mono">{orderNum}</span>
            {customerName && (
              <span className="text-xs text-[var(--muted)] truncate max-w-[150px]">{customerName}</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'dateTo',
      header: 'Fällig',
      cell: ({ row, getValue }: { row: any; getValue: any }) => {
        if (row.getIsGrouped()) return null
        const dateTo = getValue() as string | number
        if (!dateTo) return <span className="text-[var(--muted)]">-</span>
        
        const date = typeof dateTo === 'number' ? new Date(dateTo) : new Date(dateTo)
        const isOverdue = date < new Date() && row.original.taskStatus !== 'COMPLETED'
        
        return (
          <div className={`flex items-center gap-1 ${isOverdue && "text-[var(--error)]"}`}>
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aktionen',
      cell: ({ row }: { row: any }) => {
        if (row.getIsGrouped()) return null
        const task = row.original
        return (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => onTaskClick?.(task)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onTaskEdit?.(task)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onTaskDelete?.(task)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}
