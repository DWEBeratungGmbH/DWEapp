'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Users, 
  User, 
  Edit, 
  Trash2, 
  Crown, 
  Briefcase, 
  Link2, 
  Settings, 
  Plus, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2, 
  Minus, 
  Key, 
  Copy,
  Building,
  Calendar,
  Folder,
  MessageSquare,
  FileText,
  CheckSquare,
  Link,
  Check,
  Database,
  UserCog,
  RefreshCw,
  UserPlus
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { logoColors, getRoleColor, getStatusColor, colorClasses, hoverClasses, componentStyles } from '@/lib/design-system'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DashboardLayout from '@/components/dashboard-layout'
import { PageLayout, PageHeader, KPICard } from '@/components/ui/page-layout'
import { Tabs } from '@/components/ui/tabs'
import { EntityTable } from '@/components/ui/entity-table'
import { RoleBadge } from '@/components/ui/role-badge'
import { Icon } from '@/components/ui/icon'
import { RoleEditorDialog } from '@/components/ui/role-editor-dialog'
import { InviteDialog } from '@/components/invite-dialog'
import EditUserDialog from '@/components/edit-user-dialog'
import { AVAILABLE_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, DATA_SCOPE_DESCRIPTIONS, RolePermissions } from '@/lib/permissions'

interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role: string
  department?: string
  isActive: boolean
  weClappUserId?: string
  createdAt: string
  updatedAt: string
  emailVerified?: boolean
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('users')
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([])
  const [editingRole, setEditingRole] = useState<RolePermissions | null>(null)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [permissionsLoading, setPermissionsLoading] = useState(false)

  // Rollen von API laden
  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      if (response.ok) {
        const data = await response.json()
        setRolePermissions(data.roles || [])
      } else {
        console.error('Fehler beim Laden der Rollen')
      }
    } catch (error) {
      console.error('Fehler beim Laden der Rollen:', error)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditDialog(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
      // Implement delete logic
    }
  }

  const togglePermission = (roleId: string, permissionId: string, checked: boolean) => {
    setRolePermissions(prev => prev.map(rp => {
      if (rp.roleId === roleId) {
        const permissions = checked 
          ? [...rp.permissions, permissionId]
          : rp.permissions.filter(p => p !== permissionId)
        return { ...rp, permissions }
      }
      return rp
    }))
  }

  const updateDataScope = (roleId: string, dataType: keyof RolePermissions['dataScope'], scope: string) => {
    setRolePermissions(prev => prev.map(rp => {
      if (rp.roleId === roleId) {
        return {
          ...rp,
          dataScope: {
            ...rp.dataScope,
            [dataType]: scope
          }
        }
      }
      return rp
    }))
  }

  const saveRole = async (role: RolePermissions) => {
    setPermissionsLoading(true)
    try {
      const isNew = !role.roleId
      const url = isNew ? '/api/roles' : `/api/roles/${role.roleId}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleId: role.roleId,
          roleName: role.roleName,
          permissions: role.permissions,
          dataScope: role.dataScope
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(isNew ? 'Rolle erfolgreich erstellt' : 'Rolle erfolgreich gespeichert')
        
        // Rollen neu laden
        await loadRoles()
        
        // Dialog schließen
        setShowRoleDialog(false)
        setEditingRole(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Rolle:', error)
      toast.error('Fehler beim Speichern')
    } finally {
      setPermissionsLoading(false)
    }
  }

  const deleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Rolle erfolgreich gelöscht')
        await loadRoles()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Rolle:', error)
      toast.error('Fehler beim Löschen')
    }
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.department?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    )
  })

  const tabs = [
    {
      id: 'users',
      label: 'Benutzer',
      icon: <Users className="inline-block mr-2 h-4 w-4" />,
      content: (
        <>
          {/* Admin Dashboard Cards */}
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
                <Users className="absolute left-2.5 top-2.5 h-4 w-4" style={{ color: logoColors.primary }} />
                <Input
                  placeholder="Benutzer suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                  style={{ borderColor: logoColors.primary }}
                />
              </div>
            </CardContent>
          </Card>

          {loading && (
            <div className="flex items-center justify-center rounded-md border bg-card p-8">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Lade Benutzer...
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
              <strong>Fehler:</strong> {error}
            </div>
          )}

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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <User className="h-5 w-5" style={{ color: logoColors.primary }} />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm" style={{ color: 'var(--secondary)' }}>{user.email}</div>
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
                  render: (isActive) => (
                    <div className="flex justify-center">
                      <Icon icon={isActive ? CheckCircle2 : AlertCircle} size="md" color={isActive ? 'var(--success)' : 'var(--warning)'} />
                    </div>
                  )
                },
                {
                  key: 'weClappUserId',
                  label: 'WeClapp',
                  render: (weClappUserId) => (
                    <div className="flex justify-center">
                      {weClappUserId ? (
                        <Icon icon={Link2} size="md" color="var(--success)" />
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
                edit: handleEditUser,
                delete: (user) => handleDeleteUser(user.id)
              }}
            />
          )}
        </>
      )
    },
    {
      id: 'roles',
      label: 'Rollen',
      icon: <UserCog className="inline-block mr-2 h-4 w-4" />,
      content: (
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
                    <div className="text-sm" style={{ color: 'var(--secondary)' }}>
                      {role.permissions.length} Berechtigungen
                    </div>
                  </div>
                </div>
              )
            },
            {
              key: 'users',
              label: 'Benutzer',
              render: (_, role) => (
                <div className="flex justify-center">
                  <Badge variant="outline">
                    {users.filter(u => u.role === role.roleId).length} Benutzer
                  </Badge>
                </div>
              )
            }
          ]}
          actions={{
            edit: (role) => {
              setEditingRole(role)
              setShowRoleDialog(true)
            },
            delete: (role) => {
              if (role.roleId !== 'ADMIN' && role.roleId !== 'MANAGER' && role.roleId !== 'USER') {
                if (confirm(`Möchten Sie die Rolle "${role.roleName}" wirklich löschen?`)) {
                  deleteRole(role.roleId)
                }
              }
            }
          }}
          footerActions={
            <div className="flex justify-center pt-4">
              <button
                onClick={() => {
                  setEditingRole(null)
                  setShowRoleDialog(true)
                }}
                className="btn btn-primary"
              >
                <Icon icon={Plus} size="md" className="mr-2" />
                Neue Rolle erstellen
              </button>
            </div>
          }
        />
      )
    },
    {
      id: 'api',
      label: 'API-Einstellungen',
      icon: <Database className="inline-block mr-2 h-4 w-4" />,
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              API-Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">WeClapp API</h3>
                <p className="text-sm text-muted mb-3">Konfiguration der WeClapp-API-Verbindung</p>
                <div className="space-y-3">
                  <div>
                    <Label>API Endpunkt</Label>
                    <Input placeholder="https://demo.weclapp.com/webapp/api/v1/" />
                  </div>
                  <div>
                    <Label>API Token</Label>
                    <Input type="password" placeholder="••••••••••••••••" />
                  </div>
                  <button className="btn btn-primary">
                    <Key className="h-4 w-4 mr-2" />
                    API-Verbindung testen
                  </button>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Interner API-Schlüssel</h3>
                <p className="text-sm text-muted mb-3">Für externe Integrationen und Webhooks</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input value="sk-dweapp_2024_abc123def456" readOnly />
                    <button className="btn btn-outline">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted">Erstellt am: 01.01.2024 | Läuft ab: 01.01.2025</p>
                  <button className="btn btn-secondary">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Neuen Schlüssel generieren
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ]
  const [showEditDialog, setShowEditDialog] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        setUsers(data.users || [])
      } catch (error) {
        console.error('Fehler beim Laden der Benutzer:', error)
        setError('Benutzer konnten nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status])

  const getRoleText = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'Administrator'
      case 'manager': return 'Manager'
      case 'user': return 'Benutzer'
      default: return role
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  const handleInviteSuccess = () => {
    // Benutzerliste neu laden, um neue Einladungen zu zeigen
    window.location.reload()
  }

  const changeUserRole = async (user: User, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast.success('Rolle erfolgreich geändert')
        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Rolle konnte nicht geändert werden')
      }
    } catch (error) {
      console.error('Fehler beim Ändern der Rolle:', error)
      toast.error('Rolle konnte nicht geändert werden')
    }
  }

  const toggleUserStatus = async (user: User, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Status erfolgreich geändert')
        setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !currentStatus } : u))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Status konnte nicht geändert werden')
      }
    } catch (error) {
      console.error('Fehler beim Ändern des Status:', error)
      toast.error('Status konnte nicht geändert werden')
    }
  }

  const editUser = (user: User) => {
    setEditingUser(user)
    setShowEditDialog(true)
  }

  const handleEditSuccess = () => {
    // Benutzerliste neu laden
    window.location.reload()
  }

  const deleteUser = async (user: User) => {
    // Wenn Benutzer eingeladen aber nicht aktiv ist, lösche die Einladung
    if (!user.isActive && !user.emailVerified) {
      if (confirm(`Möchten Sie die Einladung für "${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.name || user.email}" wirklich löschen?`)) {
        try {
          // Finde die Einladung für diesen Benutzer
          const response = await fetch('/api/invitations')
          const data = await response.json()
          
          if (data.success) {
            const invitation = data.invitations.find((inv: any) => inv.userId === user.id)
            
            if (invitation) {
              // Lösche die Einladung
              const deleteResponse = await fetch(`/api/invitations/${invitation.id}`, {
                method: 'DELETE'
              })
              
              if (deleteResponse.ok) {
                toast.success('Einladung erfolgreich gelöscht')
                setUsers(users.filter(u => u.id !== user.id))
              } else {
                const error = await deleteResponse.json()
                toast.error(error.error || 'Einladung konnte nicht gelöscht werden')
              }
            }
          }
        } catch (error) {
          console.error('Fehler beim Löschen der Einladung:', error)
          toast.error('Einladung konnte nicht gelöscht werden')
        }
      }
    } else {
      // Normale Benutzerlöschung für aktive Benutzer
      if (confirm(`Möchten Sie den Benutzer "${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.name || user.email}" wirklich löschen?`)) {
        try {
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          })

          if (response.ok) {
            toast.success('Benutzer erfolgreich gelöscht')
            setUsers(users.filter(u => u.id !== user.id))
          } else {
            const error = await response.json()
            toast.error(error.error || 'Benutzer konnte nicht gelöscht werden')
          }
        } catch (error) {
          console.error('Fehler beim Löschen des Benutzers:', error)
          toast.error('Benutzer konnte nicht gelöscht werden')
        }
      }
    }
  }

  // Helper function to get user status with icons
  const getUserStatus = (user: User) => {
    if (!user.isActive && !user.emailVerified) {
      return { 
        text: 'Eingeladen', 
        icon: Clock,
        color: logoColors.warning
      }
    }
    return { 
      text: user.isActive ? 'Aktiv' : 'Inaktiv', 
      icon: user.isActive ? CheckCircle2 : AlertCircle,
      color: getStatusColor('active', user.isActive)
    }
  }

  // Helper function to get role with icons
  const getRoleInfo = (role: string) => {
    return { 
      text: role === 'ADMIN' ? 'Administrator' : role === 'MANAGER' ? 'Manager' : 'Benutzer', 
      icon: role === 'ADMIN' ? Crown : role === 'MANAGER' ? Briefcase : User,
      color: getRoleColor(role)
    }
  }

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p className="mb-4">Nicht eingeloggt</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Zum Login
          </button>
        </div>
      </DashboardLayout>
    )
  }

  // Nur Admins dürfen auf diese Seite zugreifen
  if (session?.user?.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Zugriff verweigert</h2>
          <p className="text-muted-foreground">Sie benötigen Administrator-Rechte, um auf diese Seite zuzugreifen.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <PageLayout>
        <PageHeader 
          title="Administration" 
          subtitle="Systemverwaltung und Konfiguration"
        >
          <button 
            onClick={() => setShowInviteDialog(true)}
            className="btn btn-primary"
          >
            <UserPlus className="h-4 w-4" />
            Benutzer einladen
          </button>
        </PageHeader>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </PageLayout>
      
      {showInviteDialog && (
        <InviteDialog
          onClose={() => setShowInviteDialog(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
      
      {showEditDialog && (
        <EditUserDialog
          user={editingUser}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleEditSuccess}
        />
      )}
      
      {showRoleDialog && (
        <RoleEditorDialog
          role={editingRole || undefined}
          isOpen={showRoleDialog}
          onClose={() => setShowRoleDialog(false)}
          onSave={saveRole}
        />
      )}
    </DashboardLayout>
  )
}
