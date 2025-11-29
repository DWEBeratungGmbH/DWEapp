'use client'

import { ReactNode, useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Plus, Crown, Briefcase, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RolePermissions } from '@/lib/permissions'

interface RoleTableProps {
  roles: RolePermissions[]
  userCounts: Record<string, number>
  onEdit: (role: RolePermissions) => void
  onDelete: (roleId: string) => void
  onCreate: () => void
}

export function RoleTable({ roles, userCounts, onEdit, onDelete, onCreate }: RoleTableProps) {
  const [showActions, setShowActions] = useState<string | null>(null)

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'ADMIN': return <Crown className="h-4 w-4" />
      case 'MANAGER': return <Briefcase className="h-4 w-4" />
      case 'USER': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'ADMIN': return 'text-warning'
      case 'MANAGER': return 'text-info'
      case 'USER': return 'text-secondary'
      default: return 'text-secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Rollenverwaltung
          </CardTitle>
          <button onClick={onCreate} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Neue Rolle
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.map((role) => (
            <div
              key={role.roleId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--warning)' }} className={getRoleColor(role.roleId)}>
                  {getRoleIcon(role.roleId)}
                </div>
                <div>
                  <h3 className="font-medium">{role.roleName}</h3>
                  <p className="text-sm" style={{ color: 'var(--secondary)' }}>
                    {role.permissions.length} Berechtigungen • {Object.keys(role.dataScope).length} Daten-Scope
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {userCounts[role.roleId] || 0} Benutzer
                </Badge>
                
                <div className="relative">
                  <button
                    onClick={() => setShowActions(showActions === role.roleId ? null : role.roleId)}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  
                  {showActions === role.roleId && (
                    <div className="absolute right-0 top-8 z-10 w-48 bg-popover border rounded-md shadow-lg">
                      <div className="p-1">
                        <button
                          onClick={() => {
                            onEdit(role)
                            setShowActions(null)
                          }}
                          className="w-full justify-start h-8 px-2 hover:bg-muted"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Bearbeiten
                        </button>
                        {role.roleId !== 'ADMIN' && role.roleId !== 'MANAGER' && role.roleId !== 'USER' && (
                          <button
                            onClick={() => {
                              onDelete(role.roleId)
                              setShowActions(null)
                            }}
                            className="w-full justify-start h-8 px-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Löschen
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
