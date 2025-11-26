"use client"

import React, { useEffect, useState } from 'react'
import { ArrowLeft, Save, RefreshCw, Calendar, Euro, User, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TaskManagement from '@/components/TaskManagement'

interface OrderDetail {
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

interface OrderTask {
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
  orderId: string // orderId hinzugefügt
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [tasks, setTasks] = useState<OrderTask[]>([])
  const [taskStats, setTaskStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<OrderDetail>>({})
  const [userRole, setUserRole] = useState<string>('employee')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${id}`)
        
        if (!response.ok) {
          throw new Error('Auftrag konnte nicht geladen werden')
        }
        
        const data = await response.json()
        setOrder(data.result)
        setFormData({
          description: data.result.description || '',
          // Weitere Felder hier hinzufügen, die bearbeitbar sein sollen
        })
      } catch (err: any) {
        console.error('Fehler beim Laden des Auftrags:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchTasks = async () => {
      try {
        setTasksLoading(true)
        const response = await fetch(`/api/orders/${id}/tasks`)
        
        if (!response.ok) {
          throw new Error('Aufgaben konnten nicht geladen werden')
        }
        
        const data = await response.json()
        // Tasks mit orderId anreichern
        const tasksWithOrderId = (data.result || []).map((task: OrderTask) => ({
          ...task,
          orderId: id
        }))
        setTasks(tasksWithOrderId)
        setTaskStats(data.stats)
      } catch (err: any) {
        console.error('Fehler beim Laden der Aufgaben:', err)
      } finally {
        setTasksLoading(false)
      }
    }

    fetchOrder()
    fetchTasks()
  }, [id])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description,
          // Weitere Felder hier hinzufügen
        }),
      })

      if (!response.ok) {
        throw new Error('Speichern fehlgeschlagen')
      }

      const updatedOrder = await response.json()
      setOrder(updatedOrder.result)
      alert('Auftrag erfolgreich aktualisiert!')
    } catch (err: any) {
      console.error('Fehler beim Speichern:', err)
      alert('Fehler beim Speichern: ' + err.message)
    } finally {
      setSaving(false)
    }
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'TODO':
      case 'OPEN': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-orange-100 text-orange-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatAmount = (amount: string, currency: string) => {
    return parseFloat(amount).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' ' + currency
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
        <span>Lade Auftragsdetails...</span>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800 mb-4">
          <strong>Fehler:</strong> {error || 'Auftrag nicht gefunden'}
        </div>
        <Link href="/orders" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/orders" className="btn btn-ghost">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Auftrag {order.orderNumber}</h1>
            <div className="text-sm text-muted-foreground">
              Erstellt am {new Date(order.orderDate).toLocaleDateString('de-DE')}
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary flex items-center"
        >
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Speichern
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Linke Spalte - Details & Bearbeitung */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <User className="mr-2 h-5 w-5 text-muted-foreground" />
              Kundeninformationen
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-muted-foreground">Kunde</div>
                <div className="col-span-2 font-medium">
                  {order.invoiceAddress?.firstName} {order.invoiceAddress?.lastName}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-muted-foreground">Kundennummer</div>
                <div className="col-span-2">{order.customerNumber}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-muted-foreground">Adresse</div>
                <div className="col-span-2 text-sm">
                  {order.invoiceAddress?.street1}<br />
                  {order.invoiceAddress?.zipcode} {order.invoiceAddress?.city}<br />
                  {order.invoiceAddress?.countryCode}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
              Beschreibung & Notizen
            </h2>
            <div className="space-y-2">
              <label className="text-sm font-medium">Beschreibung</label>
              <textarea
                className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beschreibung eingeben..."
              />
            </div>
          </div>
        </div>

        {/* Rechte Spalte - Finanzen & Positionen */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Euro className="mr-2 h-5 w-5 text-muted-foreground" />
              Finanzübersicht
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Netto Betrag</span>
                <span className="font-medium">{formatAmount(order.netAmount, order.recordCurrencyName)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Brutto Betrag</span>
                <span className="font-bold text-lg">{formatAmount(order.grossAmount, order.recordCurrencyName)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-muted-foreground" />
              Positionen ({order.orderItems?.length || 0})
            </h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {order.orderItems?.map((item) => (
                <div key={item.id} className="flex justify-between items-start p-3 rounded-md border bg-muted/20">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.articleNumber}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatAmount(item.unitPrice, order.recordCurrencyName)}</div>
                    <div className="text-sm text-muted-foreground">{parseFloat(item.quantity).toLocaleString('de-DE')} Stk</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Aufgaben Section */}
      <div className="mt-8">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-muted-foreground" />
            Aufgaben zum Auftrag
          </h2>
          
          {/* Task Statistics */}
          {taskStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
                <div className="text-sm text-blue-600">Gesamt</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                <div className="text-sm text-green-600">Erledigt</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{taskStats.inProgress}</div>
                <div className="text-sm text-yellow-600">In Arbeit</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
                <div className="text-sm text-red-600">Überfällig</div>
              </div>
            </div>
          )}

          {/* Tasks List */}
          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
              <span>Lade Aufgaben...</span>
            </div>
          ) : (
            <TaskManagement
              tasks={tasks}
              orderId={id}
              onTasksUpdate={setTasks}
              userRole={userRole}
              userId={userId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
