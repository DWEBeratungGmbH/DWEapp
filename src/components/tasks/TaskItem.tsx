// Einzelne Aufgabe - CASCADE konform (< 200 Zeilen)

'use client'

import { ChevronDown, ChevronRight, Package, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import type { WeClappTask } from '@/types'

interface TaskItemProps {
  task: WeClappTask
  order: any
  users: Record<string, any>
  level: number
  isExpanded?: boolean
  hasChildren?: boolean
  onToggle?: () => void
}

export function TaskItem({ task, order, users, level, isExpanded, hasChildren, onToggle }: TaskItemProps) {
  const getBorderColor = () => {
    if (level === 0) return 'border-l-4 border-[var(--info)]'
    if (level === 1) return 'border-l-4 border-[var(--accent)]'
    return 'border-l-2 border-[var(--border)]'
  }

  const getBackground = () => {
    if (level === 0 && isExpanded) return 'bg-[var(--bg-secondary)]'
    if (level === 2) return 'bg-[var(--bg-tertiary)]'
    return 'bg-[var(--bg-primary)]'
  }

  const getIcon = () => {
    if (level === 0) return <Package className="h-5 w-5 text-[var(--info)]" />
    return <FileText className="h-4 w-4 text-[var(--accent)]" />
  }

  const formatAddress = (order: any) => {
    if (!order?.shippingAddress) return ''
    return order.shippingAddress.split(',')[0]
  }

  const getAssigneeName = (assigneeId: any) => {
    const user = users[assigneeId.userId || assigneeId]
    return user?.fullName || user?.firstName || 'Unbekannt'
  }

  return (
    <div 
      className={`${getBorderColor()} ${getBackground()} rounded-r-lg p-4 hover:shadow-md transition-all`}
      onClick={hasChildren ? onToggle : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {hasChildren && (
            <div className="w-5 h-5 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-[var(--muted)]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
              )}
            </div>
          )}
          
          {getIcon()}
          
          <div className="flex-1">
            <h3 className={`font-medium ${level === 0 ? 'text-lg' : 'text-base'}`}>
              {task.subject || 'Ohne Titel'}
            </h3>
            
            {level === 0 && order && (
              <div className="flex items-center gap-4 text-sm text-[var(--secondary)] mt-1">
                <span className="font-medium">{order.customerDisplayName}</span>
                {order.customerCompanyName && order.customerFirstName && (
                  <span className="text-[var(--muted)]">({order.customerCompanyName})</span>
                )}
                {order.shippingAddress && (
                  <span>📍 {formatAddress(order)}</span>
                )}
                {order.totalAmount && (
                  <span>€{Number(order.totalAmount).toFixed(2)}</span>
                )}
              </div>
            )}
            
            {task.identifier && (
              <div className="text-sm text-[var(--muted)]">{task.identifier}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {task.taskStatus && <StatusBadge status={task.taskStatus as any} />}
          {task.taskPriority && <PriorityBadge priority={task.taskPriority as any} />}
          
          {task.dateTo && (
            <div className="text-sm px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--secondary)]">
              📅 {new Date(task.dateTo).toLocaleDateString('de-DE')}
            </div>
          )}

          {task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-[var(--muted)]">
              👤 {task.assignees.map(getAssigneeName).join(', ')}
            </div>
          )}

          {level === 0 && (
            <Badge variant="outline" className="bg-[var(--bg-primary)]">
              {hasChildren ? '📁' : '📄'} Aufgabe
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
