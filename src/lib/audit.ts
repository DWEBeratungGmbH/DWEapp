// Audit & Logging Helper Functions
// Fuer Login-Protokollierung und Aenderungs-Tracking
// HINWEIS: Funktioniert erst nach Migration (npx prisma migrate)

import { prisma } from '@/lib/prisma'

// ===== LOGIN LOGGING =====

export type LoginAction = 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SESSION_EXPIRED'

interface LogLoginParams {
  userId?: string | null
  email: string
  action: LoginAction
  provider?: string
  ipAddress?: string
  userAgent?: string
  errorReason?: string
}

export async function logLogin(params: LogLoginParams): Promise<void> {
  try {
    // @ts-ignore - LoginLog existiert erst nach Migration
    if (prisma.loginLog) {
      // @ts-ignore
      await prisma.loginLog.create({
        data: {
          userId: params.userId,
          email: params.email,
          action: params.action,
          provider: params.provider,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          errorReason: params.errorReason,
        }
      })
      console.log(`[Audit] Login: ${params.action} for ${params.email}`)
    } else {
      console.log(`[Audit] LoginLog nicht verfuegbar - Migration erforderlich`)
    }
  } catch (error) {
    // Silently fail - Audit ist optional
    console.log(`[Audit] Login-Logging uebersprungen (Migration pending)`)
  }
}

// ===== USER ACTIVITY =====

export async function updateUserActivity(userId: string): Promise<void> {
  try {
    // @ts-ignore - lastActiveAt existiert erst nach Migration
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() } as any
    })
  } catch (error) {
    // Silently fail - Feld existiert noch nicht
  }
}

export async function updateUserLogin(userId: string): Promise<void> {
  try {
    // @ts-ignore - Felder existieren erst nach Migration
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        loginCount: { increment: 1 }
      } as any
    })
    console.log(`[Audit] User login updated: ${userId}`)
  } catch (error) {
    // Silently fail - Felder existieren noch nicht
    console.log(`[Audit] User-Update uebersprungen (Migration pending)`)
  }
}

// ===== AUDIT LOGGING =====

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'

interface LogAuditParams {
  tableName: string
  recordId: string
  action: AuditAction
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  changedFields?: string[]
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tableName: params.tableName,
        recordId: params.recordId,
        action: params.action,
        oldValues: params.oldValues || undefined,
        newValues: params.newValues || undefined,
        changedFields: params.changedFields || [],
        userId: params.userId,
        userEmail: params.userEmail,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      }
    })
    console.log(`[Audit] ${params.action} on ${params.tableName}:${params.recordId}`)
  } catch (error) {
    console.error('[Audit] Failed to log audit:', error)
  }
}

// ===== ONLINE STATUS =====

// Prueft ob User in den letzten X Minuten aktiv war
export async function getOnlineUsers(minutesThreshold: number = 5): Promise<any[]> {
  try {
    const threshold = new Date(Date.now() - minutesThreshold * 60 * 1000)
    
    // @ts-ignore - lastActiveAt existiert erst nach Migration
    return await prisma.user.findMany({
      where: {
        lastActiveAt: { gte: threshold },
        isActive: true
      } as any,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        lastActiveAt: true
      } as any,
      orderBy: { lastActiveAt: 'desc' } as any
    })
  } catch (error) {
    // Return empty array if fields don't exist yet
    return []
  }
}

// ===== HELPER =====

// Extrahiert geaenderte Felder zwischen zwei Objekten
export function getChangedFields(
  oldObj: Record<string, any>,
  newObj: Record<string, any>
): string[] {
  const changed: string[] = []
  const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]))
  
  allKeys.forEach(key => {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changed.push(key)
    }
  })
  
  return changed
}
