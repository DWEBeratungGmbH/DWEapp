// Admin-Daten Hook
// Enthält alle State- und API-Logik für die Admin-Seite

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { RolePermissions } from '@/lib/permissions'

export interface User {
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

interface UseAdminDataResult {
  // Benutzer
  users: User[]
  loading: boolean
  error: string | null
  filteredUsers: User[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  
  // Rollen
  rolePermissions: RolePermissions[]
  permissionsLoading: boolean
  
  // Actions
  changeUserRole: (user: User, newRole: string) => Promise<void>
  toggleUserStatus: (user: User) => Promise<void>
  deleteUser: (user: User) => Promise<void>
  saveRole: (role: RolePermissions) => Promise<boolean>
  deleteRole: (roleId: string) => Promise<void>
  reloadUsers: () => Promise<void>
  reloadRoles: () => Promise<void>
}

export function useAdminData(): UseAdminDataResult {
  // Benutzer State
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Rollen State
  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([])
  const [permissionsLoading, setPermissionsLoading] = useState(false)

  // Benutzer laden
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data.users || [])
      setError(null)
    } catch (err) {
      console.error('Fehler beim Laden der Benutzer:', err)
      setError('Benutzer konnten nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }, [])

  // Rollen laden
  const loadRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/roles')
      if (response.ok) {
        const data = await response.json()
        setRolePermissions(data.roles || [])
      }
    } catch (err) {
      console.error('Fehler beim Laden der Rollen:', err)
    }
  }, [])

  // Initial laden
  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [loadUsers, loadRoles])

  // Gefilterte Benutzer
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.department?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower)
    )
  })

  // Benutzer-Rolle ändern
  const changeUserRole = async (user: User, newRole: string) => {
    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast.success('Rolle erfolgreich geändert')
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Rolle konnte nicht geändert werden')
      }
    } catch (err) {
      console.error('Fehler beim Ändern der Rolle:', err)
      toast.error('Rolle konnte nicht geändert werden')
    }
  }

  // Benutzer-Status umschalten
  const toggleUserStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        toast.success('Status erfolgreich geändert')
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Status konnte nicht geändert werden')
      }
    } catch (err) {
      console.error('Fehler beim Ändern des Status:', err)
      toast.error('Status konnte nicht geändert werden')
    }
  }

  // Benutzer löschen
  const deleteUser = async (user: User) => {
    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim() 
      : user.name || user.email

    // Eingeladener aber nicht aktiver Benutzer
    if (!user.isActive && !user.emailVerified) {
      if (!confirm(`Möchtest du die Einladung für "${userName}" wirklich löschen?`)) return

      try {
        const response = await fetch('/api/invitations')
        const data = await response.json()

        if (data.success) {
          const invitation = data.invitations.find((inv: any) => inv.userId === user.id)

          if (invitation) {
            const deleteResponse = await fetch(`/api/invitations/${invitation.id}`, {
              method: 'DELETE'
            })

            if (deleteResponse.ok) {
              toast.success('Einladung erfolgreich gelöscht')
              setUsers(prev => prev.filter(u => u.id !== user.id))
            } else {
              const error = await deleteResponse.json()
              toast.error(error.error || 'Einladung konnte nicht gelöscht werden')
            }
          }
        }
      } catch (err) {
        console.error('Fehler beim Löschen der Einladung:', err)
        toast.error('Einladung konnte nicht gelöscht werden')
      }
    } else {
      // Aktiver Benutzer
      if (!confirm(`Möchtest du den Benutzer "${userName}" wirklich löschen?`)) return

      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })

        if (response.ok) {
          toast.success('Benutzer erfolgreich gelöscht')
          setUsers(prev => prev.filter(u => u.id !== user.id))
        } else {
          const error = await response.json()
          toast.error(error.error || 'Benutzer konnte nicht gelöscht werden')
        }
      } catch (err) {
        console.error('Fehler beim Löschen des Benutzers:', err)
        toast.error('Benutzer konnte nicht gelöscht werden')
      }
    }
  }

  // Rolle speichern
  const saveRole = async (role: RolePermissions): Promise<boolean> => {
    setPermissionsLoading(true)
    try {
      const isNew = !role.roleId
      const url = isNew ? '/api/roles' : `/api/roles/${role.roleId}`
      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: role.roleId,
          roleName: role.roleName,
          permissions: role.permissions,
          dataScope: role.dataScope
        }),
      })

      if (response.ok) {
        toast.success(isNew ? 'Rolle erfolgreich erstellt' : 'Rolle erfolgreich gespeichert')
        await loadRoles()
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Fehler beim Speichern')
        return false
      }
    } catch (err) {
      console.error('Fehler beim Speichern der Rolle:', err)
      toast.error('Fehler beim Speichern')
      return false
    } finally {
      setPermissionsLoading(false)
    }
  }

  // Rolle löschen
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
    } catch (err) {
      console.error('Fehler beim Löschen der Rolle:', err)
      toast.error('Fehler beim Löschen')
    }
  }

  return {
    // Benutzer
    users,
    loading,
    error,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    
    // Rollen
    rolePermissions,
    permissionsLoading,
    
    // Actions
    changeUserRole,
    toggleUserStatus,
    deleteUser,
    saveRole,
    deleteRole,
    reloadUsers: loadUsers,
    reloadRoles: loadRoles
  }
}
