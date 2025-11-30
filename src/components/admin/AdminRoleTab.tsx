// Admin Rollen-Tab
// Zeigt Rollen-Tabelle mit Berechtigungen

'use client'

import { UserCog, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EntityTable } from '@/components/ui/entity-table'
import { RoleBadge } from '@/components/ui/role-badge'
import { Icon } from '@/components/ui/icon'
import { RolePermissions } from '@/lib/permissions'
import type { User } from '@/hooks/useAdminData'

interface AdminRoleTabProps {
  rolePermissions: RolePermissions[]
  users: User[]
  onEditRole: (role: RolePermissions) => void
  onDeleteRole: (role: RolePermissions) => void
  onCreateRole: () => void
}

export function AdminRoleTab({
  rolePermissions,
  users,
  onEditRole,
  onDeleteRole,
  onCreateRole
}: AdminRoleTabProps) {
  // Prüfen ob Rolle löschbar ist (Standard-Rollen nicht)
  const canDeleteRole = (roleId: string) => {
    return roleId !== 'ADMIN' && roleId !== 'MANAGER' && roleId !== 'USER'
  }

  return (
    <EntityTable
      data={rolePermissions}
      title="Rollenverwaltung"
      titleIcon={<UserCog className="h-5 w-5" />}
      emptyMessage="Keine Rollen gefunden"
      columns={[
        {
          key: 'role',
          label: 'Rolle',
          render: (_, role) => (
            <div className="flex items-center gap-3">
              <RoleBadge role={role.roleId} />
              <div>
                <div className="font-medium">{role.roleName}</div>
                <div className="text-sm text-secondary">
                  {role.permissions.length} Berechtigungen
                </div>
              </div>
            </div>
          )
        },
        {
          key: 'users',
          label: 'Benutzer',
          render: (_, role) => {
            const count = users.filter(u => u.role === role.roleId).length
            return (
              <div className="flex justify-center">
                <Badge variant="outline">
                  {count} Benutzer
                </Badge>
              </div>
            )
          }
        },
        {
          key: 'permissions',
          label: 'Berechtigungen',
          render: (_, role) => (
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-[var(--accent-muted)]">
                {role.permissions.length}
              </Badge>
            </div>
          )
        }
      ]}
      actions={{
        edit: onEditRole,
        delete: (role) => {
          if (canDeleteRole(role.roleId)) {
            if (confirm(`Möchtest du die Rolle "${role.roleName}" wirklich löschen?`)) {
              onDeleteRole(role)
            }
          }
        }
      }}
      footerActions={
        <div className="flex justify-center pt-4">
          <button
            onClick={onCreateRole}
            className="btn btn-primary"
          >
            <Icon icon={Plus} size="md" className="mr-2" />
            Neue Rolle erstellen
          </button>
        </div>
      }
    />
  )
}
