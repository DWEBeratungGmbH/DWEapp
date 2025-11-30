// Aufgeräumte hierarchische Aufgabenliste - CASCADE konform (< 200 Zeilen)

'use client'

import { useState, useMemo } from 'react'
import { TaskItem } from './TaskItem'
import { TaskFiltersBar } from './TaskFiltersBar'
import type { WeClappTask } from '@/types'

interface TaskHierarchyListCleanProps {
  tasks: WeClappTask[]
  orders: Record<string, any>
  users: Record<string, any>
  loading: boolean
  error: string | null
}

export function TaskHierarchyListClean({ tasks, orders, users, loading, error }: TaskHierarchyListCleanProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    assignee: '',
    hideCompleted: true,
    hideNoOrder: true
  })

  // Tasks nach Auftrag gruppieren
  const groupedTasks = useMemo(() => {
    const groups = new Map<string, WeClappTask[]>()
    const tasksWithoutOrder: WeClappTask[] = []
    
    console.log('DEBUG: Tasks:', tasks.length)
    console.log('DEBUG: Orders:', Object.keys(orders).length)
    console.log('DEBUG: Order IDs:', Object.keys(orders))
    console.log('DEBUG: Sample Order:', Object.values(orders)[0])
    
    tasks.forEach(task => {
      console.log('DEBUG: Task:', task.id, task.orderItemId, task.subject, task.taskStatus)
      
      // Abgeschlossene Aufgaben ausblenden
      if (filters.hideCompleted && task.taskStatus === 'COMPLETED') {
        console.log('DEBUG: → Skipped (completed)')
        return
      }
      
      // Aufgaben mit gültigem orderItemId gruppieren
      if (task.orderItemId && orders[task.orderItemId]) {
        const orderId = task.orderItemId
        if (!groups.has(orderId)) {
          groups.set(orderId, [])
        }
        groups.get(orderId)!.push(task)
        console.log('DEBUG: → Grouped under order:', orderId)
      } else {
        // Aufgaben ohne Auftrag separat sammeln (wenn nicht ausgeblendet)
        if (!filters.hideNoOrder) {
          tasksWithoutOrder.push(task)
          console.log('DEBUG: → No order')
        } else {
          console.log('DEBUG: → Skipped (no order)')
        }
      }
    })

    // Aufträge sortieren nach Auftragsnummer
    const orderedGroups = Array.from(groups.entries())
      .sort(([_, tasksA], [__, tasksB]) => {
        const orderA = orders[tasksA[0]?.orderItemId || '']
        const orderB = orders[tasksB[0]?.orderItemId || '']
        return (orderA?.orderNumber || '').localeCompare(orderB?.orderNumber || '')
      })
      .map(([orderId, orderTasks]) => {
        const order = orders[orderId]
        const mainTasks = orderTasks.filter(t => !t.parentTaskId)
        
        return {
          order,
          mainTasks: mainTasks.map(task => ({
            task,
            subTasks: orderTasks.filter(t => t.parentTaskId === task.id)
          }))
        }
      })

    // Aufgaben ohne Auftrag am Ende hinzufügen
    if (tasksWithoutOrder.length > 0) {
      const mainTasksWithoutOrder = tasksWithoutOrder.filter(t => !t.parentTaskId)
      orderedGroups.push({
        order: null,
        mainTasks: mainTasksWithoutOrder.map(task => ({
          task,
          subTasks: tasksWithoutOrder.filter(t => t.parentTaskId === task.id)
        }))
      })
    }

    return orderedGroups
  }, [tasks, orders])

  // Filter anwenden
  const filteredGroups = useMemo(() => {
    return groupedTasks.filter(group => {
      return group.mainTasks.some(({ task, subTasks }) => {
        const allTasks = [task, ...subTasks]
        
        return allTasks.some(t => {
          const matchesStatus = !filters.status || t.taskStatus === filters.status
          const matchesPriority = !filters.priority || t.taskPriority === filters.priority
          const matchesSearch = !filters.search || 
            (t.subject && t.subject.toLowerCase().includes(filters.search.toLowerCase()))
          const matchesAssignee = !filters.assignee || 
            (t.assignees && Array.isArray(t.assignees) && 
             t.assignees.some((assigneeId: any) => {
               const user = users[assigneeId.userId || assigneeId]
               return user && user.id === filters.assignee
             }))
          
          return matchesStatus && matchesPriority && matchesSearch && matchesAssignee
        })
      })
    })
  }, [groupedTasks, filters, users])

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
    return <div className="flex items-center justify-center p-8 text-[var(--muted)]">
      Lade Aufgaben...
    </div>
  }

  if (error) {
    return <div className="p-4 bg-[var(--error)] bg-opacity-10 border border-[var(--error)] rounded-lg text-[var(--error)]">
      Fehler: {error}
    </div>
  }

  return (
    <div className="space-y-4">
      <TaskFiltersBar filters={filters} onFiltersChange={setFilters} users={users} />
      
      <div className="space-y-2">
        {filteredGroups.map(({ order, mainTasks }) => {
          const orderId = order?.id || 'no-order'
          const isExpanded = expandedItems.has(orderId)
          
          return (
            <div key={orderId}>
              {/* Auftrag */}
              {order ? (
                <TaskItem
                  task={{ subject: order.orderNumber, identifier: order.customerDisplayName } as WeClappTask}
                  order={order}
                  users={users}
                  level={0}
                  isExpanded={isExpanded}
                  hasChildren={mainTasks.length > 0}
                  onToggle={() => toggleExpand(orderId)}
                />
              ) : (
                <TaskItem
                  task={{ subject: 'Ohne Auftrag', identifier: `${mainTasks.length} Aufgaben` } as WeClappTask}
                  order={null}
                  users={users}
                  level={0}
                  isExpanded={isExpanded}
                  hasChildren={mainTasks.length > 0}
                  onToggle={() => toggleExpand('no-order')}
                />
              )}
              
              {/* Hauptaufgaben */}
              {mainTasks.map(({ task, subTasks }) => {
                const taskId = task.id
                const isTaskExpanded = expandedItems.has(taskId)
                
                return (
                  <div key={taskId} className="ml-4">
                    <TaskItem
                      task={task}
                      order={order}
                      users={users}
                      level={1}
                      isExpanded={isTaskExpanded}
                      hasChildren={subTasks.length > 0}
                      onToggle={() => toggleExpand(taskId)}
                    />
                    
                    {/* Unteraufgaben */}
                    {isTaskExpanded && subTasks.map(subTask => (
                      <div key={subTask.id} className="ml-4">
                        <TaskItem
                          task={subTask}
                          order={order}
                          users={users}
                          level={2}
                        />
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
