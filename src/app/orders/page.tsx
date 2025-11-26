"use client"

import React, { useEffect, useState } from 'react'
import { ClipboardList, Plus, Search, Filter, Calendar, RefreshCw, Euro, User, FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { WeClappSalesOrder as SalesOrder, WeClappTask as Task } from '@/lib/weclapp'

export default function OrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [tasksData, setTasksData] = useState<Record<string, Task[]>>({})
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        // Aufruf der lokalen API-Route
        const response = await fetch('/api/projects')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'API-Fehler')
        }
        
        const data = await response.json()
        setOrders(data.result || [])
        setError(null)
      } catch (err: any) {
        console.error('Fehler beim Abrufen der Aufträge:', err)
        setError(`Konnte die Aufträge nicht laden: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const fetchTasksForOrder = async (orderId: string) => {
    if (tasksData[orderId] || loadingTasks.has(orderId)) {
      return
    }

    setLoadingTasks(prev => new Set(prev).add(orderId))
    
    try {
      const response = await fetch(`/api/tasks?orderId=${orderId}`)
      
      if (!response.ok) {
        throw new Error('Tasks konnten nicht geladen werden')
      }
      
      const data = await response.json()
      setTasksData(prev => ({
        ...prev,
        [orderId]: data.result || []
      }))
    } catch (err: any) {
      console.error('Fehler beim Abrufen der Tasks:', err)
    } finally {
      setLoadingTasks(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
      fetchTasksForOrder(orderId)
    }
    
    setExpandedOrders(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ORDER_ENTRY_IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800'
      case 'ORDER_CONFIRMATION_PRINTED':
        return 'bg-blue-100 text-blue-800'
      case 'INVOICED':
        return 'bg-green-100 text-green-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ORDER_ENTRY_IN_PROGRESS':
        return 'In Bearbeitung'
      case 'ORDER_CONFIRMATION_PRINTED':
        return 'Auftragsbestätigung'
      case 'INVOICED':
        return 'Rechnung gestellt'
      case 'SHIPPED':
        return 'Versendet'
      case 'CANCELLED':
        return 'Storniert'
      default:
        return status
    }
  }

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

  const getCustomerName = (order: SalesOrder) => {
    if (order.invoiceAddress?.firstName && order.invoiceAddress?.lastName) {
      return `${order.invoiceAddress.firstName} ${order.invoiceAddress.lastName}`
    }
    return `Kunde ${order.customerNumber}`
  }

  const formatAmount = (amount: string, currency: string) => {
    return parseFloat(amount).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' ' + currency
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Aufträge</h1>
        <button className="btn btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          Neuer Auftrag
        </button>
      </div>

      <div className="mt-6 flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Aufträge suchen..."
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
          Lade Aufträge...
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
                <th className="h-12 px-4 text-left align-middle font-medium">Auftrags-Nr.</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Kunde</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Auftragsdatum</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Netto-Betrag</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Brutto-Betrag</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Positionen</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Tasks</th>
                <th className="h-12 px-4 text-left align-middle font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-muted-foreground">
                    Keine Aufträge gefunden.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">{order.orderNumber}</td>
                      <td className="p-4 align-middle">
                        <div>
                          <div className="font-medium">{getCustomerName(order)}</div>
                          <div className="text-sm text-muted-foreground">Nr. {order.customerNumber}</div>
                          {order.invoiceAddress?.city && (
                            <div className="text-sm text-muted-foreground">{order.invoiceAddress.city}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(order.orderDate).toLocaleDateString('de-DE')}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          <Euro className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatAmount(order.netAmount, order.recordCurrencyName)}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          <Euro className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatAmount(order.grossAmount, order.recordCurrencyName)}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                          {order.orderItems?.length || 0} Positionen
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center">
                          <ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{order.tasks?.length || 0}</span>
                          {order.tasks && order.tasks.length > 0 && (
                            <button
                              onClick={() => toggleOrderExpansion(order.id)}
                              className="ml-2 p-1 hover:bg-muted rounded"
                            >
                              {expandedOrders.has(order.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Link href={`/orders/${order.id}`} className="text-primary hover:underline">Details</Link>
                      </td>
                    </tr>
                    
                    {/* Tasks Zeile - nur anzeigen wenn expanded */}
                    {expandedOrders.has(order.id) && (
                      <tr>
                        <td colSpan={9} className="p-0">
                          <div className="bg-muted/30 border-b">
                            <div className="p-4">
                              <h4 className="font-semibold mb-3 flex items-center">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Tasks für Auftrag {order.orderNumber}
                              </h4>
                              
                              {loadingTasks.has(order.id) ? (
                                <div className="flex items-center justify-center py-4">
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Lade Tasks...
                                </div>
                              ) : tasksData[order.id]?.length > 0 ? (
                                <div className="space-y-2">
                                  {tasksData[order.id].map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-3 bg-background rounded-md border">
                                      <div className="flex items-center space-x-3">
                                        {getTaskStatusIcon(task.status)}
                                        <div>
                                          <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                                            {task.name || `Task ${task.id}`}
                                          </Link>
                                          {task.description && (
                                            <div className="text-sm text-muted-foreground">{task.description}</div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {task.dueDate && (
                                          <div className="text-sm text-muted-foreground">
                                            Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}
                                          </div>
                                        )}
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                                          {task.status || 'OPEN'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  Keine Tasks für diesen Auftrag gefunden.
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )} 
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}