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
import type { Task, TaskStats, WeClappUser, WeClappTask } from '@/types'

export default function TasksPage() {
  // State
  const [tasks, setTasks] = useState<WeClappTask[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [users, setUsers] = useState<WeClappUser[]>([])
  const [orders, setOrders] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskTableFilters>({
    search: '',
    status: '',
    priority: '',
    assigneeUserId: '',
    orderNumber: '',
    dueDateFrom: '',
    dueDateTo: '',
  })
  
  // Daten laden mit Filtern
  const loadTasks = useCallback(async (currentFilters?: TaskTableFilters) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('includeUsers', 'true')
      params.set('limit', '500')
      
      // Filter Parameter hinzufügen
      const f = currentFilters || filters
      if (f.search) params.set('q', f.search)
      if (f.status) params.set('status', f.status)
      if (f.priority) params.set('priority', f.priority)
      if (f.assigneeUserId) params.set('assigneeUserId', f.assigneeUserId)
      if (f.orderNumber) params.set('orderNumber', f.orderNumber)
      if (f.dueDateFrom) params.set('dueDateFrom', f.dueDateFrom)
      if (f.dueDateTo) params.set('dueDateTo', f.dueDateTo)

      const response = await fetch(`/api/tasks?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTasks(data.tasks || [])
        setStats(data.stats || null)
        setUsers(data.users || [])
        setOrders(data.orders || {})
        setError(null)
      } else {
        setError(data.error || 'Fehler beim Laden')
      }
    } catch (err) {
      setError('Verbindungsfehler')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])
  
  // Filter-Änderungen behandeln (Server-side)
  const handleFiltersChange = useCallback((newFilters: TaskTableFilters) => {
    setFilters(newFilters)
    loadTasks(newFilters)
  }, [loadTasks])

  // Initiales Laden
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  
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
              onClick={() => loadTasks()}
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
          tasks={tasks}
          orders={orders}
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
