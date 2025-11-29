import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// WeClapp API Helper
async function fetchWeClappTasks(options?: { limit?: number }) {
  const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
  const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
  
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
    throw new Error('WeClapp API nicht konfiguriert')
  }
  
  const pageSize = options?.limit || 1000
  const url = `${WECLAPP_API_URL}/task?pageSize=${pageSize}`
  
  const response = await fetch(url, {
    headers: {
      'AuthenticationToken': WECLAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error('WeClapp API Error:', error)
    throw new Error(`WeClapp API Fehler: ${response.status}`)
  }
  
  const data = await response.json()
  return data.result || []
}

async function fetchWeClappUsers() {
  const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
  const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
  
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
    throw new Error('WeClapp API nicht konfiguriert')
  }
  
  const response = await fetch(`${WECLAPP_API_URL}/user?pageSize=1000`, {
    headers: {
      'AuthenticationToken': WECLAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error('WeClapp API Error:', error)
    throw new Error(`WeClapp API Fehler: ${response.status}`)
  }
  
  const data = await response.json()
  return data.result || []
}

// Initiale Synchronisation - interne Funktion
async function initialWeClappSync() {
  console.log('🚀 Starte initiale WeClapp Synchronisation...')
  
  try {
    // 1. Benutzer synchronisieren
    await syncUsers()
    
    // 2. Aufgaben synchronisieren
    await syncTasks()
    
    // 3. Aufträge synchronisieren
    await syncOrders()
    
    // 4. Buchungen synchronisieren
    await syncTimeEntries()
    
    console.log('✅ Initiale Synchronisation abgeschlossen')
    
  } catch (error) {
    console.error('❌ Fehler bei initialer Synchronisation:', error)
    throw error
  }
}

async function syncUsers() {
  console.log('👥 Synchronisiere Benutzer...')
  
  const weClappUsers = await fetchWeClappUsers()
  
  for (const user of weClappUsers) {
    // Prüfen ob Benutzer bereits existiert
    const existingUser = await prisma.user.findFirst({
      where: { weClappUserId: user.id },
    })
    
    if (existingUser) {
      // Bestehenden Benutzer aktualisieren
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          weClappUserId: user.id,
          isActive: user.active,
        },
      })
      console.log(`  ✅ Benutzer ${user.firstName} ${user.lastName} aktualisiert`)
    } else {
      // Neuen Benutzer anlegen (mit Einladung)
      await prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          weClappUserId: user.id,
          isActive: user.active,
          role: 'USER', // Standardrolle
        },
      })
      console.log(`  ✅ Neuer Benutzer ${user.firstName} ${user.lastName} angelegt`)
    }
  }
}

async function syncTasks() {
  console.log('📋 Synchronisiere Aufgaben...')
  
  // Alle Aufgaben von WeClapp holen (paginiert)
  let allTasks: any[] = []
  let page = 1
  let hasMore = true
  
  while (hasMore) {
    const response = await fetchWeClappTasks({
      limit: 1000, // Große Seite für initiale Sync
    })
    
    if (response.length === 0) {
      hasMore = false
    } else {
      allTasks = allTasks.concat(response)
      page++
      
      if (response.length < 1000) {
        hasMore = false
      }
    }
  }
  
  console.log(`  📊 ${allTasks.length} Aufgaben von WeClapp geladen`)
  
  // Aufgaben in Datenbank speichern
  for (const task of allTasks) {
    await prisma.weClappTask.upsert({
      where: { id: task.id },
      update: {
        subject: task.subject,
        description: task.description,
        identifier: task.identifier,
        taskStatus: task.taskStatus,
        taskPriority: task.taskPriority,
        dateFrom: task.dateFrom ? new Date(task.dateFrom) : null,
        dateTo: task.dateTo ? new Date(task.dateTo) : null,
        plannedEffort: task.plannedEffort,
        creatorUserId: task.creatorUserId,
        parentTaskId: task.parentTaskId,
        orderItemId: task.orderItemId,
        customerId: task.customerId,
        assignees: task.assignees,
        watchers: task.watchers,
        entityReferences: task.entityReferences,
        taskLists: task.taskLists,
        taskTopics: task.taskTopics,
        taskTypes: task.taskTypes,
        customAttributes: task.customAttributes,
        createdDate: new Date(task.createdDate),
        lastModifiedDate: new Date(task.lastModifiedDate),
        weClappLastModified: new Date(task.lastModifiedDate),
        lastSyncAt: new Date(),
        isActive: true,
      },
      create: {
        id: task.id,
        subject: task.subject,
        description: task.description,
        identifier: task.identifier,
        taskStatus: task.taskStatus,
        taskPriority: task.taskPriority,
        dateFrom: task.dateFrom ? new Date(task.dateFrom) : null,
        dateTo: task.dateTo ? new Date(task.dateTo) : null,
        plannedEffort: task.plannedEffort,
        creatorUserId: task.creatorUserId,
        parentTaskId: task.parentTaskId,
        orderItemId: task.orderItemId,
        customerId: task.customerId,
        assignees: task.assignees,
        watchers: task.watchers,
        entityReferences: task.entityReferences,
        taskLists: task.taskLists,
        taskTopics: task.taskTopics,
        taskTypes: task.taskTypes,
        customAttributes: task.customAttributes,
        createdDate: new Date(task.createdDate),
        lastModifiedDate: new Date(task.lastModifiedDate),
        weClappLastModified: new Date(task.lastModifiedDate),
        lastSyncAt: new Date(),
        isActive: true,
      },
    })
  }
  
  console.log(`  ✅ ${allTasks.length} Aufgaben synchronisiert`)
}

async function syncOrders() {
  console.log('📦 Synchronisiere Aufträge...')
  // TODO: Implement Order Sync
  console.log('  ⏳ Orders Sync noch nicht implementiert')
}

async function syncTimeEntries() {
  console.log('⏱️ Synchronisiere Buchungen...')
  // TODO: Implement TimeEntry Sync
  console.log('  ⏳ TimeEntries Sync noch nicht implementiert')
}

// Cleanup alte Webhook-Logs - interne Funktion
async function cleanupWebhookLogs() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const deleted = await prisma.weClappWebhookLog.deleteMany({
    where: {
      receivedAt: {
        lt: thirtyDaysAgo,
      },
    },
  })
  
  console.log(`🧹 ${deleted.count} alte Webhook-Logs gelöscht`)
}

// API-Endpunkt für manuelle Synchronisation
export async function POST() {
  try {
    await initialWeClappSync()
    await cleanupWebhookLogs()
    
    return Response.json({ 
      success: true, 
      message: 'Initiale Synchronisation abgeschlossen' 
    })
  } catch (error) {
    console.error('❌ Sync Fehler:', error)
    return Response.json({ 
      error: 'Synchronisation fehlgeschlagen',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
