'use client'

import { useState, useEffect } from 'react'
import { X, Save, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RolePermissions, AVAILABLE_PERMISSIONS, DATA_SCOPE_DESCRIPTIONS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions'

interface RoleEditorDialogProps {
  role?: RolePermissions
  isOpen: boolean
  onClose: () => void
  onSave: (role: RolePermissions) => void
}

export function RoleEditorDialog({ role, isOpen, onClose, onSave }: RoleEditorDialogProps) {
  const [editedRole, setEditedRole] = useState<RolePermissions>(
    role || {
      roleId: '',
      roleName: '',
      permissions: [],
      dataScope: {
        tasks: 'own',
        projects: 'own',
        users: 'own',
        orders: 'own',
        reports: 'own'
      }
    }
  )
  const [activeTab, setActiveTab] = useState<'permissions' | 'dataScope'>('permissions')

  useEffect(() => {
    if (role) {
      setEditedRole(role)
    } else {
      // Reset für neue Rolle
      setEditedRole({
        roleId: '',
        roleName: '',
        permissions: [],
        dataScope: {
          tasks: 'own',
          projects: 'own',
          users: 'own',
          orders: 'own',
          reports: 'own'
        }
      })
    }
  }, [role])

  const handleSave = () => {
    if (!editedRole.roleId || !editedRole.roleName) {
      alert('Rollen-ID und Name sind erforderlich')
      return
    }
    onSave(editedRole)
    onClose()
  }

  const handleReset = () => {
    if (role) {
      setEditedRole(DEFAULT_ROLE_PERMISSIONS[role.roleId] || editedRole)
    }
  }

  const togglePermission = (permissionId: string) => {
    setEditedRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const updateDataScope = (dataType: keyof RolePermissions['dataScope'], scope: string) => {
    setEditedRole(prev => ({
      ...prev,
      dataScope: {
        ...prev.dataScope,
        [dataType]: scope
      }
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {role ? 'Rolle bearbeiten' : 'Neue Rolle erstellen'}
          </h2>
          <button onClick={onClose} className="hover:bg-muted p-1 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Grunddaten */}
          <Card>
            <CardHeader>
              <CardTitle>Grunddaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roleId">Rollen-ID</Label>
                <Input
                  id="roleId"
                  value={editedRole.roleId}
                  onChange={(e) => setEditedRole(prev => ({ ...prev, roleId: e.target.value.toUpperCase() }))}
                  placeholder="z.B. PROJECT_MANAGER"
                  disabled={!!role} // ID nachträglich nicht änderbar
                />
              </div>
              <div>
                <Label htmlFor="roleName">Rollenname</Label>
                <Input
                  id="roleName"
                  value={editedRole.roleName}
                  onChange={(e) => setEditedRole(prev => ({ ...prev, roleName: e.target.value }))}
                  placeholder="z.B. Projektmanager"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'permissions'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-secondary'
                }`}
                style={{
                  borderBottomColor: activeTab === 'permissions' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'permissions' ? 'var(--accent)' : 'var(--muted)'
                }}
              >
                Berechtigungen
              </button>
              <button
                onClick={() => setActiveTab('dataScope')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dataScope'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-secondary'
                }`}
                style={{
                  borderBottomColor: activeTab === 'dataScope' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'dataScope' ? 'var(--accent)' : 'var(--muted)'
                }}
              >
                Daten-Scope
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              {/* Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle>Navigation - Bereiche sichtbar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {AVAILABLE_PERMISSIONS.filter(p => p.category === 'navigation').map(permission => (
                    <label key={permission.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedRole.permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="form-checkbox"
                      />
                      <div>
                        <span className="font-medium">{permission.name}</span>
                        <span className="text-sm text-muted ml-2">{permission.description}</span>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Aktionen */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktionen - Was darf die Rolle tun?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {AVAILABLE_PERMISSIONS.filter(p => p.category === 'actions').map(permission => (
                    <label key={permission.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedRole.permissions.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="form-checkbox"
                      />
                      <div>
                        <span className="font-medium">{permission.name}</span>
                        <span className="text-sm text-muted ml-2">{permission.description}</span>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'dataScope' && (
            <Card>
              <CardHeader>
                <CardTitle>Daten-Scope - Welche Daten sind sichtbar?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(editedRole.dataScope).map(([dataType, scope]) => (
                  <div key={dataType} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{dataType}</span>
                    <select
                      value={scope}
                      onChange={(e) => updateDataScope(dataType as keyof RolePermissions['dataScope'], e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="own">{DATA_SCOPE_DESCRIPTIONS.own}</option>
                      <option value="assigned">{DATA_SCOPE_DESCRIPTIONS.assigned}</option>
                      <option value="team">{DATA_SCOPE_DESCRIPTIONS.team}</option>
                      <option value="all">{DATA_SCOPE_DESCRIPTIONS.all}</option>
                    </select>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/50">
          <div className="flex gap-2">
            <button onClick={handleReset} className="px-3 py-2 border rounded hover:bg-muted">
              <RotateCcw className="h-4 w-4 mr-2" />
              Zurücksetzen
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-2 border rounded hover:bg-muted">
              Abbrechen
            </button>
            <button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
