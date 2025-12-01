// Verbesserte hierarchische Aufgabenliste - CASCADE-konform refactored
// Hauptkomponente mit Logic, UI in separate Komponenten ausgelagert

'use client'

import { useState, useMemo } from 'react'
import { TaskHierarchyFilters, type TaskFiltersState } from './TaskHierarchyFilters'
import { TaskHierarchyOrderRow } from './TaskHierarchyOrderRow'
import { TaskHierarchyTaskRow } from './TaskHierarchyTaskRow'
import type { WeClappTask } from '@/types'

interface TaskHierarchyListV2Props {
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
  progress?: number
}

export function TaskHierarchyListV2({ tasks, orders, users, loading, error }: TaskHierarchyListV2Props) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<TaskFiltersState>({
    status: '',
    priority: '',
    search: '',
    assignee: '',
    dueSoon: false,
    myTasks: false
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
      
      // Fortschritt berechnen
      const completedTasks = orderTasks.filter(t => t.taskStatus === 'COMPLETED').length
      const progress = orderTasks.length > 0 ? (completedTasks / orderTasks.length) * 100 : 0
      
      // Auftrag-Header
      const orderItem: FlatTaskItem = {
        id: `order-${orderId}`,
        type: 'order',
        level: 0,
        orderId,
        title: order?.orderNumber || 'Ohne Auftrag',
        subtitle: order?.customerName || 'Nicht zugewiesen',
        hasChildren: orderTasks.length > 0,
        children: [],
        isExpanded: expandedItems.has(`order-${orderId}`),
        progress
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
          dateTo: mainTask.dateTo?.toString(),
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
            dateTo: subTask.dateTo?.toString(),
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

  // Smart Filter
  const filteredItems = useMemo(() => {
    return flatHierarchy.filter(item => {
      if (item.type === 'order') return true // Aufträge immer zeigen
      
      // Status Filter
      if (filters.status && item.status !== filters.status) return false
      
      // Priority Filter
      if (filters.priority && item.priority !== filters.priority) return false
      
      // Search Filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!item.title.toLowerCase().includes(searchLower) && 
            !(item.subtitle && item.subtitle.toLowerCase().includes(searchLower))) {
          return false
        }
      }
      
      // Assignee Filter
      if (filters.assignee && item.assignees) {
        const hasAssignee = item.assignees.some((assigneeId: any) => {
          const user = users[assigneeId.userId || assigneeId]
          return user && user.id === filters.assignee
        })
        if (!hasAssignee) return false
      }
      
      // Due Soon Filter (nächste 7 Tage)
      if (filters.dueSoon && item.dateTo) {
        const dueDate = new Date(item.dateTo)
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        if (dueDate > weekFromNow) return false
      }
      
      return true
    })
  }, [flatHierarchy, filters, users])

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

  // Quick Actions
  const handleQuickAction = (action: string, taskId: string) => {
    console.log(`Action: ${action} for task: ${taskId}`)
    // TODO: Implement actions
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Fehler: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar - ausgelagerte Komponente */}
      <TaskHierarchyFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* Hierarchische Liste */}
      <div className="space-y-2">
        {filteredItems.map(item => (
          <div key={item.id} className="group">
            {/* Auftrag - ausgelagerte Komponente */}
            {item.type === 'order' && (
              <TaskHierarchyOrderRow
                item={item}
                order={orders[item.orderId!]}
                onToggle={toggleExpand}
              />
            )}

            {/* Haupt- und Unteraufgaben - ausgelagerte Komponente */}
            {(item.type === 'main-task' || item.type === 'sub-task') && (
              <TaskHierarchyTaskRow
                item={item as Omit<FlatTaskItem, 'type'> & { type: 'main-task' | 'sub-task' }}
                users={users}
                onToggle={toggleExpand}
                onQuickAction={handleQuickAction}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
