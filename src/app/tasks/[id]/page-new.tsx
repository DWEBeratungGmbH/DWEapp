"use client"

import React, { useEffect, useState } from 'react'
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Calendar, 
  Clock, 
  User, 
  Users,
  Eye,
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  Edit3,
  Circle,
  PlayCircle,
  ListTree,
  ExternalLink,
  FileText,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

// ========================================
// TYPES (basierend auf WeClapp OpenAPI)
// ========================================

interface TaskAssignee {
  id: string
  userId: string
  plannedEffort?: number
}

interface TaskDetail {
  id: string
  subject: string
  description?: string
  identifier?: string
  taskStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'WAITING_ON_OTHERS'
  taskPriority: 'HIGH' | 'MEDIUM' | 'LOW'
  taskVisibilityType?: 'ORGANIZATION' | 'PRIVATE'
  dateFrom?: number
  dateTo?: number
  plannedEffort?: number
  assignees: TaskAssignee[]
  watchers: { id: string }[]
  creatorUserId?: string
  parentTaskId?: string
  customerId?: string
  ticketId?: string
  orderItemId?: string
  createdDate?: number
  lastModifiedDate?: number
  // App-spezifisch
  isAssignee?: boolean
  isWatcher?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

// ========================================
// STATUS & PRIORITY CONFIG
// ========================================

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  NOT_STARTED: { label: 'Offen', icon: Circle, color: 'text-gray-600', bg: 'bg-gray-100' },
  IN_PROGRESS: { label: 'In Bearbeitung', icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  COMPLETED: { label: 'Abgeschlossen', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  DEFERRED: { label: 'Zurückgestellt', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  WAITING_ON_OTHERS: { label: 'Wartet auf andere', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  HIGH: { label: 'Hoch', color: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
  MEDIUM: { label: 'Mittel', color: 'text-yellow-700', bg: 'bg-yellow-100', dot: 'bg-yellow-500' },
  LOW: { label: 'Niedrig', color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function formatDate(timestamp?: number): string {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDateTime(timestamp?: number): string {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

function stripHtml(html?: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

// ========================================
// COMPONENTS
// ========================================

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED
  const Icon = config.icon
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

function InfoRow({ icon: Icon, label, value, className = '' }: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-start gap-3 py-3 ${className}`}>
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="font-medium mt-0.5">{value}</div>
      </div>
    </div>
  )
}

// ========================================
// MAIN PAGE
// ========================================

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [subTasks, setSubTasks] = useState<TaskDetail[]>([])

  // Params laden
  useEffect(() => {
    const getParams = async () => {
      const { id: paramId } = await params
      setId(paramId)
    }
    getParams()
  }, [params])

  // Task laden
  useEffect(() => {
    if (!id) return
    
    const fetchTask = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/tasks/${id}`)
        
        if (!response.ok) {
          throw new Error('Aufgabe konnte nicht geladen werden')
        }
        
        const data = await response.json()
        setTask(data.task || data)
        
        // Unteraufgaben laden wenn vorhanden
        // TODO: API Endpunkt für Unteraufgaben
        
      } catch (err: any) {
        console.error('Fehler beim Laden:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return
    
    try {
      setSaving(true)
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskStatus: newStatus }),
      })

      if (response.ok) {
        const data = await response.json()
        setTask({ ...task, taskStatus: newStatus as TaskDetail['taskStatus'] })
      }
    } catch (err) {
      console.error('Fehler beim Speichern:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Möchten Sie diese Aufgabe wirklich löschen?')) return
    
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (response.ok) {
        router.push('/tasks')
      }
    } catch (err) {
      setError('Fehler beim Löschen')
    }
  }

  // Loading State
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <RefreshCw className="mr-2 h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Lade Aufgabe...</span>
        </div>
      </DashboardLayout>
    )
  }

  // Error State
  if (error || !task) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mb-4">
            <strong>Fehler:</strong> {error || 'Aufgabe nicht gefunden'}
          </div>
          <Link href="/tasks" className="text-primary hover:underline flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const isOverdue = task.dateTo && task.dateTo < Date.now() && task.taskStatus !== 'COMPLETED'

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/tasks" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zu den Aufgaben
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {task.identifier && (
                  <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    {task.identifier}
                  </span>
                )}
                {task.parentTaskId && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex items-center gap-1">
                    <ListTree className="w-3 h-3" />
                    Unteraufgabe
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">{task.subject}</h1>
            </div>
            
            <div className="flex gap-2">
              {task.canEdit && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Bearbeiten
                </Button>
              )}
              {task.canDelete && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Löschen
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hauptbereich */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Priorität */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <StatusBadge status={task.taskStatus} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Priorität</p>
                    <PriorityBadge priority={task.taskPriority} />
                  </div>
                  {isOverdue && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Überfällig</span>
                    </div>
                  )}
                </div>
                
                {/* Quick Status Change */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Status ändern:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        disabled={saving || task.taskStatus === key}
                        className={`
                          px-3 py-1.5 rounded-lg text-sm transition-all
                          ${task.taskStatus === key 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'}
                          disabled:opacity-50
                        `}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Beschreibung */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Beschreibung
                </CardTitle>
              </CardHeader>
              <CardContent>
                {task.description ? (
                  <div 
                    className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: task.description }}
                  />
                ) : (
                  <p className="text-muted-foreground italic">Keine Beschreibung vorhanden</p>
                )}
              </CardContent>
            </Card>

            {/* Unteraufgaben */}
            {subTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListTree className="w-5 h-5" />
                    Unteraufgaben ({subTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subTasks.map((subTask) => (
                      <Link
                        key={subTask.id}
                        href={`/tasks/${subTask.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <StatusBadge status={subTask.taskStatus} />
                        <span className="flex-1 truncate">{subTask.subject}</span>
                        <PriorityBadge priority={subTask.taskPriority} />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Seitenleiste */}
          <div className="space-y-6">
            {/* Zeitraum */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zeitraum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 divide-y">
                <InfoRow 
                  icon={Calendar} 
                  label="Startdatum" 
                  value={formatDate(task.dateFrom)}
                />
                <InfoRow 
                  icon={Calendar} 
                  label="Fälligkeitsdatum" 
                  value={
                    <span className={isOverdue ? 'text-red-600 font-bold' : ''}>
                      {formatDate(task.dateTo)}
                      {isOverdue && ' (überfällig)'}
                    </span>
                  }
                />
                <InfoRow 
                  icon={Clock} 
                  label="Geplanter Aufwand" 
                  value={formatEffort(task.plannedEffort)}
                />
              </CardContent>
            </Card>

            {/* Personen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 divide-y">
                <InfoRow 
                  icon={Users} 
                  label="Zugewiesen an" 
                  value={
                    task.assignees.length > 0 
                      ? `${task.assignees.length} Person(en)`
                      : <span className="text-muted-foreground">Niemand</span>
                  }
                />
                <InfoRow 
                  icon={Eye} 
                  label="Beobachter" 
                  value={
                    task.watchers.length > 0 
                      ? `${task.watchers.length} Person(en)`
                      : <span className="text-muted-foreground">Keine</span>
                  }
                />
                <InfoRow 
                  icon={User} 
                  label="Erstellt von" 
                  value={task.creatorUserId || '-'}
                />
              </CardContent>
            </Card>

            {/* Metadaten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 divide-y">
                <InfoRow 
                  icon={FileText} 
                  label="Aufgaben-ID" 
                  value={<span className="font-mono text-sm">{task.id}</span>}
                />
                <InfoRow 
                  icon={Calendar} 
                  label="Erstellt am" 
                  value={formatDateTime(task.createdDate)}
                />
                <InfoRow 
                  icon={Clock} 
                  label="Zuletzt geändert" 
                  value={formatDateTime(task.lastModifiedDate)}
                />
                {task.customerId && (
                  <InfoRow 
                    icon={User} 
                    label="Kunde" 
                    value={task.customerId}
                  />
                )}
                {task.parentTaskId && (
                  <InfoRow 
                    icon={ListTree} 
                    label="Hauptaufgabe" 
                    value={
                      <Link href={`/tasks/${task.parentTaskId}`} className="text-primary hover:underline">
                        Zur Hauptaufgabe →
                      </Link>
                    }
                  />
                )}
              </CardContent>
            </Card>

            {/* WeClapp Link */}
            <Card>
              <CardContent className="p-4">
                <a 
                  href={`https://dwe.weclapp.com/webapp/view/task/taskList.page?entityId=${task.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border hover:bg-muted transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  In WeClapp öffnen
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
