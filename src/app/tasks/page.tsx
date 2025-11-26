"use client"

import React, { useEffect, useState } from 'react'
import { ClipboardList, Plus, Search, Filter, Calendar, RefreshCw, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// Typ für einen Task
interface Task {
  id: string
  name: string
  status: string
  priority: string
  dueDate?: number
  assignedUser?: string
  description?: string
  orderId?: string
  orderNumber?: string
  createdDate?: number
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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/allTasks')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'API-Fehler')
        }
        
        const data = await response.json()
        setTasks(data.result || [])
        setError(null)
      } catch (err: any) {
        console.error('Fehler beim Abrufen der Tasks:', err)
        setError(`Konnte die Tasks nicht laden: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const getTaskStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'Erledigt'
      case 'IN_PROGRESS':
        return 'In Arbeit'
      case 'OPEN':
        return 'Offen'
      case 'OVERDUE':
        return 'Überfällig'
      default:
        return status || 'Offen'
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'OVERDUE':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'Hoch'
      case 'MEDIUM':
        return 'Mittel'
      case 'LOW':
        return 'Niedrig'
      default:
        return priority || 'Mittel'
    }
  }

  const isOverdue = (dueDate?: number) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Aufgaben</h1>
        <button className="btn btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Neue Aufgabe
        </button>
      </div>

      <div className="mt-6 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Aufgaben suchen..."
            className="input pl-8"
          />
        </div>
        <button className="btn btn-outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </button>
      </div>

      {loading && (
        <div className="mt-6 flex items-center justify-center rounded-md border bg-card p-8">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Lade Aufgaben...
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 rounded-md border">
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
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    Keine Aufgaben mit Aufträgen gefunden.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
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
                      <div className="text-sm">
                        {task.assignedUser || (
                          <span className="text-muted-foreground">Nicht zugewiesen</span>
                        )}
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
                            <a
                              href={`/orders`}
                              onClick={(e) => {
                                e.preventDefault()
                                window.location.href = '/orders'
                              }}
                              className="text-primary hover:text-primary/80 p-1 hover:bg-muted rounded"
                              title="Zum Auftrag springen"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
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
