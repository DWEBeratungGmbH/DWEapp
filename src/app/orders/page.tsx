'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Calendar, RefreshCw, Euro, FileText, CheckCircle, Clock, XCircle, Truck } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { PageLayout, PageHeader, Card, KPICard } from '@/components/ui/page-layout'

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
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/orders')
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

    if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status])

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customerNumber.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ORDER_ENTRY_IN_PROGRESS': return 'badge badge-warning'
      case 'ORDER_CONFIRMATION_PRINTED': return 'badge badge-info'
      case 'INVOICED': return 'badge badge-success'
      case 'SHIPPED': return 'badge badge-info'
      case 'CANCELLED': return 'badge badge-error'
      default: return 'badge'
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

  const formatAmount = (amount: string, currency: string) => {
    return parseFloat(amount).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' ' + currency
  }

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="mb-4">Nicht eingeloggt</p>
            <button onClick={() => router.push('/')} className="btn btn-primary">
              Zum Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageLayout>
        {/* Page Header */}
        <PageHeader 
          title="Aufträge" 
          subtitle={`${filteredOrders.length} von ${orders.length} Aufträgen`}
        >
          <button className="btn btn-outline">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Neuer Auftrag
          </button>
        </PageHeader>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            icon={<FileText className="h-4 w-4" />}
            label="Gesamt"
            value={orders.length}
            description="Alle Aufträge"
            color="info"
          />
          <KPICard
            icon={<Clock className="h-4 w-4" />}
            label="In Bearbeitung"
            value={orders.filter(o => o.status === 'ORDER_ENTRY_IN_PROGRESS').length}
            description="Noch offen"
            color="warning"
          />
          <KPICard
            icon={<CheckCircle className="h-4 w-4" />}
            label="Abgeschlossen"
            value={orders.filter(o => o.status === 'INVOICED').length}
            description="Rechnung gestellt"
            color="accent"
          />
          <KPICard
            icon={<Euro className="h-4 w-4" />}
            label="Gesamtwert"
            value={orders.reduce((sum, o) => sum + parseFloat(o.netAmount || '0'), 0).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'}
            description="Netto-Summe"
            color="accent"
          />
        </div>

        {/* Search */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
            <input
              type="search"
              placeholder="Aufträge suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card>
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              Lade Aufträge...
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <div className="card" style={{ borderColor: 'var(--color-error)', background: 'rgba(255, 71, 87, 0.1)' }}>
            <strong>Fehler:</strong> {error}
          </div>
        )}

        {/* Orders Table */}
        {!loading && !error && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Auftrags-Nr.</th>
                  <th>Kunde</th>
                  <th>Status</th>
                  <th>Auftragsdatum</th>
                  <th>Netto-Betrag</th>
                  <th>Brutto-Betrag</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      {orders.length === 0 ? 'Keine Aufträge gefunden.' : 'Keine Aufträge entsprechen den Suchkriterien.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-medium">{order.orderNumber}</td>
                      <td>
                        <div className="font-medium">Kunde {order.customerNumber}</div>
                        <div className="text-sm text-muted">ID: {order.customerId}</div>
                      </td>
                      <td>
                        <span className={getStatusBadge(order.status)}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted" />
                          {new Date(order.orderDate).toLocaleDateString('de-DE')}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-muted" />
                          {formatAmount(order.netAmount, order.recordCurrencyName)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-muted" />
                          {formatAmount(order.grossAmount, order.recordCurrencyName)}
                        </div>
                      </td>
                      <td>
                        <button 
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="btn btn-ghost text-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </PageLayout>
    </DashboardLayout>
  )
}
