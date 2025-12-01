// Parties-Seite - CASCADE-konform (<200 Zeilen)

'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { 
  Building, 
  RefreshCw, 
  Users,
  Mail,
  Phone,
  Globe,
  Package
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { useWeClappParties } from '@/hooks/useWeClappData'
import type { WeClappParty } from '@/types'

export default function PartiesPage() {
  const [search, setSearch] = useState('')
  const [partyType, setPartyType] = useState('')
  const [customer, setCustomer] = useState('')
  
  const { 
    data: parties, 
    loading, 
    error,
    pagination,
    refetch,
    fetchNext,
    fetchPrevious
  } = useWeClappParties({
    filters: { 
      search, 
      partyType: partyType || undefined,
      customer: customer || undefined
    },
    autoFetch: true
  })

  // Party-Statistiken
  const stats = useMemo(() => {
    if (!parties.length) return null
    
    return {
      total: parties.length,
      organizations: parties.filter(p => p.partyType === 'ORGANIZATION').length,
      persons: parties.filter(p => p.partyType === 'PERSON').length,
      customers: parties.filter(p => p.customer).length,
      suppliers: parties.filter(p => p.supplier).length
    }
  }, [parties])

  // Tabellen-Spalten
  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Name',
      cell: (party: WeClappParty) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
            {party.partyType === 'ORGANIZATION' ? (
              <Building className="w-4 h-4 text-[var(--muted)]" />
            ) : (
              <Users className="w-4 h-4 text-[var(--muted)]" />
            )}
          </div>
          <div>
            <div className="font-medium">{party.displayName}</div>
            <div className="text-sm text-[var(--muted)]">
              {party.partyType === 'ORGANIZATION' ? 'Organisation' : 'Person'}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      header: 'Kontakt',
      cell: (party: WeClappParty) => (
        <div className="space-y-1">
          {party.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--muted)]" />
              <span>{party.email}</span>
            </div>
          )}
          {party.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[var(--muted)]" />
              <span>{party.phone}</span>
            </div>
          )}
          {party.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--muted)]" />
              <span className="text-sm">{party.website}</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'type',
      header: 'Typ',
      cell: (party: WeClappParty) => (
        <div className="flex flex-wrap gap-1">
          {party.customer && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              Kunde
            </span>
          )}
          {party.supplier && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
              Lieferant
            </span>
          )}
          {party.customerNumber && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
              {party.customerNumber}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'stats',
      header: 'Aktivität',
      cell: (party: WeClappParty) => (
        <div className="space-y-1">
          {party.stats.tasksCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-[var(--muted)]" />
              <span>{party.stats.tasksCount} Aufgaben</span>
            </div>
          )}
          {party.stats.ordersCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-[var(--muted)]" />
              <span>{party.stats.ordersCount} Aufträge</span>
            </div>
          )}
          {party.stats.timeEntriesCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-[var(--muted)]" />
              <span>{party.stats.timeEntriesCount} Zeiteinträge</span>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'lastSync',
      header: 'Letzter Sync',
      cell: (party: WeClappParty) => (
        <span className="text-sm text-[var(--muted)]">
          {party.lastSyncAt ? new Date(party.lastSyncAt).toLocaleDateString('de-DE') : 'Nie'}
        </span>
      )
    }
  ], [])

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Kunden & Lieferanten</h1>
            <p className="text-muted">{stats?.total || 0} Parteien aus WeClapp</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={refetch}
              disabled={loading}
              variant="secondary"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Button>
              <Users className="w-4 h-4" />
              Partie importieren
            </Button>
          </div>
        </div>

        {/* Statistik-Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--info)]" />
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
                  <Building className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.organizations}</div>
                    <div className="text-sm text-[var(--muted)]">Organisationen</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.persons}</div>
                    <div className="text-sm text-[var(--muted)]">Personen</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[var(--accent)]" />
                  <div>
                    <div className="text-2xl font-bold">{stats.customers}</div>
                    <div className="text-sm text-[var(--muted)]">Kunden</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[var(--warning)]" />
                  <div>
                    <div className="text-2xl font-bold">{stats.suppliers}</div>
                    <div className="text-sm text-[var(--muted)]">Lieferanten</div>
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
              placeholder="Nach Partei suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={partyType}
            onValueChange={setPartyType}
            placeholder="Typ..."
          >
            <option value="">Alle Typen</option>
            <option value="ORGANIZATION">Organisation</option>
            <option value="PERSON">Person</option>
          </Select>
          <Select
            value={customer}
            onValueChange={setCustomer}
            placeholder="Rolle..."
          >
            <option value="">Alle Rollen</option>
            <option value="true">Nur Kunden</option>
            <option value="false">Keine Kunden</option>
          </Select>
        </div>

        {/* Party-DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Parteienliste</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={parties}
              columns={columns}
              loading={loading}
              error={error}
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
