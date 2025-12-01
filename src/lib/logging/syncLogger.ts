/**
 * Sync & Audit Logging Service
 * 
 * Protokolliert alle Synchronisationen und Datenänderungen
 * für Nachvollziehbarkeit und Debugging.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ========================================
// TYPES
// ========================================

export type SyncType = 'pull' | 'push' | 'webhook' | 'manual'
export type EntityType = 'user' | 'party' | 'task' | 'order' | 'timeEntry'
export type SyncAction = 'created' | 'updated' | 'deleted' | 'skipped' | 'conflict'
export type SyncDirection = 'weclapp_to_app' | 'app_to_weclapp'
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'

interface SyncLogEntry {
  syncType: SyncType
  entityType: EntityType
  entityId?: string
  action: SyncAction
  direction: SyncDirection
  changesBefore?: any
  changesAfter?: any
  changedFields?: string[]
  success?: boolean
  errorMessage?: string
  triggeredBy?: string
}

interface AuditLogEntry {
  tableName: string
  recordId: string
  action: AuditAction
  oldValues?: any
  newValues?: any
  changedFields?: string[]
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
}

// ========================================
// SYNC LOGGING
// ========================================

/**
 * Protokolliert eine einzelne Sync-Operation
 */
export async function logSync(entry: SyncLogEntry) {
  try {
    await prisma.syncLog.create({
      data: {
        syncType: entry.syncType,
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        direction: entry.direction,
        changesBefore: entry.changesBefore,
        changesAfter: entry.changesAfter,
        changedFields: entry.changedFields || [],
        success: entry.success ?? true,
        errorMessage: entry.errorMessage,
        triggeredBy: entry.triggeredBy || 'system',
      }
    })
  } catch (error) {
    console.error('❌ Fehler beim Sync-Logging:', error)
  }
}

/**
 * Protokolliert eine erfolgreiche Sync-Operation
 */
export async function logSyncSuccess(
  syncType: SyncType,
  entityType: EntityType,
  entityId: string,
  action: SyncAction,
  direction: SyncDirection,
  options?: {
    before?: any
    after?: any
    changedFields?: string[]
    triggeredBy?: string
  }
) {
  await logSync({
    syncType,
    entityType,
    entityId,
    action,
    direction,
    changesBefore: options?.before,
    changesAfter: options?.after,
    changedFields: options?.changedFields,
    success: true,
    triggeredBy: options?.triggeredBy,
  })
}

/**
 * Protokolliert eine fehlgeschlagene Sync-Operation
 */
export async function logSyncError(
  syncType: SyncType,
  entityType: EntityType,
  entityId: string | undefined,
  direction: SyncDirection,
  error: Error | string,
  triggeredBy?: string
) {
  await logSync({
    syncType,
    entityType,
    entityId,
    action: 'skipped',
    direction,
    success: false,
    errorMessage: error instanceof Error ? error.message : error,
    triggeredBy,
  })
}

// ========================================
// AUDIT LOGGING
// ========================================

/**
 * Protokolliert eine Datenänderung
 */
export async function logAudit(entry: AuditLogEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        tableName: entry.tableName,
        recordId: entry.recordId,
        action: entry.action,
        oldValues: entry.oldValues,
        newValues: entry.newValues,
        changedFields: entry.changedFields || [],
        userId: entry.userId,
        userEmail: entry.userEmail,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      }
    })
  } catch (error) {
    console.error('❌ Fehler beim Audit-Logging:', error)
  }
}

/**
 * Berechnet die geänderten Felder zwischen zwei Objekten
 */
export function getChangedFields(oldObj: any, newObj: any): string[] {
  if (!oldObj || !newObj) return []
  
  const changedFields: string[] = []
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  
  for (const key of allKeys) {
    const oldVal = JSON.stringify(oldObj[key])
    const newVal = JSON.stringify(newObj[key])
    if (oldVal !== newVal) {
      changedFields.push(key)
    }
  }
  
  return changedFields
}

// ========================================
// SYNC STATUS (Batch-Synchronisationen)
// ========================================

/**
 * Startet eine neue Batch-Synchronisation
 */
export async function startSyncStatus(syncType: 'initial' | 'incremental' | 'manual') {
  const status = await prisma.syncStatus.create({
    data: {
      syncType,
      status: 'running',
      startedAt: new Date(),
    }
  })
  return status.id
}

/**
 * Aktualisiert den Sync-Status
 */
export async function updateSyncStatus(
  statusId: string,
  updates: {
    usersSync?: { success: number; failed: number }
    partiesSync?: { success: number; failed: number }
    tasksSync?: { success: number; failed: number }
    ordersSync?: { success: number; failed: number }
    timeEntriesSync?: { success: number; failed: number }
  }
) {
  const current = await prisma.syncStatus.findUnique({ where: { id: statusId } })
  if (!current) return
  
  let totalSuccess = 0
  let totalFailed = 0
  
  for (const sync of Object.values(updates)) {
    if (sync) {
      totalSuccess += sync.success
      totalFailed += sync.failed
    }
  }
  
  await prisma.syncStatus.update({
    where: { id: statusId },
    data: {
      ...updates,
      successCount: { increment: totalSuccess },
      failedCount: { increment: totalFailed },
      totalRecords: { increment: totalSuccess + totalFailed },
    }
  })
}

/**
 * Beendet eine Batch-Synchronisation
 */
export async function completeSyncStatus(
  statusId: string,
  success: boolean,
  errorMessage?: string
) {
  const startedAt = await prisma.syncStatus.findUnique({
    where: { id: statusId },
    select: { startedAt: true }
  })
  
  const now = new Date()
  const durationMs = startedAt ? now.getTime() - startedAt.startedAt.getTime() : 0
  
  await prisma.syncStatus.update({
    where: { id: statusId },
    data: {
      status: success ? 'completed' : 'failed',
      completedAt: now,
      durationMs,
      errorMessage,
    }
  })
}

// ========================================
// ABFRAGEN
// ========================================

/**
 * Holt die letzten Sync-Logs für eine Entität
 */
export async function getSyncLogsForEntity(
  entityType: EntityType,
  entityId: string,
  limit = 50
) {
  return prisma.syncLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Holt die letzten Sync-Logs
 */
export async function getRecentSyncLogs(limit = 100) {
  return prisma.syncLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Holt die letzten Audit-Logs für einen Datensatz
 */
export async function getAuditLogsForRecord(
  tableName: string,
  recordId: string,
  limit = 50
) {
  return prisma.auditLog.findMany({
    where: { tableName, recordId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Holt den letzten Sync-Status
 */
export async function getLastSyncStatus() {
  return prisma.syncStatus.findFirst({
    orderBy: { startedAt: 'desc' },
  })
}

/**
 * Holt alle Sync-Status der letzten X Tage
 */
export async function getSyncStatusHistory(days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  return prisma.syncStatus.findMany({
    where: { startedAt: { gte: since } },
    orderBy: { startedAt: 'desc' },
  })
}
