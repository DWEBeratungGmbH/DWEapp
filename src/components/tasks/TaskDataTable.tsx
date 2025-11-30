// Task DataTable - CASCADE-konform (<200 Zeilen)

'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui'
import { DataTable } from '@/components/ui/data-table'
import { TaskFilters } from './TaskFilters'
import { TaskGrouping } from './TaskGrouping'
import { createTaskColumns } from './TaskColumns'
import type { WeClappTask } from '@/types'

export interface TaskTableFilters {
  search: string
  status: string
  priority: string
  assigneeUserId: string
  orderNumber: string
  dueDateFrom: string
  dueDateTo: string
}

interface TaskDataTableProps {
  tasks: WeClappTask[]
  orders: Record<string, any>
  users: Record<string, any>
  loading?: boolean
  error?: string | null
  onTaskClick?: (task: WeClappTask) => void
  onTaskEdit?: (task: WeClappTask) => void
  onTaskDelete?: (task: WeClappTask) => void
  onFiltersChange?: (filters: TaskTableFilters) => void
  serverSideFiltering?: boolean
}

export function TaskDataTable({
  tasks,
  orders,
  users,
  loading = false,
  error,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onFiltersChange,
  serverSideFiltering = false
}: TaskDataTableProps) {
  const [filters, setFilters] = useState<TaskTableFilters>({
    search: '',
    status: '',
    priority: '',
    assigneeUserId: '',
    orderNumber: '',
    dueDateFrom: '',
    dueDateTo: '',
  })
  const [grouping, setGrouping] = useState('none')

  const notifyFiltersChange = useMemo(() => {
    let timeoutId: NodeJS.Timeout
    return (newFilters: TaskTableFilters) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        onFiltersChange?.(newFilters)
      }, 300)
    }
  }, [onFiltersChange])

  const updateFilter = (key: keyof TaskTableFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    if (serverSideFiltering && onFiltersChange) {
      notifyFiltersChange(newFilters)
    }
  }

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      status: '',
      priority: '',
      assigneeUserId: '',
      orderNumber: '',
      dueDateFrom: '',
      dueDateTo: '',
    }
    setFilters(emptyFilters)
    setGrouping('none')
    
    if (serverSideFiltering && onFiltersChange) {
      onFiltersChange(emptyFilters)
    }
  }

  const enrichedTasks = useMemo(() => {
    return tasks.map(task => {
      const orderItemId = String(task.orderItemId || '')
      const order = orders[orderItemId]
      
      const assigneeIds = task.assignees || []
      const firstAssigneeId = String(assigneeIds[0]?.userId || assigneeIds[0] || '')
      const firstAssignee = users[firstAssigneeId]
      
      return {
        ...task,
        orderNumber: order?.orderNumber || 'Ohne Auftrag',
        customerName: order?.customerDisplayName || '',
        assigneeId: firstAssigneeId || 'unassigned',
        assigneeName: firstAssignee 
          ? `${firstAssignee.firstName || ''} ${firstAssignee.lastName || ''}`.trim()
          : 'Nicht zugewiesen',
      }
    })
  }, [tasks, orders, users])

  const filteredTasks = useMemo(() => {
    if (serverSideFiltering) return enrichedTasks
    
    return enrichedTasks.filter(task => {
      if (filters.search && !task.subject?.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.status && task.taskStatus !== filters.status) return false
      if (filters.priority && task.taskPriority !== filters.priority) return false
      if (filters.assigneeUserId && String(task.assigneeId) !== String(filters.assigneeUserId)) return false
      if (filters.orderNumber && !task.orderNumber?.toLowerCase().includes(filters.orderNumber.toLowerCase())) return false
      
      if (filters.dueDateFrom || filters.dueDateTo) {
        if (!task.dateTo) return false
        const taskDate = typeof task.dateTo === 'number' ? new Date(task.dateTo) : new Date(task.dateTo)
        if (filters.dueDateFrom && taskDate < new Date(filters.dueDateFrom)) return false
        if (filters.dueDateTo && taskDate > new Date(filters.dueDateTo)) return false
      }
      
      return true
    })
  }, [enrichedTasks, serverSideFiltering, filters])

  const columns = useMemo(() => 
    createTaskColumns({ onTaskClick, onTaskEdit, onTaskDelete, orders }), 
    [onTaskClick, onTaskEdit, onTaskDelete, orders]
  )

  return (
    <div className="space-y-4">
      <TaskFilters
        searchInput={filters.search}
        onSearchChange={(value) => updateFilter('search', value)}
        statusFilter={filters.status}
        onStatusChange={(value) => updateFilter('status', value)}
        priorityFilter={filters.priority}
        onPriorityChange={(value) => updateFilter('priority', value)}
        assigneeFilter={filters.assigneeUserId}
        onAssigneeChange={(value) => updateFilter('assigneeUserId', value)}
        orderFilter={filters.orderNumber}
        onOrderChange={(value) => updateFilter('orderNumber', value)}
        dueDateFrom={filters.dueDateFrom}
        onDueDateFromChange={(value) => updateFilter('dueDateFrom', value)}
        dueDateTo={filters.dueDateTo}
        onDueDateToChange={(value) => updateFilter('dueDateTo', value)}
        users={Object.values(users)}
        onClearFilters={clearFilters}
        hasActiveFilters={!!(filters.search || filters.status || filters.priority || filters.assigneeUserId || filters.orderNumber || filters.dueDateFrom || filters.dueDateTo)}
      />

      <TaskGrouping grouping={grouping} onGroupingChange={setGrouping} />

      <Card>
        <CardContent className="p-0">
          {error ? (
            <div className="p-4 text-center text-[var(--error)]">
              Fehler: {error}
            </div>
          ) : loading ? (
            <div className="p-4 text-center text-[var(--muted)]">
              Lade...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredTasks}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
