"use client"

import React, { useEffect, useState } from 'react'
import { ClipboardList, Plus, Search, Filter, Calendar, RefreshCw, CheckCircle, Clock, AlertCircle, ExternalLink, X, User } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Task {
  id: string
  name: string
  status: string
  priority: string
  dueDate?: number
  assignedUser?: string
  assignedUserId?: string
  description?: string
  orderId?: string
  orderNumber?: string
  createdDate?: number
  estimatedHours?: number
  actualHours?: number
  orderInfo?: {
    id: string
    orderNumber: string
    status: string
    customerNumber: string
    invoiceAddress?: {
      firstName?: string
      lastName?: string
      city?: string
    }
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('employee')
  const [userId, setUserId] = useState<string>('')
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [assignedFilter, setAssignedFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'all'

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        
        // API Call mit Rollen-Filter und View
        let url = `/api/tasks?userId=${userId}&userRole=${userRole}`
        if (view === 'my') {
          url += `&assignedTo=${userId}`
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Aufgaben konnten nicht geladen werden')
        }
        
        const data = await response.json()
        setTasks(data.tasks || [])
        setError(null)
      } catch (err: any) {
        console.error('Fehler beim Abrufen der Tasks:', err)
        setError(`Konnte die Tasks nicht laden: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [userId, userRole, view])

  // Filter Logik
  const filteredTasks = tasks.filter(task => {
    // Suchfilter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!task.name?.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower) &&
          !task.assignedUser?.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Statusfilter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false
    }

    // Prioritätsfilter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false
    }

    // Zuständigkeitsfilter
    if (assignedFilter !== 'all') {
      if (assignedFilter === 'unassigned' && task.assignedUser) return false
      if (assignedFilter === 'assigned' && !task.assignedUser) return false
      if (assignedFilter !== 'unassigned' && assignedFilter !== 'assigned' && task.assignedUser !== assignedFilter) {
        return false
      }
    }

    // Datumsfilter
    if (dateFilter !== 'all') {
      const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(task.createdDate || Date.now())
      const today = new Date()
      
      switch (dateFilter) {
        case 'today':
          if (taskDate.toDateString() !== today.toDateString()) return false
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (taskDate < weekAgo) return false
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (taskDate < monthAgo) return false
          break
        case 'overdue':
          if (!task.dueDate || new Date(task.dueDate) >= today) return false
          break
      }
    }

    return true
  })

  const getTaskStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'OPEN': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'Erledigt'
      case 'IN_PROGRESS': return 'In Arbeit'
      case 'OPEN': return 'Offen'
      case 'OVERDUE': return 'Überfällig'
      default: return status || 'Offen'
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-blue-600" />
      case 'OVERDUE': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'Hoch'
      case 'MEDIUM': return 'Mittel'
      case 'LOW': return 'Niedrig'
      default: return priority || 'Mittel'
    }
  }

  const isOverdue = (dueDate?: number) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setAssignedFilter('all')
    setDateFilter('all')
  }

  const activeFiltersCount = [
    searchTerm ? 'search' : null,
    statusFilter !== 'all' ? 'status' : null,
    priorityFilter !== 'all' ? 'priority' : null,
    assignedFilter !== 'all' ? 'assigned' : null,
    dateFilter !== 'all' ? 'date' : null
  ].filter(Boolean).length

  // Get unique assigned users for filter
  const assignedUsers = Array.from(new Set(tasks.map(task => task.assignedUser).filter(Boolean)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {view === 'my' ? 'Meine Aufgaben' : 'Alle Aufgaben'}
          </h1>
          <p className="text-muted-foreground">
            {filteredTasks.length} von {tasks.length} Aufgaben
          </p>
        </div>
        {(userRole === 'admin' || userRole === 'manager' || userRole === 'project_manager') && (
          <button className="btn btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Neue Aufgabe
          </button>
        )}
      </div>

      {/* View Toggle */}
      {(userRole === 'admin' || userRole === 'manager' || userRole === 'project_manager') && (
        <div className="flex items-center space-x-2">
          <Link
            href="/tasks?view=all"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'all' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            Alle Aufgaben
          </Link>
          <Link
            href="/tasks?view=my"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'my' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            Meine Aufgaben
          </Link>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="btn btn-ghost flex items-center">
                <X className="mr-2 h-4 w-4" />
                Filter löschen
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Aufgaben suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-8"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">Alle Status</option>
                <option value="OPEN">Offen</option>
                <option value="IN_PROGRESS">In Arbeit</option>
                <option value="COMPLETED">Erledigt</option>
                <option value="OVERDUE">Überfällig</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Priorität</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="HIGH">Hoch</option>
                <option value="MEDIUM">Mittel</option>
                <option value="LOW">Niedrig</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Zuständig</label>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="input"
              >
                <option value="all">Alle</option>
                <option value="assigned">Zugewiesen</option>
                <option value="unassigned">Nicht zugewiesen</option>
                {assignedUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Zeitraum</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input"
              >
                <option value="all">Alle Zeitpunkte</option>
                <option value="today">Heute</option>
                <option value="week">Letzte 7 Tage</option>
                <option value="month">Letzte 30 Tage</option>
                <option value="overdue">Überfällig</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tasks.filter(t => t.status === 'OPEN').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Arbeit</p>
              <p className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Erledigt</p>
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'COMPLETED').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Überfällig</p>
              <p className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.dueDate && isOverdue(t.dueDate)).length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center rounded-md border bg-card p-8">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Lade Aufgaben...
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium w-24">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Aufgabe</th>
                <th className="h-12 px-4 text-left align-middle font-medium w-28">Priorität</th>
                <th className="h-12 px-4 text-left align-middle font-medium w-32">Fälligkeitsdatum</th>
                <th className="h-12 px-4 text-left align-middle font-medium w-32">Zuständig</th>
                <th className="h-12 px-4 text-left align-middle font-medium w-64">Auftrag</th>
                <th className="h-12 px-4 text-left align-middle font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    {tasks.length === 0 ? 'Keine Aufgaben gefunden.' : 'Keine Aufgaben entsprechen den Filterkriterien.'}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex items-center space-x-2">
                        {getTaskStatusIcon(task.status)}
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                          {getTaskStatusText(task.status)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div>
                        <div className="font-medium">{task.name || `Task ${task.id}`}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground line-clamp-2">{task.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityText(task.priority)}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {task.dueDate ? (
                          <div className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                            {new Date(task.dueDate).toLocaleDateString('de-DE')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Kein Datum</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {task.assignedUser || (
                            <span className="text-muted-foreground">Nicht zugewiesen</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {task.orderInfo ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-sm">#{task.orderInfo.orderNumber}</span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                task.orderInfo.status === 'ORDER_ENTRY_IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                                task.orderInfo.status === 'ORDER_CONFIRMATION_PRINTED' ? 'bg-blue-100 text-blue-800' :
                                task.orderInfo.status === 'INVOICED' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.orderInfo.status === 'ORDER_ENTRY_IN_PROGRESS' ? 'In Bearbeitung' :
                                 task.orderInfo.status === 'ORDER_CONFIRMATION_PRINTED' ? 'Auftragsbestätigung' :
                                 task.orderInfo.status === 'INVOICED' ? 'Rechnung' :
                                 task.orderInfo.status}
                              </span>
                            </div>
                            <Link
                              href={`/orders/${task.orderInfo.id}`}
                              className="text-primary hover:text-primary/80 p-1 hover:bg-muted rounded"
                              title="Zum Auftrag springen"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {task.orderInfo.invoiceAddress?.firstName && task.orderInfo.invoiceAddress?.lastName 
                                ? `${task.orderInfo.invoiceAddress.firstName} ${task.orderInfo.invoiceAddress.lastName}`
                                : `Kunde ${task.orderInfo.customerNumber}`
                              }
                            </div>
                            {task.orderInfo.invoiceAddress?.city && (
                              <div className="text-muted-foreground">
                                📍 {task.orderInfo.invoiceAddress.city}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          <div className="text-sm">Kein Auftrag</div>
                          <div className="text-xs">Nicht zugeordnet</div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Link href={`/tasks/${task.id}`} className="text-primary hover:underline">Details</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
