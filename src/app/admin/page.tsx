// Admin-Seite
// Schlanker Wrapper für Tab-Komponenten

'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users, UserCog, Database, UserPlus, Loader2, AlertCircle } from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { PageLayout, PageHeader } from '@/components/ui/page-layout'
import { Tabs } from '@/components/ui/tabs'
import { RoleEditorDialog } from '@/components/ui/role-editor-dialog'
import { InviteDialog } from '@/components/invite'
import { EditUserDialog } from '@/components/user'
import { AdminUserTab, AdminRoleTab, AdminApiTab } from '@/components/admin'
import { useAdminData, type User } from '@/hooks/useAdminData'
import { RolePermissions } from '@/lib/permissions'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Admin-Daten Hook
  const {
    users,
    loading,
    error,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    rolePermissions,
    deleteUser,
    saveRole,
    deleteRole,
    reloadUsers
  } = useAdminData()

  // UI State
  const [activeTab, setActiveTab] = useState('users')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingRole, setEditingRole] = useState<RolePermissions | null>(null)

  // Benutzer bearbeiten
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditDialog(true)
  }

  // Rolle bearbeiten
  const handleEditRole = (role: RolePermissions) => {
    setEditingRole(role)
    setShowRoleDialog(true)
  }

  // Rolle löschen
  const handleDeleteRole = async (role: RolePermissions) => {
    await deleteRole(role.roleId)
  }

  // Neue Rolle erstellen
  const handleCreateRole = () => {
    setEditingRole(null)
    setShowRoleDialog(true)
  }

  // Rolle speichern
  const handleSaveRole = async (role: RolePermissions) => {
    const success = await saveRole(role)
    if (success) {
      setShowRoleDialog(false)
      setEditingRole(null)
    }
  }

  // Einladung erfolgreich
  const handleInviteSuccess = () => {
    reloadUsers()
    setShowInviteDialog(false)
  }

  // Benutzer bearbeiten erfolgreich
  const handleEditSuccess = () => {
    reloadUsers()
    setShowEditDialog(false)
  }

  // Tabs Definition
  const tabs = [
    {
      id: 'users',
      label: 'Benutzer',
      icon: <Users className="inline-block mr-2 h-4 w-4" />,
      content: (
        <AdminUserTab
          users={users}
          filteredUsers={filteredUsers}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditUser={handleEditUser}
          onDeleteUser={deleteUser}
        />
      )
    },
    {
      id: 'roles',
      label: 'Rollen',
      icon: <UserCog className="inline-block mr-2 h-4 w-4" />,
      content: (
        <AdminRoleTab
          rolePermissions={rolePermissions}
          users={users}
          onEditRole={handleEditRole}
          onDeleteRole={handleDeleteRole}
          onCreateRole={handleCreateRole}
        />
      )
    },
    {
      id: 'api',
      label: 'API-Einstellungen',
      icon: <Database className="inline-block mr-2 h-4 w-4" />,
      content: <AdminApiTab />
    }
  ]

  // Loading State
  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  // Unauthenticated State
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

  // Admin-Check
  if (session?.user?.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-[var(--warning)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Zugriff verweigert</h2>
          <p className="text-muted">
            Du benötigst Administrator-Rechte, um auf diese Seite zuzugreifen.
          </p>
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

      {/* Dialoge */}
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
          onSave={handleSaveRole}
        />
      )}
    </DashboardLayout>
  )
}
