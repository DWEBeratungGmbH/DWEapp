// Tasks-Seite
// Zeigt Aufgaben mit Filtern und View-Umschaltung

'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { 
  Plus, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  PlayCircle
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { TaskDataTable, type TaskTableFilters } from '@/components/tasks'
import { KPICard } from '@/components/ui/page-layout'
import { Button } from '@/components/ui/button'
import { useWeClappTasks, useWeClappUsers } from '@/hooks/useWeClappData'
import type { Task, TaskStats } from '@/types'

export default function TasksPage() {
  // State für Filter
  const [filters, setFilters] = useState<TaskTableFilters>({
    search: '',
    status: '',
    priority: '',
    assigneeUserId: '',
    orderNumber: '',
    dueDateFrom: '',
    dueDateTo: '',
  })

  // Filter-Objekt memoizen, um Loops zu vermeiden
  const apiFilters = useMemo(() => ({
    search: filters.search,
    status: filters.status,
    priority: filters.priority,
    assigneeId: filters.assigneeUserId,
    customerId: filters.customerId
  }), [filters])

  // WeClapp Daten mit Hooks
  const { 
    data: tasks, 
    loading: tasksLoading, 
    error: tasksError,
    pagination,
    refetch: refetchTasks
  } = useWeClappTasks({
    filters: apiFilters,
    autoFetch: true
  })

  const { 
    data: users, 
    loading: usersLoading 
  } = useWeClappUsers({
    limit: 1000, // Alle Benutzer laden für Filter
    autoFetch: true
  })

  // Stats berechnen
  const stats = useMemo(() => {
    if (!tasks.length) return null
    
    return {
      total: tasks.length,
      open: tasks.filter(t => t.taskStatus === 'NOT_STARTED').length,
      inProgress: tasks.filter(t => t.taskStatus === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.taskStatus === 'COMPLETED').length,
      highPriority: tasks.filter(t => t.taskPriority === 'HIGH').length
    } as TaskStats
  }, [tasks])

  // Filter-Änderungen behandeln
  const handleFiltersChange = useCallback((newFilters: TaskTableFilters) => {
    setFilters(newFilters)
  }, [])

  // Refresh
  const handleRefresh = useCallback(() => {
    refetchTasks()
  }, [refetchTasks])

  const loading = tasksLoading || usersLoading
  const error = tasksError

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Aufgaben</h1>
            <p className="text-muted">{stats?.total || 0} Aufgaben insgesamt</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="secondary"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Button>
              <Plus className="w-4 h-4" />
              Neue Aufgabe
            </Button>
          </div>
        </div>

        {/* Statistik-Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPICard
              icon={<CheckCircle className="h-5 w-5" />}
              label="Gesamt"
              value={stats.total}
              description="Alle Aufgaben"
              color="info"
            />
            <KPICard
              icon={<AlertCircle className="h-5 w-5" />}
              label="Offen"
              value={stats.open}
              description="Nicht begonnen"
              color="warning"
            />
            <KPICard
              icon={<PlayCircle className="h-5 w-5" />}
              label="In Bearbeitung"
              value={stats.inProgress}
              description="Aktiv"
              color="info"
            />
            <KPICard
              icon={<Clock className="h-5 w-5" />}
              label="Hohe Priorität"
              value={stats.highPriority}
              description="Dringend"
              color="error"
            />
          </div>
        )}

        {/* Task-DataTable - CASCADE konform */}
        <TaskDataTable
          tasks={tasks as any}
          orders={{}}
          users={users.reduce((acc, user) => ({ ...acc, [user.id]: user }), {})}
          loading={loading}
          error={error}
          onTaskClick={(task) => console.log('Task clicked:', task)}
          onTaskEdit={(task) => console.log('Task edit:', task)}
          onTaskDelete={(task) => console.log('Task delete:', task)}
          onFiltersChange={handleFiltersChange}
          serverSideFiltering={true}
        />
      </div>
    </DashboardLayout>
  )
}
