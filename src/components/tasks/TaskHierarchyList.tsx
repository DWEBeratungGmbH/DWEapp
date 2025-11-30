// Hierarchische Aufgabenliste mit Aufträgen

'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  Package, 
  Building, 
  Calendar,
  User,
  Clock,
  FileText
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import type { WeClappTask } from '@/types'

interface TaskHierarchyListProps {
  tasks: WeClappTask[]
  orders: Record<string, any>
  users: Record<string, any>
  loading: boolean
  error: string | null
}

interface FlatTaskItem {
  id: string
  type: 'order' | 'main-task' | 'sub-task'
  level: number
  taskId?: string
  orderId?: string
  title: string
  subtitle?: string
  status?: string
  priority?: string
  dateTo?: string
  assignees?: any[]
  hasChildren: boolean
  children: FlatTaskItem[]
  isExpanded?: boolean
}

export function TaskHierarchyList({ tasks, orders, users, loading, error }: TaskHierarchyListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    customer: '',
    search: ''
  })

  // Tasks in flache Hierarchie umwandeln
  const flatHierarchy = useMemo(() => {
    const items: FlatTaskItem[] = []
    
    // Aufgaben nach Auftrag gruppieren
    const tasksByOrder = new Map<string, WeClappTask[]>()
    
    tasks.forEach(task => {
      const orderId = task.orderItemId || 'no-order'
      if (!tasksByOrder.has(orderId)) {
        tasksByOrder.set(orderId, [])
      }
      tasksByOrder.get(orderId)!.push(task)
    })

    // Für jeden Auftrag die Hierarchie bauen
    tasksByOrder.forEach((orderTasks, orderId) => {
      const order = orders[orderId]
      
      // Auftrag-Header
      const orderItem: FlatTaskItem = {
        id: `order-${orderId}`,
        type: 'order',
        level: 0,
        orderId,
        title: order?.orderNumber || 'Ohne Auftrag',
        subtitle: `${order?.customerName || 'Nicht zugewiesen'}${order?.shippingAddress ? ` • ${order.shippingAddress}` : ''}`,
        hasChildren: orderTasks.length > 0,
        children: [],
        isExpanded: expandedItems.has(`order-${orderId}`)
      }
      items.push(orderItem)

      // Hauptaufgaben (keine parentTaskId)
      const mainTasks = orderTasks.filter(task => !task.parentTaskId)
      
      mainTasks.forEach(mainTask => {
        const mainItem: FlatTaskItem = {
          id: `task-${mainTask.id}`,
          type: 'main-task',
          level: 1,
          taskId: mainTask.id,
          orderId,
          title: mainTask.subject || 'Ohne Titel',
          subtitle: mainTask.identifier,
          status: mainTask.taskStatus,
          priority: mainTask.taskPriority,
          dateTo: mainTask.dateTo,
          assignees: mainTask.assignees,
          hasChildren: false,
          children: [],
          isExpanded: expandedItems.has(`task-${mainTask.id}`)
        }
        
        // Unteraufgaben finden
        const subTasks = orderTasks.filter(task => task.parentTaskId === mainTask.id)
        if (subTasks.length > 0) {
          mainItem.hasChildren = true
          mainItem.children = subTasks.map(subTask => ({
            id: `subtask-${subTask.id}`,
            type: 'sub-task',
            level: 2,
            taskId: subTask.id,
            orderId,
            title: subTask.subject || 'Ohne Titel',
            subtitle: subTask.identifier,
            status: subTask.taskStatus,
            priority: subTask.taskPriority,
            dateTo: subTask.dateTo,
            assignees: subTask.assignees,
            hasChildren: false,
            children: []
          }))
        }
        
        items.push(mainItem)
        
        // Unteraufgaben hinzufügen (wenn expanded)
        if (mainItem.isExpanded) {
          items.push(...mainItem.children)
        }
      })
    })

    return items
  }, [tasks, orders, expandedItems])

  // Gefilterte Items
  const filteredItems = useMemo(() => {
    return flatHierarchy.filter(item => {
      if (item.type === 'order') return true // Aufträge immer zeigen
      
      const matchesStatus = !filters.status || item.status === filters.status
      const matchesPriority = !filters.priority || item.priority === filters.priority
      const matchesSearch = !filters.search || 
        item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(filters.search.toLowerCase()))
      
      return matchesStatus && matchesPriority && matchesSearch
    })
  }, [flatHierarchy, filters])

  // Toggle Expansion
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (loading) {
    return <div>Lade Aufgaben...</div>
  }

  if (error) {
    return <div style={{ color: 'var(--error)' }}>Fehler: {error}</div>
  }

  return (
    <div className="space-y-4">
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
          placeholder="Suchen..."
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          className="px-3 py-2 border border-[var(--border)] rounded"
        />
      </div>

      {/* Hierarchische Liste */}
      <div className="space-y-1">
        {filteredItems.map(item => (
          <div key={item.id}>
            <div 
              className={`flex items-center gap-3 p-3 border border-[var(--border)] rounded hover:bg-[var(--bg-tertiary)] cursor-pointer`}
              style={{ marginLeft: `${item.level * 24}px` }}
              onClick={() => item.hasChildren && toggleExpand(item.id)}
            >
              {/* Expand/Collapse Icon */}
              {item.hasChildren && (
                <div className="w-4 h-4 flex items-center justify-center">
                  {item.isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}

              {/* Icon je nach Typ */}
              <div className="w-4 h-4 flex items-center justify-center">
                {item.type === 'order' && <Package className="h-4 w-4" style={{ color: 'var(--info)' }} />}
                {item.type === 'main-task' && <FileText className="h-4 w-4" style={{ color: 'var(--primary)' }} />}
                {item.type === 'sub-task' && <FileText className="h-4 w-4" style={{ color: 'var(--muted)' }} />}
              </div>

              {/* Titel und Untertitel */}
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                {item.subtitle && (
                  <div className="text-sm text-muted">{item.subtitle}</div>
                )}
              </div>

              {/* Status & Priority */}
              {item.status && (
                <StatusBadge status={item.status as any} />
              )}
              {item.priority && (
                <PriorityBadge priority={item.priority as any} />
              )}

              {/* Fälligkeitsdatum */}
              {item.dateTo && (
                <div className="flex items-center gap-1 text-sm text-muted">
                  <Calendar className="h-4 w-4" />
                  {new Date(item.dateTo).toLocaleDateString('de-DE')}
                </div>
              )}

              {/* Zugewiesen */}
              {item.assignees && Array.isArray(item.assignees) && item.assignees.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted">
                  <User className="h-4 w-4" />
                  {item.assignees.map((assigneeId: any) => {
                    const user = users[assigneeId.userId || assigneeId]
                    return user ? user.fullName || user.firstName || user.id : assigneeId
                  }).join(', ')}
                </div>
              )}

              {/* Aufgaben-Zähler für Aufträge */}
              {item.type === 'order' && item.children.length > 0 && (
                <Badge variant="outline">{item.children.length} Aufgaben</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
