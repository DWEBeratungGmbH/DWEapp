"use client"

export const dynamic = 'force-dynamic'

import React, { Suspense, useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  X, 
  User,
  ChevronDown,
  Circle,
  PlayCircle
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import MultiSelectDropdown from '@/components/MultiSelectDropdown'
import DashboardLayout from '@/components/dashboard-layout'
import { PageLayout, PageHeader, Card as LayoutCard, KPICard } from '@/components/ui/page-layout'
import { Card, CardContent } from '@/components/ui/card'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  assignedUser?: string
  assignedUserId?: string
  assignedUserName?: string
  orderId?: string
  orderNumber?: string
  createdDate?: string
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

interface User {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  username: string
  department?: string
  position?: string
  phone?: string
  mobile?: string
  active: boolean
  roles: string[]
  createdDate?: number
  lastLoginDate?: number
}

function TasksPageContent() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // Column header filter states
  const [columnFilters, setColumnFilters] = useState({
    status: 'all',
    priority: 'all',
    assigned: 'all',
    dueDate: 'all'
  })
  const [activeColumnFilter, setActiveColumnFilter] = useState<string | null>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'all'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setActiveColumnFilter(null)
      }
    }

    if (activeColumnFilter) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeColumnFilter])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Parallel API Calls für Tasks und Users
        const [tasksResponse, usersResponse] = await Promise.all([
          fetch(`/api/tasks?userId=${userId}&userRole=${userRole}${view === 'my' ? `&assignedTo=${userId}` : ''}`),
          fetch('/api/users')
        ])

        if (tasksResponse.ok && usersResponse.ok) {
          const tasksData = await tasksResponse.json()
          const usersData = await usersResponse.json()
          
          const tasks = tasksData.tasks || []
          const users = usersData.result || []
          
          // Tasks mit User-Namen anreichern
          const enrichedTasks = tasks.map((task: Task) => {
            const assignedUser = users.find((user: User) => 
              user.id === task.assignedUserId || user.id === task.assignedUser
            )
            return {
              ...task,
              assignedUserName: assignedUser ? assignedUser.name : task.assignedUserName || 'Nicht zugewiesen'
            }
          })
          
          setTasks(enrichedTasks)
          setUsers(users)
          setError(null)
        }
      } catch (err: any) {
        console.error('Fehler beim Abrufen der Daten:', err)
        setError(`Konnte die Daten nicht laden: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, userRole, view])

  // Filter für Auftrag und Benutzer
  const handleOrderFilter = (orderId: string) => {
    if (orderId === 'all') {
      // Alle Aufgaben neu laden
      fetchTasksWithFilters(undefined, selectedUsers.length > 0 ? selectedUsers : undefined)
    } else {
      // Aufgaben für spezifischen Auftrag laden
      fetchTasksWithFilters(orderId, selectedUsers.length > 0 ? selectedUsers : undefined)
    }
  }

  const handleUserSelectionChange = (selectedUserIds: string[]) => {
    setSelectedUsers(selectedUserIds)
    // Live-Update der Aufgaben basierend auf der Auswahl
    if (selectedUserIds.length > 0) {
      fetchTasksWithFilters(undefined, selectedUserIds)
    } else {
      fetchTasksWithFilters()
    }
  }

  const fetchTasksWithFilters = async (orderId?: string, assignedUserIds?: string[]) => {
    try {
      setLoading(true)
      
      let url = `/api/tasks?userId=${userId}&userRole=${userRole}`
      if (orderId) {
        url += `&orderId=${orderId}`
      }
      if (assignedUserIds && assignedUserIds.length > 0) {
        // Mehrere Benutzer als separate Parameter hinzufügen
        assignedUserIds.forEach(userId => {
          url += `&assignedTo=${userId}`
        })
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

  // Get unique values for column filters
  const uniqueStatuses = useMemo(() => {
    return Array.from(new Set(tasks.map(task => task.status).filter(Boolean)))
  }, [tasks])
  
  const uniquePriorities = useMemo(() => {
    return Array.from(new Set(tasks.map(task => task.priority).filter(Boolean)))
  }, [tasks])
  
  const uniqueAssignedUsers = useMemo(() => {
    return Array.from(new Set(tasks.map(task => task.assignedUserName).filter(Boolean)))
  }, [tasks])
  
  const uniqueDueDates = useMemo<string[]>(() => {
    const dates = tasks
      .map(task => {
        if (!task.dueDate) return null
        const date = new Date(task.dueDate)
        return date.toLocaleDateString('de-DE')
      })
      .filter((date): date is string => Boolean(date))
    return Array.from(new Set(dates))
  }, [tasks])

  // Filter Logik
  const filteredTasks = tasks.filter(task => {
    // Suchfilter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!task.title?.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower) &&
          !task.assignedUserName?.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Column header filters
    if (columnFilters.status !== 'all' && task.status !== columnFilters.status) {
      return false
    }
    
    if (columnFilters.priority !== 'all' && task.priority !== columnFilters.priority) {
      return false
    }
    
    if (columnFilters.assigned !== 'all') {
      if (columnFilters.assigned === 'unassigned' && task.assignedUserName && task.assignedUserName !== 'Nicht zugewiesen') return false
      if (columnFilters.assigned === 'assigned' && (!task.assignedUserName || task.assignedUserName === 'Nicht zugewiesen')) return false
      if (columnFilters.assigned !== 'unassigned' && columnFilters.assigned !== 'assigned' && task.assignedUserName !== columnFilters.assigned) {
        return false
      }
    }
    
    if (columnFilters.dueDate !== 'all') {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate).toLocaleDateString('de-DE')
      if (taskDate !== columnFilters.dueDate) return false
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
      if (assignedFilter === 'unassigned' && task.assignedUserName && task.assignedUserName !== 'Nicht zugewiesen') return false
      if (assignedFilter === 'assigned' && (!task.assignedUserName || task.assignedUserName === 'Nicht zugewiesen')) return false
      if (assignedFilter !== 'unassigned' && assignedFilter !== 'assigned' && task.assignedUserName !== assignedFilter) {
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
      case 'COMPLETED': return 'badge-success'
      case 'IN_PROGRESS': return 'badge-info'
      case 'OPEN': return 'badge-warning'
      case 'OVERDUE': return 'badge-error'
      default: return 'badge'
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
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-success" />
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-info" />
      case 'OVERDUE': return <AlertCircle className="h-4 w-4 text-error" />
      default: return <Clock className="h-4 w-4 text-muted" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'badge-error'
      case 'MEDIUM': return 'badge-warning'
      case 'LOW': return 'badge-success'
      default: return 'badge'
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

  const isOverdue = (dueDate?: string | number) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setAssignedFilter('all')
    setDateFilter('all')
    setColumnFilters({
      status: 'all',
      priority: 'all',
      assigned: 'all',
      dueDate: 'all'
    })
  }

  const activeFiltersCount = [
    searchTerm ? 'search' : null,
    statusFilter !== 'all' ? 'status' : null,
    priorityFilter !== 'all' ? 'priority' : null,
    assignedFilter !== 'all' ? 'assigned' : null,
    dateFilter !== 'all' ? 'date' : null,
    columnFilters.status !== 'all' ? 'columnStatus' : null,
    columnFilters.priority !== 'all' ? 'columnPriority' : null,
    columnFilters.assigned !== 'all' ? 'columnAssigned' : null,
    columnFilters.dueDate !== 'all' ? 'columnDueDate' : null
  ].filter(Boolean).length

  // Get unique assigned users for filter
  const assignedUsers = Array.from(new Set(tasks.map(task => task.assignedUser).filter(Boolean)))

  return (
    <PageLayout>
      {/* Page Header */}
      <PageHeader 
        title={view === 'my' ? 'Meine Aufgaben' : 'Alle Aufgaben'}
        subtitle={`${filteredTasks.length} von ${tasks.length} Aufgaben`}
      >
        {(userRole === 'admin' || userRole === 'manager' || userRole === 'project_manager') && (
          <button className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Neue Aufgabe
          </button>
        )}
      </PageHeader>

      {/* View Toggle */}
      {(userRole === 'admin' || userRole === 'manager' || userRole === 'project_manager') && (
        <div className="flex items-center gap-2">
          <Link
            href="/tasks?view=all"
            className={`btn ${view === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            Alle Aufgaben
          </Link>
          <Link
            href="/tasks?view=my"
            className={`btn ${view === 'my' ? 'btn-primary' : 'btn-outline'}`}
          >
            Meine Aufgaben
          </Link>
        </div>
      )}

      {/* Filter Section */}
      <LayoutCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline"
            >
              <Filter className="h-4 w-4" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="badge badge-success ml-2">{activeFiltersCount}</span>
              )}
            </button>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="btn btn-ghost">
                <X className="h-4 w-4" />
                Filter löschen
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
          <Input
            type="search"
            placeholder="Aufgaben suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
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
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="HIGH">Hoch</option>
                <option value="MEDIUM">Mittel</option>
                <option value="LOW">Niedrig</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Auftrag</label>
              <select
                onChange={(e) => handleOrderFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
              >
                <option value="all">Alle Aufträge</option>
                {Array.from(new Set(tasks.map(t => t.orderNumber).filter(Boolean))).map(orderNumber => (
                  <option key={orderNumber} value={orderNumber}>
                    #{orderNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Benutzer</label>
              <MultiSelectDropdown
                selectedUsers={selectedUsers}
                onSelectionChange={handleUserSelectionChange}
                placeholder="Benutzer auswählen..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Zeitraum</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
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
      </LayoutCard>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          icon={<Circle className="h-4 w-4" />}
          label="Offen"
          value={tasks.filter(t => t.status === 'OPEN').length}
          description="Noch nicht begonnen"
          color="warning"
        />
        <KPICard
          icon={<PlayCircle className="h-4 w-4" />}
          label="In Arbeit"
          value={tasks.filter(t => t.status === 'IN_PROGRESS').length}
          description="Aktuell in Bearbeitung"
          color="info"
        />
        <KPICard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Erledigt"
          value={tasks.filter(t => t.status === 'COMPLETED').length}
          description="Abgeschlossen"
          color="accent"
        />
        <KPICard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Überfällig"
          value={tasks.filter(t => t.dueDate && isOverdue(t.dueDate)).length}
          description="Frist überschritten"
          color="error"
        />
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
        <div className="rounded-md border" ref={tableRef}>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium w-24">
                  <div className="flex items-center space-x-2">
                    <span>Status</span>
                    <div className="relative">
                      <button
                        onClick={() => setActiveColumnFilter(activeColumnFilter === 'status' ? null : 'status')}
                        className="p-1 hover:bg-muted rounded"
                        title="Status filtern"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {activeColumnFilter === 'status' && (
                        <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-10 min-w-40">
                          <select
                            value={columnFilters.status}
                            onChange={(e) => setColumnFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full p-2 border-0 bg-transparent"
                            autoFocus
                          >
                            <option value="all">Alle Status</option>
                            {uniqueStatuses.map(status => (
                              <option key={status} value={status}>
                                {getTaskStatusText(status)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">Aufgabe</th>
                <th className="h-12 px-4 text-left align-middle font-medium w-28">
                  <div className="flex items-center space-x-2">
                    <span>Priorität</span>
                    <div className="relative">
                      <button
                        onClick={() => setActiveColumnFilter(activeColumnFilter === 'priority' ? null : 'priority')}
                        className="p-1 hover:bg-muted rounded"
                        title="Priorität filtern"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {activeColumnFilter === 'priority' && (
                        <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-10 min-w-40">
                          <select
                            value={columnFilters.priority}
                            onChange={(e) => setColumnFilters(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full p-2 border-0 bg-transparent"
                            autoFocus
                          >
                            <option value="all">Alle Prioritäten</option>
                            {uniquePriorities.map(priority => (
                              <option key={priority} value={priority}>
                                {getPriorityText(priority)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium w-32">
                  <div className="flex items-center space-x-2">
                    <span>Fälligkeit</span>
                    <div className="relative">
                      <button
                        onClick={() => setActiveColumnFilter(activeColumnFilter === 'dueDate' ? null : 'dueDate')}
                        className="p-1 hover:bg-muted rounded"
                        title="Fälligkeit filtern"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {activeColumnFilter === 'dueDate' && (
                        <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-10 min-w-40">
                          <select
                            value={columnFilters.dueDate}
                            onChange={(e) => setColumnFilters(prev => ({ ...prev, dueDate: e.target.value }))}
                            className="w-full p-2 border-0 bg-transparent"
                            autoFocus
                          >
                            <option value="all">Alle Daten</option>
                            {uniqueDueDates.map(date => (
                              <option key={date} value={date}>
                                {date}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium w-32">
                  <div className="flex items-center space-x-2">
                    <span>Zuständig</span>
                    <div className="relative">
                      <button
                        onClick={() => setActiveColumnFilter(activeColumnFilter === 'assigned' ? null : 'assigned')}
                        className="p-1 hover:bg-muted rounded"
                        title="Zuständigkeit filtern"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {activeColumnFilter === 'assigned' && (
                        <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-10 min-w-40">
                          <select
                            value={columnFilters.assigned}
                            onChange={(e) => setColumnFilters(prev => ({ ...prev, assigned: e.target.value }))}
                            className="w-full p-2 border-0 bg-transparent"
                            autoFocus
                          >
                            <option value="all">Alle Benutzer</option>
                            <option value="assigned">Zugewiesen</option>
                            <option value="unassigned">Nicht zugewiesen</option>
                            {uniqueAssignedUsers.map(user => (
                              <option key={user} value={user}>
                                {user}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
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
                        <div className="font-medium">{task.title || `Task ${task.id}`}</div>
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
                          {task.assignedUserName || (
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
    </PageLayout>
  )
}

export default function TasksPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Lade Aufgaben...</div>}>
        <TasksPageContent />
      </Suspense>
    </DashboardLayout>
  )
}
