// Users-Seite - CASCADE-konform (<200 Zeilen)

'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Users, 
  RefreshCw, 
  UserPlus,
  Mail,
  Phone,
  Shield
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { useWeClappUsers } from '@/hooks/useWeClappData'
import type { WeClappUser } from '@/types'

export default function UsersPage() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  
  const { 
    data: users, 
    loading, 
    error,
    pagination,
    refetch,
    fetchNext,
    fetchPrevious
  } = useWeClappUsers({
    filters: { search },
    autoFetch: true
  })

  // User-Statistiken
  const stats = useMemo(() => {
    if (!users.length) return null
    
    return {
      total: users.length,
      active: users.filter(u => u.status === 'ACTIVE').length,
      inactive: users.filter(u => u.status !== 'ACTIVE').length,
      withPhone: users.filter(u => u.phoneNumber || u.mobilePhoneNumber).length
    }
  }, [users])

  // Tabellen-Spalten - kompatibel mit @tanstack/react-table
  const columns = useMemo(() => [
    {
      id: 'name',
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }: { row: { original: WeClappUser } }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-bg-tertiary rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-muted" />
            </div>
            <div>
              <div className="font-medium">{user.fullName}</div>
              <div className="text-sm text-muted">{user.title}</div>
            </div>
          </div>
        )
      }
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'E-Mail',
      cell: ({ row }: { row: { original: WeClappUser } }) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted" />
          <span>{row.original.email}</span>
        </div>
      )
    },
    {
      id: 'phone',
      accessorKey: 'phoneNumber',
      header: 'Telefon',
      cell: ({ row }: { row: { original: WeClappUser } }) => {
        const user = row.original
        return (
          <div className="space-y-1">
            {user.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted" />
                <span>{user.phoneNumber}</span>
              </div>
            )}
            {user.mobilePhoneNumber && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Phone className="w-3 h-3" />
                <span>{user.mobilePhoneNumber}</span>
              </div>
            )}
          </div>
        )
      }
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: WeClappUser } }) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            row.original.status === 'ACTIVE' ? 'bg-accent' : 'bg-error'
          }`} />
          <span className="text-sm">{row.original.status}</span>
        </div>
      )
    },
    {
      id: 'lastSync',
      accessorKey: 'lastSyncAt',
      header: 'Letzter Sync',
      cell: ({ row }: { row: { original: WeClappUser } }) => (
        <span className="text-sm text-muted">
          {row.original.lastSyncAt ? new Date(row.original.lastSyncAt).toLocaleDateString('de-DE') : 'Nie'}
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
            <h1 className="text-2xl font-bold">Benutzer</h1>
            <p className="text-muted">{stats?.total || 0} Benutzer aus WeClapp</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Debug Info für den User */}
            <div className="bg-bg-tertiary px-3 py-1 rounded text-xs">
              <span className="font-bold">Du bist: </span>
              {session?.user?.name || session?.user?.email} 
              <span className="ml-2 font-bold text-accent">[{session?.user?.role || 'Keine Rolle'}]</span>
            </div>

            <Button
              onClick={refetch}
              disabled={loading}
              variant="secondary"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

            <Button>
              <UserPlus className="w-4 h-4" />
              Benutzer importieren
            </Button>
          </div>
        </div>

        {/* Statistik-Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <Shield className="w-5 h-5 text-accent" />
                  <div>
                    <div className="text-2xl font-bold">{stats.active}</div>
                    <div className="text-sm text-[var(--muted)]">Aktiv</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-error" />
                  <div>
                    <div className="text-2xl font-bold">{stats.inactive}</div>
                    <div className="text-sm text-[var(--muted)]">Inaktiv</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[var(--accent)]" />
                  <div>
                    <div className="text-2xl font-bold">{stats.withPhone}</div>
                    <div className="text-sm text-[var(--muted)]">Mit Telefon</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suche */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Nach Benutzer suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* User-DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Benutzerliste</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={columns}
              pagination={pagination}
              onNextPage={fetchNext}
              onPreviousPage={fetchPrevious}
            />
            {error && (
              <div className="text-center py-4 text-error">{error}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
