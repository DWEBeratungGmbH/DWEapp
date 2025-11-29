/**
 * Session Helper für WeClapp Integration
 * Erstellt UserContext aus NextAuth Session
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { UserContext } from './tasks.service'
import { getTaskDataScope, getPermissionsForRole } from './permissions'

const prisma = new PrismaClient()

// ========================================
// USER CONTEXT AUS SESSION ERSTELLEN
// ========================================

/**
 * Erstellt UserContext aus der aktuellen Session
 * Lädt Benutzer und Berechtigungen aus der Datenbank
 */
export async function getUserContextFromSession(): Promise<UserContext | null> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return null
  }
  
  // Benutzer aus DB laden
  const users = await prisma.$queryRaw`
    SELECT * FROM users WHERE email = ${session.user.email}
  ` as any[]
  
  if (!users || users.length === 0) {
    return null
  }
  
  const user = users[0]
  
  // Berechtigungen laden (aus der Rolle)
  const role = user.role || 'USER'
  const permissions = getPermissionsForRole(role)
  const taskDataScope = getTaskDataScope(role)
  
  return {
    userId: user.id,
    weClappUserId: user.weClappUserId || undefined,
    role,
    taskDataScope,
    permissions,
  }
}

/**
 * Prüft ob der aktuelle Benutzer mit WeClapp verbunden ist
 */
export async function isWeClappConnected(): Promise<boolean> {
  const context = await getUserContextFromSession()
  return !!context?.weClappUserId
}

/**
 * Prüft ob der aktuelle Benutzer eine bestimmte Berechtigung hat
 */
export async function checkPermission(permission: string): Promise<boolean> {
  const context = await getUserContextFromSession()
  return context?.permissions.includes(permission) || false
}
