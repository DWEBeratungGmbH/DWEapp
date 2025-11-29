/**
 * Berechtigungen für WeClapp Integration
 * Zentrale Definition aller Berechtigungen
 */

import { TaskDataScope } from './types'

// ========================================
// BERECHTIGUNGS-KONSTANTEN
// ========================================

export const PERMISSIONS = {
  // Navigation
  NAV_DASHBOARD: 'nav.dashboard',
  NAV_TASKS: 'nav.tasks',
  NAV_ADMIN: 'nav.admin',
  
  // Aufgaben-Aktionen
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_EDIT: 'tasks.edit',
  TASKS_DELETE: 'tasks.delete',
  TASKS_ASSIGN: 'tasks.assign',
  
  // Admin-Aktionen
  ADMIN_USERS: 'admin.users',
  ADMIN_ROLES: 'admin.roles',
  ADMIN_SETTINGS: 'admin.settings',
  
  // WeClapp-Integration
  WECLAPP_CONNECT: 'weclapp.connect',
  WECLAPP_SYNC: 'weclapp.sync',
} as const

export type PermissionKey = keyof typeof PERMISSIONS
export type PermissionValue = typeof PERMISSIONS[PermissionKey]

// ========================================
// HELPER FUNKTIONEN
// ========================================

/**
 * Prüft ob eine Liste von Berechtigungen eine bestimmte Berechtigung enthält
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: PermissionValue
): boolean {
  return userPermissions.includes(requiredPermission)
}

/**
 * Prüft ob eine Liste von Berechtigungen alle geforderten Berechtigungen enthält
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: PermissionValue[]
): boolean {
  return requiredPermissions.every(p => userPermissions.includes(p))
}

/**
 * Prüft ob eine Liste von Berechtigungen mindestens eine der geforderten Berechtigungen enthält
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: PermissionValue[]
): boolean {
  return requiredPermissions.some(p => userPermissions.includes(p))
}

/**
 * Ermittelt den Task Data Scope basierend auf der Rolle
 * - ADMIN, MANAGER: Alle Aufgaben
 * - USER: Nur eigene Aufgaben
 */
export function getTaskDataScope(role: string): TaskDataScope {
  switch (role) {
    case 'ADMIN':
    case 'MANAGER':
      return 'all'
    default:
      return 'own'
  }
}

// ========================================
// BERECHTIGUNGS-GRUPPEN
// ========================================

/**
 * Berechtigungen für verschiedene Rollen
 */
export const ROLE_PERMISSIONS: Record<string, PermissionValue[]> = {
  ADMIN: [
    PERMISSIONS.NAV_DASHBOARD,
    PERMISSIONS.NAV_TASKS,
    PERMISSIONS.NAV_ADMIN,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.ADMIN_USERS,
    PERMISSIONS.ADMIN_ROLES,
    PERMISSIONS.ADMIN_SETTINGS,
    PERMISSIONS.WECLAPP_CONNECT,
    PERMISSIONS.WECLAPP_SYNC,
  ],
  MANAGER: [
    PERMISSIONS.NAV_DASHBOARD,
    PERMISSIONS.NAV_TASKS,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.WECLAPP_CONNECT,
    PERMISSIONS.WECLAPP_SYNC,
  ],
  USER: [
    PERMISSIONS.NAV_DASHBOARD,
    PERMISSIONS.NAV_TASKS,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.WECLAPP_CONNECT,
  ],
}

/**
 * Berechtigungen für eine Rolle abrufen
 */
export function getPermissionsForRole(role: string): PermissionValue[] {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.USER
}
