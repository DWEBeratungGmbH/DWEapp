// Aufgabe-Tabelle mit Sortierung und Filterung

'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronUp, 
  ChevronDown, 
  ArrowUpDown, 
  Package, 
  Building, 
  Calendar,
  User,
  Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import type { Order } from '@/types'
import type { WeClappTask } from '@/types'

interface TaskTableProps {
  tasks: WeClappTask[]
  orders: Record<string, Order>
  loading: boolean
  error: string | null
}

type SortField = 'subject' | 'status' | 'priority' | 'dateTo' | 'orderNumber' | 'customer'
type SortDirection = 'asc' | 'desc'

export function TaskTable({ tasks, orders, loading, error }: TaskTableProps) {
  const [sortField, setSortField] = useState<SortField>('dateTo')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    customer: ''
  })

  // Sortierung
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Gefilterte und sortierte Aufgaben
  const processedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      if (filters.status && task.taskStatus !== filters.status) return false
      if (filters.priority && task.taskPriority !== filters.priority) return false
      if (filters.customer) {
        const order = orders[task.orderItemId || '']
        if (!order?.customerName?.toLowerCase().includes(filters.customer.toLowerCase())) return false
      }
      return true
    })

    return filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'subject':
          aValue = a.subject?.toLowerCase() || ''
          bValue = b.subject?.toLowerCase() || ''
          break
        case 'status':
          aValue = a.taskStatus
          bValue = b.taskStatus
          break
        case 'priority':
          const priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
          aValue = priorityOrder[a.taskPriority || '']
          bValue = priorityOrder[b.taskPriority || '']
          break
        case 'dateTo':
          aValue = a.dateTo ? new Date(a.dateTo).getTime() : 0
          bValue = b.dateTo ? new Date(b.dateTo).getTime() : 0
          break
        case 'orderNumber':
          aValue = orders[a.orderItemId || '']?.orderNumber || ''
          bValue = orders[b.orderItemId || '']?.orderNumber || ''
          break
        case 'customer':
          aValue = orders[a.orderItemId || '']?.customerName || ''
          bValue = orders[b.orderItemId || '']?.customerName || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [tasks, orders, filters, sortField, sortDirection])

  // Gruppiert nach Auftrag
  const groupedTasks = useMemo(() => {
    const groups: Record<string, { order: Order; tasks: WeClappTask[] }> = {}
    
    processedTasks.forEach(task => {
      const orderId = task.orderItemId || 'no-order'
      
      if (!groups[orderId]) {
        groups[orderId] = {
          order: orders[orderId] || {
            id: 'no-order',
            orderNumber: 'Ohne Auftrag',
            customerName: 'Nicht zugewiesen',
            status: 'OPEN',
            createdDate: new Date()
          },
          tasks: []
        }
      }
      
      groups[orderId].tasks.push(task)
    })

    return groups
  }, [processedTasks, orders])

  if (loading) {
    return <div>Lade Aufgaben...</div>
  }

  if (error) {
    return <div style={{ color: 'var(--error)' }}>Fehler: {error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-4 p-4 border border-[var(--border)] rounded-lg">
        <select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 border border-[var(--border)] rounded"
        >
          <option value="">Alle Status</option>
          <option value="NOT_STARTED">Offen</option>
          <option value="IN_PROGRESS">In Bearbeitung</option>
          <option value="COMPLETED">Abgeschlossen</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
          className="px-3 py-2 border border-[var(--border)] rounded"
        >
          <option value="">Alle Prioritäten</option>
          <option value="HIGH">Hoch</option>
          <option value="MEDIUM">Mittel</option>
          <option value="LOW">Niedrig</option>
        </select>

        <input
          type="text"
          placeholder="Kunde filtern..."
          value={filters.customer}
          onChange={(e) => setFilters(f => ({ ...f, customer: e.target.value }))}
          className="px-3 py-2 border border-[var(--border)] rounded"
        />
      </div>

      {/* Gruppierte Aufgaben */}
      {Object.entries(groupedTasks).map(([orderId, { order, tasks }]) => (
        <div key={orderId} className="border border-[var(--border)] rounded-lg overflow-hidden">
          {/* Auftrag-Header */}
          <div className="bg-[var(--bg-tertiary)] p-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" style={{ color: 'var(--info)' }} />
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <Building className="h-4 w-4" />
                  <span>{order.customerName}</span>
                </div>
                {order.customerAddress && (
                  <div className="text-sm text-muted">{order.customerAddress}</div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{tasks.length} Aufgaben</Badge>
                <a 
                  href={`/orders/${orderId}`}
                  className="text-sm text-[var(--info)] hover:underline"
                >
                  Details →
                </a>
              </div>
            </div>
          </div>

          {/* Aufgaben-Tabelle */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-tertiary)]">
                <tr>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-[var(--bg-primary)]"
                    onClick={() => handleSort('subject')}
                  >
                    <div className="flex items-center gap-1">
                      Aufgabe
                      {sortField === 'subject' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-[var(--bg-primary)]"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-[var(--bg-primary)]"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-1">
                      Priorität
                      {sortField === 'priority' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left cursor-pointer hover:bg-[var(--bg-primary)]"
                    onClick={() => handleSort('dateTo')}
                  >
                    <div className="flex items-center gap-1">
                      Fällig
                      {sortField === 'dateTo' && (
                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">Zugewiesen an</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-t border-[var(--border)] hover:bg-[var(--bg-tertiary)]">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{task.subject}</div>
                        {task.identifier && (
                          <div className="text-sm text-muted">{task.identifier}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={task.taskStatus as any} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.taskPriority as any} />
                    </td>
                    <td className="px-4 py-3">
                      {task.dateTo ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.dateTo).toLocaleDateString('de-DE')}
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {task.assignees.map((a: any) => a.fullName || a.firstName || a.userId).join(', ')}
                        </div>
                      ) : (
                        <span className="text-muted">Nicht zugewiesen</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
