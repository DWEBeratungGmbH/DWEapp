'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { 
  Package, 
  RefreshCw, 
  Plus,
  Euro,
  CheckCircle,
  Truck,
  Calendar,
  User,
  FileText
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { useWeClappOrders } from '@/hooks/useWeClappData'
import type { WeClappOrder } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  
  const { 
    data: orders, 
    loading, 
    error,
    pagination,
    refetch,
    fetchNext,
    fetchPrevious
  } = useWeClappOrders({
    filters: { 
      search, 
      status: status || undefined
    },
    autoFetch: true
  })

  // Order-Statistiken
  const stats = useMemo(() => {
    if (!orders.length) return null
    
    return {
      total: orders.length,
      invoiced: orders.filter(o => o.invoiced).length,
      paid: orders.filter(o => o.paid).length,
      shipped: orders.filter(o => o.shipped).length,
      totalAmount: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    }
  }, [orders])

  // Tabellen-Spalten
  const columns: ColumnDef<WeClappOrder>[] = useMemo(() => [
    {
      accessorKey: 'orderNumber',
      header: 'Auftragsnummer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.orderNumber || '-'}</div>
          {row.original.orderNumberAtCustomer && (
            <div className="text-sm text-[var(--muted)]">
              Kunde: {row.original.orderNumberAtCustomer}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'customer',
      header: 'Kunde',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-[var(--muted)]" />
          </div>
          <div>
            <div className="font-medium">
              {row.original.customer?.company || 
               `${row.original.customer?.firstName || ''} ${row.original.customer?.lastName || ''}`.trim() || 
               'Unbekannt'}
            </div>
            {row.original.customer?.customerNumber && (
              <div className="text-sm text-[var(--muted)]">
                {row.original.customer.customerNumber}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'totalAmount',
      header: 'Betrag',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">
            {row.original.totalAmount ? 
              new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: row.original.currency || 'EUR'
              }).format(row.original.totalAmount) : 
              '-'
            }
          </div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.invoiced && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Rechnung
            </span>
          )}
          {row.original.paid && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Bezahlt
            </span>
          )}
          {row.original.shipped && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Versendet
            </span>
          )}
          {row.original.servicesFinished && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Erledigt
            </span>
          )}
        </div>
      )
    },
    {
      id: 'dates',
      header: 'Datum',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-[var(--muted)]" />
            <span>
              {row.original.orderDate ? 
                new Date(row.original.orderDate).toLocaleDateString('de-DE') : 
                '-'
              }
            </span>
          </div>
          {row.original.plannedProjectStartDate && (
            <div className="text-xs text-[var(--muted)]">
              Projekt: {new Date(row.original.plannedProjectStartDate).toLocaleDateString('de-DE')}
            </div>
          )}
        </div>
      )
    }
  ], [])

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Aufträge</h1>
            <p className="text-muted">{stats?.total || 0} Aufträge aus WeClapp</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => refetch()}
              disabled={loading}
              variant="secondary"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Button>
              <Plus className="w-4 h-4" />
              Auftrag importieren
            </Button>
          </div>
        </div>

        {/* Statistik-Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[var(--info)]" />
                  <div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-[var(--muted)]">Gesamt</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.invoiced}</div>
                    <div className="text-sm text-[var(--muted)]">Rechnungen</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.paid}</div>
                    <div className="text-sm text-[var(--muted)]">Bezahlt</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.shipped}</div>
                    <div className="text-sm text-[var(--muted)]">Versendet</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-[var(--accent)]" />
                  <div>
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR'
                      }).format(stats.totalAmount)}
                    </div>
                    <div className="text-sm text-[var(--muted)]">Gesamtwert</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Nach Auftrag suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="invoiced">Rechnung</SelectItem>
              <SelectItem value="paid">Bezahlt</SelectItem>
              <SelectItem value="shipped">Versendet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order-DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Auftragsliste</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={orders}
              columns={columns}
              pagination={pagination}
              onNextPage={fetchNext}
              onPreviousPage={fetchPrevious}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
