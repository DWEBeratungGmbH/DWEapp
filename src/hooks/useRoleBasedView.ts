// Rollen-basierte Ansicht Hook
// Zentrale Logik für USER/MANAGER/ADMIN Ansichten

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

export type ViewMode = 'USER' | 'MANAGER' | 'ADMIN'

export interface RoleBasedView {
  viewMode: ViewMode
  isAdmin: boolean
  isManager: boolean
  isUser: boolean
  canViewAllTasks: boolean
  canViewTeamTasks: boolean
  canViewOwnTasks: boolean
  canManageUsers: boolean
  canManageRoles: boolean
  canViewReports: boolean
  allowedRoutes: string[]
}

export function useRoleBasedView(): RoleBasedView {
  const { data: session } = useSession()
  const userRole = session?.user?.role as string || 'USER'

  const viewConfig = useMemo(() => {
    const isAdmin = userRole === 'ADMIN'
    const isManager = userRole === 'MANAGER'
    const isUser = userRole === 'USER'

    return {
      viewMode: userRole as ViewMode,
      isAdmin,
      isManager,
      isUser,
      
      // Berechtigungen
      canViewAllTasks: isAdmin,
      canViewTeamTasks: isManager || isAdmin,
      canViewOwnTasks: true, // Alle können eigene Aufgaben sehen
      
      canManageUsers: isAdmin,
      canManageRoles: isAdmin,
      canViewReports: isManager || isAdmin,
      
      // Erlaubte Routen
      allowedRoutes: [
        '/',
        '/tasks',
        '/time',
        '/settings',
        ...(isManager || isAdmin ? ['/team'] : []),
        ...(isAdmin ? ['/admin'] : []),
        ...(isAdmin ? ['/projects'] : [])
      ]
    }
  }, [userRole])

  return viewConfig
}

// Helper für Route-Check
export function useRouteAccess(route: string): boolean {
  const { allowedRoutes } = useRoleBasedView()
  return allowedRoutes.includes(route)
}
