/**
 * WeClapp Bidirektionaler Sync Service
 * 
 * Dieser Service ermöglicht:
 * - Push: Lokale Änderungen → WeClapp
 * - Pull: WeClapp → Lokale DB (via Webhooks oder manuell)
 * - Konflikt-Erkennung via lastModifiedDate
 */

import { PrismaClient } from '@prisma/client'
import { createWeClappClient } from './api'

const prisma = new PrismaClient()

// ========================================
// TYPES
// ========================================

interface SyncResult {
  success: boolean
  action: 'created' | 'updated' | 'skipped' | 'conflict'
  localId: string
  weClappId?: string
  error?: string
}

interface ConflictResolution {
  strategy: 'local_wins' | 'remote_wins' | 'manual'
}

// ========================================
// TASK SYNC (App → WeClapp)
// ========================================

/**
 * Erstellt eine neue Aufgabe in WeClapp und speichert die ID lokal
 */
export async function pushTaskToWeClapp(localTaskId: string): Promise<SyncResult> {
  try {
    const api = createWeClappClient()
    const localTask = await prisma.weClappTask.findUnique({
      where: { id: localTaskId }
    })
    
    if (!localTask) {
      return { success: false, action: 'skipped', localId: localTaskId, error: 'Task nicht gefunden' }
    }
    
    // Prüfen ob Task bereits in WeClapp existiert (hat eine WeClapp-ID)
    if (localTask.id && !localTask.id.startsWith('local_')) {
      // Update existierender Task
      const weClappTask = await api.updateTask(localTask.id, {
        subject: localTask.subject || undefined,
        description: localTask.description || undefined,
        taskStatus: localTask.taskStatus as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'WAITING_ON_OTHERS',
        taskPriority: localTask.taskPriority as 'HIGH' | 'MEDIUM' | 'LOW',
        dateFrom: localTask.dateFrom?.getTime(),
        dateTo: localTask.dateTo?.getTime(),
        plannedEffort: localTask.plannedEffort || undefined,
        customerId: localTask.customerId || undefined,
      })
      
      // Lokalen Task mit WeClapp-Daten aktualisieren
      await prisma.weClappTask.update({
        where: { id: localTaskId },
        data: {
          lastModifiedDate: new Date(weClappTask.lastModifiedDate),
          weClappLastModified: new Date(weClappTask.lastModifiedDate),
          lastSyncAt: new Date(),
        }
      })
      
      return { success: true, action: 'updated', localId: localTaskId, weClappId: weClappTask.id }
    } else {
      // Neuen Task erstellen
      const weClappTask = await api.createTask({
        subject: localTask.subject || 'Neue Aufgabe',
        description: localTask.description || undefined,
        taskStatus: localTask.taskStatus as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'WAITING_ON_OTHERS',
        taskPriority: localTask.taskPriority as 'HIGH' | 'MEDIUM' | 'LOW',
        dateFrom: localTask.dateFrom?.getTime(),
        dateTo: localTask.dateTo?.getTime(),
        plannedEffort: localTask.plannedEffort || undefined,
        customerId: localTask.customerId || undefined,
      })
      
      // Lokalen Task mit WeClapp-ID aktualisieren
      await prisma.weClappTask.update({
        where: { id: localTaskId },
        data: {
          id: weClappTask.id, // WeClapp-ID übernehmen
          identifier: weClappTask.identifier,
          createdDate: new Date(weClappTask.createdDate),
          lastModifiedDate: new Date(weClappTask.lastModifiedDate),
          weClappLastModified: new Date(weClappTask.lastModifiedDate),
          lastSyncAt: new Date(),
        }
      })
      
      return { success: true, action: 'created', localId: localTaskId, weClappId: weClappTask.id }
    }
  } catch (error) {
    console.error(`❌ Push Task ${localTaskId} fehlgeschlagen:`, error)
    return { 
      success: false, 
      action: 'skipped', 
      localId: localTaskId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// ========================================
// TIME ENTRY SYNC (App → WeClapp)
// ========================================

/**
 * Erstellt/Aktualisiert einen Zeiteintrag in WeClapp
 */
export async function pushTimeEntryToWeClapp(localEntryId: string): Promise<SyncResult> {
  try {
    const api = createWeClappClient()
    const localEntry = await prisma.weClappTimeEntry.findUnique({
      where: { id: localEntryId }
    })
    
    if (!localEntry) {
      return { success: false, action: 'skipped', localId: localEntryId, error: 'TimeEntry nicht gefunden' }
    }
    
    // Prüfen ob bereits in WeClapp existiert
    if (localEntry.id && !localEntry.id.startsWith('local_')) {
      // Update
      const weClappEntry = await api.updateTimeRecord(localEntry.id, {
        taskId: localEntry.taskId || undefined,
        userId: localEntry.userId || undefined,
        description: localEntry.description || undefined,
        startDate: localEntry.startDate?.getTime(),
        durationSeconds: localEntry.durationSeconds || undefined,
        billable: localEntry.billable,
      })
      
      await prisma.weClappTimeEntry.update({
        where: { id: localEntryId },
        data: {
          lastModifiedDate: new Date(weClappEntry.lastModifiedDate),
          weClappLastModified: new Date(weClappEntry.lastModifiedDate),
          lastSyncAt: new Date(),
        }
      })
      
      return { success: true, action: 'updated', localId: localEntryId, weClappId: weClappEntry.id }
    } else {
      // Create
      const weClappEntry = await api.createTimeRecord({
        taskId: localEntry.taskId || undefined,
        userId: localEntry.userId || undefined,
        description: localEntry.description || undefined,
        startDate: localEntry.startDate?.getTime(),
        durationSeconds: localEntry.durationSeconds || undefined,
        billable: localEntry.billable,
      })
      
      await prisma.weClappTimeEntry.update({
        where: { id: localEntryId },
        data: {
          id: weClappEntry.id,
          createdDate: new Date(weClappEntry.createdDate),
          lastModifiedDate: new Date(weClappEntry.lastModifiedDate),
          weClappLastModified: new Date(weClappEntry.lastModifiedDate),
          lastSyncAt: new Date(),
        }
      })
      
      return { success: true, action: 'created', localId: localEntryId, weClappId: weClappEntry.id }
    }
  } catch (error) {
    console.error(`❌ Push TimeEntry ${localEntryId} fehlgeschlagen:`, error)
    return { 
      success: false, 
      action: 'skipped', 
      localId: localEntryId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// ========================================
// ORDER SYNC (App → WeClapp)
// ========================================

/**
 * Erstellt/Aktualisiert einen Auftrag in WeClapp
 */
export async function pushOrderToWeClapp(localOrderId: string): Promise<SyncResult> {
  try {
    const api = createWeClappClient()
    const localOrder = await prisma.weClappOrder.findUnique({
      where: { id: localOrderId }
    })
    
    if (!localOrder) {
      return { success: false, action: 'skipped', localId: localOrderId, error: 'Order nicht gefunden' }
    }
    
    if (localOrder.id && !localOrder.id.startsWith('local_')) {
      // Update
      const weClappOrder = await api.updateSalesOrder(localOrder.id, {
        orderNumberAtCustomer: localOrder.orderNumberAtCustomer || undefined,
        note: localOrder.note || undefined,
        customerId: localOrder.customerId || undefined,
      })
      
      await prisma.weClappOrder.update({
        where: { id: localOrderId },
        data: {
          lastModifiedDate: new Date(weClappOrder.lastModifiedDate),
          weClappLastModified: new Date(weClappOrder.lastModifiedDate),
          lastSyncAt: new Date(),
        }
      })
      
      return { success: true, action: 'updated', localId: localOrderId, weClappId: weClappOrder.id }
    } else {
      // Create
      const weClappOrder = await api.createSalesOrder({
        customerId: localOrder.customerId || undefined,
        orderNumberAtCustomer: localOrder.orderNumberAtCustomer || undefined,
        note: localOrder.note || undefined,
      })
      
      await prisma.weClappOrder.update({
        where: { id: localOrderId },
        data: {
          id: weClappOrder.id,
          orderNumber: weClappOrder.orderNumber,
          createdDate: new Date(weClappOrder.createdDate),
          lastModifiedDate: new Date(weClappOrder.lastModifiedDate),
          weClappLastModified: new Date(weClappOrder.lastModifiedDate),
          lastSyncAt: new Date(),
        }
      })
      
      return { success: true, action: 'created', localId: localOrderId, weClappId: weClappOrder.id }
    }
  } catch (error) {
    console.error(`❌ Push Order ${localOrderId} fehlgeschlagen:`, error)
    return { 
      success: false, 
      action: 'skipped', 
      localId: localOrderId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// ========================================
// KONFLIKT-ERKENNUNG
// ========================================

/**
 * Prüft ob ein Konflikt zwischen lokaler und Remote-Version besteht
 */
export async function checkForConflict(
  entityType: 'task' | 'order' | 'timeEntry',
  localId: string
): Promise<{ hasConflict: boolean; localModified?: Date; remoteModified?: Date }> {
  try {
    const api = createWeClappClient()
    
    let localEntity: any
    let remoteEntity: any
    
    switch (entityType) {
      case 'task':
        localEntity = await prisma.weClappTask.findUnique({ where: { id: localId } })
        if (localEntity) {
          remoteEntity = await api.getTask(localId)
        }
        break
      case 'order':
        localEntity = await prisma.weClappOrder.findUnique({ where: { id: localId } })
        if (localEntity) {
          remoteEntity = await api.getSalesOrder(localId)
        }
        break
      case 'timeEntry':
        localEntity = await prisma.weClappTimeEntry.findUnique({ where: { id: localId } })
        if (localEntity) {
          remoteEntity = await api.getTimeRecord(localId)
        }
        break
    }
    
    if (!localEntity || !remoteEntity) {
      return { hasConflict: false }
    }
    
    const localModified = localEntity.lastModifiedDate
    const remoteModified = new Date(remoteEntity.lastModifiedDate)
    const lastSync = localEntity.weClappLastModified
    
    // Konflikt wenn beide seit letztem Sync geändert wurden
    const hasConflict = localModified > lastSync && remoteModified > lastSync
    
    return { hasConflict, localModified, remoteModified }
  } catch (error) {
    console.error(`Konfliktprüfung fehlgeschlagen:`, error)
    return { hasConflict: false }
  }
}

// ========================================
// BATCH SYNC
// ========================================

/**
 * Synchronisiert alle lokalen Änderungen zu WeClapp
 */
export async function pushAllPendingChanges(): Promise<{
  tasks: SyncResult[]
  orders: SyncResult[]
  timeEntries: SyncResult[]
}> {
  const results = {
    tasks: [] as SyncResult[],
    orders: [] as SyncResult[],
    timeEntries: [] as SyncResult[],
  }
  
  // Tasks mit lokalen Änderungen finden (lastModifiedDate > weClappLastModified)
  const pendingTasks = await prisma.weClappTask.findMany({
    where: {
      OR: [
        { id: { startsWith: 'local_' } }, // Neue lokale Tasks
        { 
          lastModifiedDate: { gt: prisma.weClappTask.fields.weClappLastModified }
        }
      ]
    }
  })
  
  for (const task of pendingTasks) {
    const result = await pushTaskToWeClapp(task.id)
    results.tasks.push(result)
  }
  
  // TimeEntries
  const pendingTimeEntries = await prisma.weClappTimeEntry.findMany({
    where: {
      OR: [
        { id: { startsWith: 'local_' } },
      ]
    }
  })
  
  for (const entry of pendingTimeEntries) {
    const result = await pushTimeEntryToWeClapp(entry.id)
    results.timeEntries.push(result)
  }
  
  console.log(`📤 Push abgeschlossen: ${results.tasks.length} Tasks, ${results.timeEntries.length} TimeEntries`)
  
  return results
}
