"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Circle,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  Calendar,
  User,
  Users,
  Eye,
  ListTree,
  Filter,
  Package,
  X
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ========================================
// TYPES (basierend auf WeClapp OpenAPI)
// ========================================

interface TaskAssignee {
  id: string
  userId: string
  plannedEffort?: number
  firstName?: string
  lastName?: string
  fullName?: string
}

interface Task {
  id: string
  subject: string
  description?: string
  identifier?: string
  taskStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'WAITING_ON_OTHERS'
  taskPriority: 'HIGH' | 'MEDIUM' | 'LOW'
  dateFrom?: number
  dateTo?: number
  plannedEffort?: number
  assignees: TaskAssignee[]
  watchers: { id: string }[]
  creatorUserId?: string
  parentTaskId?: string
  orderItemId?: string
  customerId?: string
  createdDate?: number
  lastModifiedDate?: number
  // App-spezifisch
  isAssignee?: boolean
  isWatcher?: boolean
  canEdit?: boolean
  canDelete?: boolean
  subTasks?: Task[]
}

interface WeClappUser {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  active: boolean
}

interface TaskStats {
  total: number
  open: number
  inProgress: number
  completed: number
  highPriority: number
}

// ========================================
// STATUS & PRIORITY HELPERS
// ========================================

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Offen', icon: Circle, color: 'text-gray-500', bg: 'bg-gray-100' },
  IN_PROGRESS: { label: 'In Bearbeitung', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  COMPLETED: { label: 'Abgeschlossen', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
  DEFERRED: { label: 'Zurückgestellt', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
  WAITING_ON_OTHERS: { label: 'Wartet', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100' },
}

const PRIORITY_CONFIG = {
  HIGH: { label: 'Hoch', color: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500' },
  MEDIUM: { label: 'Mittel', color: 'text-yellow-600', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  LOW: { label: 'Niedrig', color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' },
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatEffort(seconds?: number): string {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  return `${minutes}m`
}

// ========================================
// COMPONENTS
// ========================================

function StatusBadge({ status }: { status: Task['taskStatus'] }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED
  const Icon = config.icon
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: Task['taskPriority'] }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function StatCard({ title, value, icon: Icon, color }: { 
  title: string
  value: number
  icon: React.ElementType
  color: string 
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TaskRow({ task, level = 0 }: { task: Task; level?: number }) {
  const [expanded, setExpanded] = useState(level === 0)
  const isOverdue = task.dateTo && task.dateTo < Date.now() && task.taskStatus !== 'COMPLETED'
  const hasSubTasks = task.subTasks && task.subTasks.length > 0
  
  return (
    <>
      <div 
        className={`
          flex items-center gap-4 p-4 rounded-lg border transition-all
          hover:border-primary/30 hover:bg-accent/30
          ${isOverdue ? 'border-red-200 bg-red-50/50' : 'border-border bg-card'}
          ${level > 0 ? 'ml-8 border-l-4 border-l-muted' : ''}
        `}
      >
        {/* Expand Button für Unteraufgaben */}
        <div className="w-6 flex-shrink-0">
          {hasSubTasks ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-muted rounded"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : level > 0 ? (
            <ListTree className="w-4 h-4 text-muted-foreground ml-1" />
          ) : null}
        </div>
        
        {/* Status Icon */}
        <div className="flex-shrink-0">
          <StatusBadge status={task.taskStatus} />
        </div>
        
        {/* Main Content */}
        <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0 cursor-pointer">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">
              {task.subject}
            </h3>
            {hasSubTasks && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {task.subTasks!.length} Unteraufgaben
              </span>
            )}
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            {task.identifier && (
              <span className="font-mono text-xs">{task.identifier}</span>
            )}
            {task.dateTo && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(task.dateTo)}
              </span>
            )}
            {/* Assignees mit Namen */}
            {task.assignees.length > 0 && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {task.assignees.map(a => a.fullName || a.firstName || a.userId).join(', ')}
              </span>
            )}
            {/* Auftrag */}
            {task.orderItemId && (
              <span className="flex items-center gap-1 text-blue-600">
                <Package className="w-3.5 h-3.5" />
                Auftrag
              </span>
            )}
          </div>
        </Link>
        
        {/* Priority */}
        <div className="flex-shrink-0">
          <PriorityBadge priority={task.taskPriority} />
        </div>
        
        {/* Arrow */}
        <Link href={`/tasks/${task.id}`}>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </Link>
      </div>
      
      {/* Unteraufgaben */}
      {expanded && hasSubTasks && (
        <div className="space-y-2 mt-2">
          {task.subTasks!.map((subTask) => (
            <TaskRow key={subTask.id} task={subTask} level={level + 1} />
          ))}
        </div>
      )}
    </>
  )
}

// ========================================
// MAIN PAGE
// ========================================

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [users, setUsers] = useState<WeClappUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')
  const [userContext, setUserContext] = useState<any>(null)

  // Daten laden
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('includeUsers', 'true')
      params.set('limit', '200')
      if (assigneeFilter !== 'all') {
        params.set('assigneeUserId', assigneeFilter)
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (priorityFilter !== 'all') {
        params.set('priority', priorityFilter)
      }
      if (debouncedSearch) {
        params.set('q', debouncedSearch)
      }

      const url = `/api/tasks?${params.toString()}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setTasks(data.tasks || [])
        setStats(data.stats || null)
        setUsers(data.users || [])
        setUserContext(data.userContext || null)
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
  }, [assigneeFilter, statusFilter, priorityFilter, debouncedSearch])

  // Debounce Suche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [searchInput])

  // Trigger Reload wenn Filter sich ändern
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Bei Änderung des Assignee-Filters neu laden
  const handleAssigneeChange = (userId: string) => {
    setAssigneeFilter(userId)
  }

  // Nach Priorität und Status sortieren
  const sortedTasks = useMemo(() => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
    const statusOrder = { IN_PROGRESS: 0, NOT_STARTED: 1, WAITING_ON_OTHERS: 2, DEFERRED: 3, COMPLETED: 4 }
    
    return [...tasks].sort((a, b) => {
      const statusDiff = (statusOrder[a.taskStatus] || 9) - (statusOrder[b.taskStatus] || 9)
      if (statusDiff !== 0) return statusDiff
      return (priorityOrder[a.taskPriority] || 9) - (priorityOrder[b.taskPriority] || 9)
    })
  }, [tasks])

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Aufgaben</h1>
            <p className="text-muted-foreground">
              {userContext?.weClappConnected 
                ? `${stats?.total || 0} Aufgaben aus WeClapp` 
                : 'WeClapp nicht verbunden'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadTasks()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Neue Aufgabe
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard title="Gesamt" value={stats.total} icon={ListTree} color="bg-slate-500" />
            <StatCard title="Offen" value={stats.open} icon={Circle} color="bg-gray-500" />
            <StatCard title="In Bearbeitung" value={stats.inProgress} icon={PlayCircle} color="bg-blue-500" />
            <StatCard title="Abgeschlossen" value={stats.completed} icon={CheckCircle} color="bg-green-500" />
            <StatCard title="Hohe Priorität" value={stats.highPriority} icon={AlertCircle} color="bg-red-500" />
          </div>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {/* Suche */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Aufgaben oder Mitarbeiter suchen..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Mitarbeiter Filter */}
              <select
                value={assigneeFilter}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-background min-w-[180px]"
              >
                <option value="all">Alle Mitarbeiter</option>
                {users.filter(u => u.active).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))}
              </select>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-background min-w-[150px]"
              >
                <option value="all">Alle Status</option>
                <option value="NOT_STARTED">Offen</option>
                <option value="IN_PROGRESS">In Bearbeitung</option>
                <option value="WAITING_ON_OTHERS">Wartet</option>
                <option value="DEFERRED">Zurückgestellt</option>
                <option value="COMPLETED">Abgeschlossen</option>
              </select>
              
              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-background min-w-[150px]"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="HIGH">Hoch</option>
                <option value="MEDIUM">Mittel</option>
                <option value="LOW">Niedrig</option>
              </select>
              
              {/* Active Filter Badge */}
              {assigneeFilter !== 'all' && (
                <button
                  onClick={() => handleAssigneeChange('all')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  {users.find(u => u.id === assigneeFilter)?.fullName || 'Filter'}
                  <X className="w-3.5 h-3.5 ml-1" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              Lade Aufgaben...
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Keine Aufgaben gefunden</p>
              {assigneeFilter !== 'all' && (
                <button 
                  onClick={() => handleAssigneeChange('all')}
                  className="mt-2 text-primary hover:underline"
                >
                  Alle Mitarbeiter anzeigen
                </button>
              )}
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))
          )}
        </div>

        {/* Info */}
        {userContext && (
          <div className="text-center text-xs text-muted-foreground">
            {userContext.role} • {userContext.taskDataScope === 'all' ? 'Alle Aufgaben' : 'Eigene Aufgaben'} 
            {userContext.weClappUserId && ` • WeClapp ID: ${userContext.weClappUserId}`}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
