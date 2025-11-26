"use client"

import React, { useEffect, useState } from 'react'
import { ClipboardList, Plus, Search, Filter, Calendar, RefreshCw, Euro, User, FileText, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  orderDate: number
  status: string
  customerId: string
  customerNumber: string
  netAmount: string
  grossAmount: string
  recordCurrencyName: string
  description?: string
  invoiceAddress?: {
    firstName?: string
    lastName?: string
    city?: string
    street1?: string
    zipcode?: string
    countryCode?: string
  }
  orderItems?: Array<{
    id: string
    title: string
    quantity: string
    unitPrice: string
    articleNumber?: string
    description?: string
  }>
}

interface Task {
  id: string
  name: string
  status: string
  priority: string
  dueDate?: number
  assignedUser?: string
  assignedUserId?: string
  description?: string
  estimatedHours?: number
  actualHours?: number
  createdDate?: number
  orderId?: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())
  const [tasksData, setTasksData] = useState<Record<string, Task[]>>({})
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set())
  const [userRole, setUserRole] = useState<string>('employee')
  const [userId, setUserId] = useState<string>('')
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        // API Call mit Rollen-Filter
        const response = await fetch(`/api/orders?userId=${userId}&userRole=${userRole}`)
        
        if (!response.ok) {
          throw new Error('Aufträge konnten nicht geladen werden')
        }
        
        const data = await response.json()
        setOrders(data.orders || [])
        setError(null)
      } catch (err: any) {
        console.error('Fehler beim Abrufen der Aufträge:', err)
        setError(`Konnte die Aufträge nicht laden: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [userId, userRole])

  const fetchTasksForOrder = async (orderId: string) => {
    if (tasksData[orderId] || loadingTasks.has(orderId)) {
      return
    }

    setLoadingTasks(prev => new Set(prev).add(orderId))
    
    try {
      const response = await fetch(`/api/orders/${orderId}/tasks`)
      
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

  // Filter Logik
  const filteredOrders = orders.filter(order => {
    // Suchfilter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const customerName = order.invoiceAddress?.firstName && order.invoiceAddress?.lastName 
        ? `${order.invoiceAddress.firstName} ${order.invoiceAddress.lastName}`.toLowerCase()
        : `kunde ${order.customerNumber}`.toLowerCase()
      
      if (!order.orderNumber.toLowerCase().includes(searchLower) &&
          !customerName.includes(searchLower) &&
          !order.customerNumber.includes(searchLower)) {
        return false
      }
    }

    // Statusfilter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false
    }

    // Datumsfilter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.orderDate)
      const today = new Date()
      
      switch (dateFilter) {
        case 'today':
          if (orderDate.toDateString() !== today.toDateString()) return false
          break
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (orderDate < weekAgo) return false
          break
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (orderDate < monthAgo) return false
          break
      }
    }

    return true
  })

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
      case 'ORDER_ENTRY_IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'ORDER_CONFIRMATION_PRINTED': return 'bg-blue-100 text-blue-800'
      case 'INVOICED': return 'bg-green-100 text-green-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ORDER_ENTRY_IN_PROGRESS': return 'In Bearbeitung'
      case 'ORDER_CONFIRMATION_PRINTED': return 'Auftragsbestätigung'
      case 'INVOICED': return 'Rechnung gestellt'
      case 'SHIPPED': return 'Versendet'
      case 'CANCELLED': return 'Storniert'
      default: return status
    }
  }

  const getCustomerName = (order: Order) => {
    if (order.invoiceAddress?.firstName && order.invoiceAddress?.lastName) {
      return `${order.invoiceAddress.firstName} ${order.invoiceAddress.lastName}`
    }
    return `Kunde ${order.customerNumber}`
  }

  const formatAmount = (amount: string, currency: string) => {
    return parseFloat(amount).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' ' + currency
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setDateFilter('all')
  }

  const activeFiltersCount = [
    searchTerm ? 'search' : null,
    statusFilter !== 'all' ? 'status' : null,
    dateFilter !== 'all' ? 'date' : null
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Aufträge</h1>
          <p className="text-muted-foreground">
            {filteredOrders.length} von {orders.length} Aufträgen
          </p>
        </div>
        {(userRole === 'admin' || userRole === 'manager') && (
          <button className="btn btn-primary">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Auftrag
          </button>
        )}
      </div>

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
              placeholder="Aufträge suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-8"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">Alle Status</option>
                <option value="ORDER_ENTRY_IN_PROGRESS">In Bearbeitung</option>
                <option value="ORDER_CONFIRMATION_PRINTED">Auftragsbestätigung</option>
                <option value="INVOICED">Rechnung gestellt</option>
                <option value="SHIPPED">Versendet</option>
                <option value="CANCELLED">Storniert</option>
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
              </select>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center rounded-md border bg-card p-8">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Lade Aufträge...
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-muted-foreground">
                    {orders.length === 0 ? 'Keine Aufträge gefunden.' : 'Keine Aufträge entsprechen den Filterkriterien.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
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
                          <span className="font-medium">{tasksData[order.id]?.length || 0}</span>
                          {tasksData[order.id] && tasksData[order.id].length > 0 && (
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
                                        <div>
                                          <div className="font-medium">{task.name}</div>
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
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                          task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
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