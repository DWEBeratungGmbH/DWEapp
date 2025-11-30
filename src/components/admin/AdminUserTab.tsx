// Admin Benutzer-Tab
// Zeigt Benutzer-KPIs, Suche und Tabelle

'use client'

import { Users, User, CheckCircle2, Crown, Link2, Loader2, Minus, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { KPICard } from '@/components/ui/page-layout'
import { EntityTable } from '@/components/ui/entity-table'
import { RoleBadge } from '@/components/ui/role-badge'
import { Icon } from '@/components/ui/icon'
import type { User as UserType } from '@/hooks/useAdminData'

interface AdminUserTabProps {
  users: UserType[]
  filteredUsers: UserType[]
  loading: boolean
  error: string | null
  searchTerm: string
  onSearchChange: (term: string) => void
  onEditUser: (user: UserType) => void
  onDeleteUser: (user: UserType) => void
}

export function AdminUserTab({
  users,
  filteredUsers,
  loading,
  error,
  searchTerm,
  onSearchChange,
  onEditUser,
  onDeleteUser
}: AdminUserTabProps) {
  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          icon={<Users className="h-4 w-4" />}
          label="Gesamtbenutzer"
          value={users.length}
          description="Registrierte Benutzer"
          color="info"
        />
        <KPICard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Aktive Benutzer"
          value={users.filter(u => u.isActive).length}
          description="Derzeit aktiv"
          color="accent"
        />
        <KPICard
          icon={<Crown className="h-4 w-4" />}
          label="Administratoren"
          value={users.filter(u => u.role === 'ADMIN').length}
          description="Mit Admin-Rechten"
          color="warning"
        />
        <KPICard
          icon={<Link2 className="h-4 w-4" />}
          label="WeClapp Verknüpft"
          value={users.filter(u => u.weClappUserId).length}
          description="Mit WeClapp verbunden"
          color="default"
        />
      </div>

      {/* Suchleiste */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
            <Input
              placeholder="Benutzer suchen..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center rounded-md border bg-card p-8">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Lade Benutzer...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-md border p-4 bg-[rgba(220,38,38,0.1)] border-[var(--error)] text-[var(--error)]">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {/* Benutzer-Tabelle */}
      {!loading && !error && (
        <EntityTable
          data={filteredUsers}
          title="Benutzerverwaltung"
          titleIcon={<Users className="h-5 w-5" />}
          emptyMessage="Keine Benutzer gefunden"
          columns={[
            {
              key: 'user',
              label: 'Benutzer',
              render: (_, user) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-muted)]">
                    <User className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.name || user.email}
                    </div>
                    <div className="text-sm text-secondary">{user.email}</div>
                  </div>
                </div>
              )
            },
            {
              key: 'role',
              label: 'Rolle',
              render: (role) => (
                <div className="flex items-center justify-center gap-2">
                  <RoleBadge role={role} />
                </div>
              )
            },
            {
              key: 'status',
              label: 'Status',
              render: (_, user) => {
                const status = getUserStatus(user)
                return (
                  <div className="flex justify-center">
                    <Icon 
                      icon={status.icon} 
                      size="md" 
                      color={status.color} 
                    />
                  </div>
                )
              }
            },
            {
              key: 'weClappUserId',
              label: 'WeClapp',
              render: (weClappUserId) => (
                <div className="flex justify-center">
                  {weClappUserId ? (
                    <Icon icon={Link2} size="md" color="var(--accent)" />
                  ) : (
                    <Icon icon={Minus} size="md" color="var(--muted)" />
                  )}
                </div>
              )
            },
            {
              key: 'createdAt',
              label: 'Erstellt am',
              render: (createdAt) => (
                <div className="text-sm text-center">
                  {new Date(createdAt).toLocaleDateString('de-DE')}
                </div>
              )
            }
          ]}
          actions={{
            edit: onEditUser,
            delete: onDeleteUser
          }}
        />
      )}
    </>
  )
}

// Helper: Benutzer-Status ermitteln
function getUserStatus(user: UserType) {
  if (!user.isActive && !user.emailVerified) {
    return {
      text: 'Eingeladen',
      icon: Clock,
      color: 'var(--warning)'
    }
  }
  return {
    text: user.isActive ? 'Aktiv' : 'Inaktiv',
    icon: user.isActive ? CheckCircle2 : AlertCircle,
    color: user.isActive ? 'var(--accent)' : 'var(--warning)'
  }
}
