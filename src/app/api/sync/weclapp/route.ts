import { PrismaClient } from '@prisma/client'
import { 
  logSyncSuccess, 
  logSyncError, 
  startSyncStatus, 
  updateSyncStatus, 
  completeSyncStatus 
} from '@/lib/logging/syncLogger'

const prisma = new PrismaClient()

// ========================================
// WeClapp API Helper Funktionen
// ========================================

function getWeClappConfig() {
  const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
  const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
  
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
    throw new Error('WeClapp API nicht konfiguriert')
  }
  
  return { WECLAPP_API_URL, WECLAPP_API_KEY }
}

async function fetchFromWeClapp(endpoint: string, options?: { limit?: number }) {
  const { WECLAPP_API_URL, WECLAPP_API_KEY } = getWeClappConfig()
  const pageSize = options?.limit || 1000
  const separator = endpoint.includes('?') ? '&' : '?'
  const url = `${WECLAPP_API_URL}${endpoint}${separator}pageSize=${pageSize}`
  
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

async function fetchWeClappTasks(options?: { limit?: number }) {
  return fetchFromWeClapp('/task', options)
}

async function fetchWeClappUsers() {
  return fetchFromWeClapp('/user')
}

async function fetchWeClappParties() {
  return fetchFromWeClapp('/party')
}

async function fetchWeClappOrders() {
  return fetchFromWeClapp('/salesOrder')
}

async function fetchWeClappTimeRecords() {
  return fetchFromWeClapp('/timeRecord')
}

// ========================================
// Initiale Synchronisation (WeClapp → App)
// ========================================

async function initialWeClappSync() {
  console.log('🚀 Starte initiale WeClapp Synchronisation...')
  
  // Sync-Status starten (für Protokollierung)
  const syncStatusId = await startSyncStatus('initial')
  
  const results = {
    users: { success: 0, failed: 0 },
    parties: { success: 0, failed: 0 },
    tasks: { success: 0, failed: 0 },
    orders: { success: 0, failed: 0 },
    timeEntries: { success: 0, failed: 0 },
  }
  
  try {
    // 1. Benutzer synchronisieren
    results.users = await syncUsers()
    await updateSyncStatus(syncStatusId, { usersSync: results.users })
    
    // 2. Parties (Kunden/Lieferanten) synchronisieren
    results.parties = await syncParties()
    await updateSyncStatus(syncStatusId, { partiesSync: results.parties })
    
    // 3. Aufgaben synchronisieren
    results.tasks = await syncTasks()
    await updateSyncStatus(syncStatusId, { tasksSync: results.tasks })
    
    // 4. Aufträge synchronisieren
    results.orders = await syncOrders()
    await updateSyncStatus(syncStatusId, { ordersSync: results.orders })
    
    // 5. Zeiteinträge synchronisieren
    results.timeEntries = await syncTimeEntries()
    await updateSyncStatus(syncStatusId, { timeEntriesSync: results.timeEntries })
    
    // Sync-Status abschließen
    await completeSyncStatus(syncStatusId, true)
    
    console.log('✅ Initiale Synchronisation abgeschlossen', results)
    return { ...results, syncStatusId }
    
  } catch (error) {
    console.error('❌ Fehler bei initialer Synchronisation:', error)
    await completeSyncStatus(syncStatusId, false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

async function syncUsers(): Promise<{ success: number; failed: number }> {
  console.log('👥 Synchronisiere WeClapp-Benutzer...')
  let success = 0, failed = 0
  
  const weClappUsers = await fetchWeClappUsers()
  
  // WeClapp-Benutzer in weclapp_users speichern (NICHT in users!)
  for (const user of weClappUsers) {
    try {
      // Vorherigen Zustand laden (für Logging)
      const existingUser = await prisma.weClappUser.findUnique({ where: { id: user.id } })
      const isNew = !existingUser
      
      await prisma.weClappUser.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          title: user.title,
          phoneNumber: user.phoneNumber,
          mobilePhoneNumber: user.mobilePhoneNumber,
          faxNumber: user.faxNumber,
          imageId: user.imageId,
          status: user.status || 'ACTIVE',
          userRoles: user.userRoles,
          licenses: user.licenses,
          customAttributes: user.customAttributes,
          lastModifiedDate: user.lastModifiedDate ? new Date(user.lastModifiedDate) : null,
          lastSyncAt: new Date(),
        },
        create: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          title: user.title,
          phoneNumber: user.phoneNumber,
          mobilePhoneNumber: user.mobilePhoneNumber,
          faxNumber: user.faxNumber,
          imageId: user.imageId,
          status: user.status || 'ACTIVE',
          userRoles: user.userRoles,
          licenses: user.licenses,
          customAttributes: user.customAttributes,
          createdDate: user.createdDate ? new Date(user.createdDate) : null,
          lastModifiedDate: user.lastModifiedDate ? new Date(user.lastModifiedDate) : null,
          lastSyncAt: new Date(),
        },
      })
      
      // Sync-Log schreiben
      await logSyncSuccess(
        'pull',
        'user',
        user.id,
        isNew ? 'created' : 'updated',
        'weclapp_to_app',
        { before: existingUser, after: user }
      )
      
      success++
    } catch (error) {
      console.error(`  ❌ Fehler bei User ${user.id}:`, error)
      await logSyncError('pull', 'user', user.id, 'weclapp_to_app', error as Error)
      failed++
    }
  }
  
  console.log(`  ✅ ${success} WeClapp-Benutzer synchronisiert, ${failed} fehlgeschlagen`)
  return { success, failed }
}

// Parties (Kunden, Lieferanten, Kontakte) synchronisieren
async function syncParties(): Promise<{ success: number; failed: number }> {
  console.log('🏢 Synchronisiere Parties (Kunden/Lieferanten)...')
  let success = 0, failed = 0
  
  const parties = await fetchWeClappParties()
  
  for (const party of parties) {
    try {
      await prisma.weClappParty.upsert({
        where: { id: party.id },
        update: {
          partyType: party.partyType,
          company: party.company,
          company2: party.company2,
          firstName: party.firstName,
          lastName: party.lastName,
          middleName: party.middleName,
          salutation: party.salutation,
          email: party.email,
          emailHome: party.emailHome,
          phone: party.phone,
          mobilePhone1: party.mobilePhone1,
          fax: party.fax,
          website: party.website,
          birthDate: party.birthDate ? new Date(party.birthDate) : null,
          customer: party.customer ?? false,
          customerNumber: party.customerNumber,
          customerBlocked: party.customerBlocked ?? false,
          customerCreditLimit: party.customerCreditLimit,
          supplier: party.supplier ?? false,
          supplierNumber: party.supplierNumber,
          primaryAddressId: party.primaryAddressId,
          invoiceAddressId: party.invoiceAddressId,
          deliveryAddressId: party.deliveryAddressId,
          addresses: party.addresses,
          bankAccounts: party.bankAccounts,
          contacts: party.contacts,
          tags: party.tags,
          customAttributes: party.customAttributes,
          lastModifiedDate: party.lastModifiedDate ? new Date(party.lastModifiedDate) : null,
          lastSyncAt: new Date(),
          isActive: true,
        },
        create: {
          id: party.id,
          partyType: party.partyType,
          company: party.company,
          company2: party.company2,
          firstName: party.firstName,
          lastName: party.lastName,
          middleName: party.middleName,
          salutation: party.salutation,
          email: party.email,
          emailHome: party.emailHome,
          phone: party.phone,
          mobilePhone1: party.mobilePhone1,
          fax: party.fax,
          website: party.website,
          birthDate: party.birthDate ? new Date(party.birthDate) : null,
          customer: party.customer ?? false,
          customerNumber: party.customerNumber,
          customerBlocked: party.customerBlocked ?? false,
          customerCreditLimit: party.customerCreditLimit,
          supplier: party.supplier ?? false,
          supplierNumber: party.supplierNumber,
          primaryAddressId: party.primaryAddressId,
          invoiceAddressId: party.invoiceAddressId,
          deliveryAddressId: party.deliveryAddressId,
          addresses: party.addresses,
          bankAccounts: party.bankAccounts,
          contacts: party.contacts,
          tags: party.tags,
          customAttributes: party.customAttributes,
          createdDate: party.createdDate ? new Date(party.createdDate) : null,
          lastModifiedDate: party.lastModifiedDate ? new Date(party.lastModifiedDate) : null,
          lastSyncAt: new Date(),
          isActive: true,
        },
      })
      success++
    } catch (error) {
      console.error(`  ❌ Fehler bei Party ${party.id}:`, error)
      failed++
    }
  }
  
  console.log(`  ✅ ${success} Parties synchronisiert, ${failed} fehlgeschlagen`)
  return { success, failed }
}

async function syncTasks(): Promise<{ success: number; failed: number }> {
  console.log('📋 Synchronisiere Aufgaben...')
  let success = 0, failed = 0
  
  const allTasks = await fetchWeClappTasks({ limit: 1000 })
  console.log(`  📊 ${allTasks.length} Aufgaben von WeClapp geladen`)
  
  for (const task of allTasks) {
    try {
      await prisma.weClappTask.upsert({
        where: { id: task.id },
        update: {
          subject: task.subject,
          description: task.description,
          identifier: task.identifier,
          taskStatus: task.taskStatus,
          taskPriority: task.taskPriority,
          taskVisibilityType: task.taskVisibilityType,
          dateFrom: task.dateFrom ? new Date(task.dateFrom) : null,
          dateTo: task.dateTo ? new Date(task.dateTo) : null,
          plannedEffort: task.plannedEffort,
          positionNumber: task.positionNumber,
          creatorUserId: task.creatorUserId,
          parentTaskId: task.parentTaskId,
          previousTaskId: task.previousTaskId,
          orderItemId: task.orderItemId,
          customerId: task.customerId,
          articleId: task.articleId,
          ticketId: task.ticketId,
          calendarEventId: task.calendarEventId,
          userOfLastStatusChangeId: task.userOfLastStatusChangeId,
          allowOverBooking: task.allowOverBooking ?? false,
          allowTimeBooking: task.allowTimeBooking ?? true,
          billableStatus: task.billableStatus,
          invoicingStatus: task.invoicingStatus,
          assignees: task.assignees,
          watchers: task.watchers,
          entityReferences: task.entityReferences,
          taskLists: task.taskLists,
          taskTopics: task.taskTopics,
          taskTypes: task.taskTypes,
          customAttributes: task.customAttributes,
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
          taskVisibilityType: task.taskVisibilityType,
          dateFrom: task.dateFrom ? new Date(task.dateFrom) : null,
          dateTo: task.dateTo ? new Date(task.dateTo) : null,
          plannedEffort: task.plannedEffort,
          positionNumber: task.positionNumber,
          creatorUserId: task.creatorUserId,
          parentTaskId: task.parentTaskId,
          previousTaskId: task.previousTaskId,
          orderItemId: task.orderItemId,
          customerId: task.customerId,
          articleId: task.articleId,
          ticketId: task.ticketId,
          calendarEventId: task.calendarEventId,
          userOfLastStatusChangeId: task.userOfLastStatusChangeId,
          allowOverBooking: task.allowOverBooking ?? false,
          allowTimeBooking: task.allowTimeBooking ?? true,
          billableStatus: task.billableStatus,
          invoicingStatus: task.invoicingStatus,
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
      success++
    } catch (error) {
      console.error(`  ❌ Fehler bei Task ${task.id}:`, error)
      failed++
    }
  }
  
  console.log(`  ✅ ${success} Aufgaben synchronisiert, ${failed} fehlgeschlagen`)
  return { success, failed }
}

async function syncOrders(): Promise<{ success: number; failed: number }> {
  console.log('📦 Synchronisiere Aufträge...')
  let success = 0, failed = 0
  
  const orders = await fetchWeClappOrders()
  console.log(`  📊 ${orders.length} Aufträge von WeClapp geladen`)
  
  for (const order of orders) {
    try {
      await prisma.weClappOrder.upsert({
        where: { id: order.id },
        update: {
          orderNumber: order.orderNumber,
          orderNumberAtCustomer: order.orderNumberAtCustomer,
          orderStatus: order.status,
          orderDate: order.orderDate ? new Date(order.orderDate) : null,
          customerId: order.customerId,
          invoiceRecipientId: order.invoiceRecipientId,
          totalAmount: order.netAmount || order.grossAmount,
          currency: order.currencyId,
          note: order.note,
          invoiced: order.invoiced ?? false,
          paid: order.paid ?? false,
          shipped: order.shipped ?? false,
          servicesFinished: order.servicesFinished ?? false,
          projectModeActive: order.projectModeActive ?? false,
          warehouseId: order.warehouseId,
          quotationId: order.quotationId,
          plannedProjectStartDate: order.plannedProjectStartDate ? new Date(order.plannedProjectStartDate) : null,
          plannedProjectEndDate: order.plannedProjectEndDate ? new Date(order.plannedProjectEndDate) : null,
          billingAddress: order.recordAddress,
          shippingAddress: order.shippingAddress,
          orderItems: order.orderItems,
          payments: order.payments,
          projectMembers: order.projectMembers,
          statusHistory: order.statusHistory,
          customAttributes: order.customAttributes,
          lastModifiedDate: new Date(order.lastModifiedDate),
          weClappLastModified: new Date(order.lastModifiedDate),
          lastSyncAt: new Date(),
          isActive: true,
        },
        create: {
          id: order.id,
          orderNumber: order.orderNumber,
          orderNumberAtCustomer: order.orderNumberAtCustomer,
          orderStatus: order.status,
          orderDate: order.orderDate ? new Date(order.orderDate) : null,
          customerId: order.customerId,
          invoiceRecipientId: order.invoiceRecipientId,
          totalAmount: order.netAmount || order.grossAmount,
          currency: order.currencyId,
          note: order.note,
          invoiced: order.invoiced ?? false,
          paid: order.paid ?? false,
          shipped: order.shipped ?? false,
          servicesFinished: order.servicesFinished ?? false,
          projectModeActive: order.projectModeActive ?? false,
          warehouseId: order.warehouseId,
          quotationId: order.quotationId,
          plannedProjectStartDate: order.plannedProjectStartDate ? new Date(order.plannedProjectStartDate) : null,
          plannedProjectEndDate: order.plannedProjectEndDate ? new Date(order.plannedProjectEndDate) : null,
          billingAddress: order.recordAddress,
          shippingAddress: order.shippingAddress,
          orderItems: order.orderItems,
          payments: order.payments,
          projectMembers: order.projectMembers,
          statusHistory: order.statusHistory,
          customAttributes: order.customAttributes,
          createdDate: new Date(order.createdDate),
          lastModifiedDate: new Date(order.lastModifiedDate),
          weClappLastModified: new Date(order.lastModifiedDate),
          lastSyncAt: new Date(),
          isActive: true,
        },
      })
      success++
    } catch (error) {
      console.error(`  ❌ Fehler bei Order ${order.id}:`, error)
      failed++
    }
  }
  
  console.log(`  ✅ ${success} Aufträge synchronisiert, ${failed} fehlgeschlagen`)
  return { success, failed }
}

async function syncTimeEntries(): Promise<{ success: number; failed: number }> {
  console.log('⏱️ Synchronisiere Zeiteinträge...')
  let success = 0, failed = 0
  
  const timeRecords = await fetchWeClappTimeRecords()
  console.log(`  📊 ${timeRecords.length} Zeiteinträge von WeClapp geladen`)
  
  for (const record of timeRecords) {
    try {
      await prisma.weClappTimeEntry.upsert({
        where: { id: record.id },
        update: {
          taskId: record.taskId,
          userId: record.userId,
          customerId: record.customerId,
          projectId: record.projectId,
          salesOrderId: record.salesOrderId,
          articleId: record.articleId,
          ticketId: record.ticketId,
          description: record.description,
          startDate: record.startDate ? new Date(record.startDate) : null,
          durationSeconds: record.durationSeconds,
          billableDurationSeconds: record.billableDurationSeconds,
          billable: record.billable ?? false,
          billableInvoiceStatus: record.billableInvoiceStatus,
          hourlyRate: record.hourlyRate,
          printOnPerformanceRecord: record.printOnPerformanceRecord ?? false,
          customAttributes: record.customAttributes,
          lastModifiedDate: new Date(record.lastModifiedDate),
          weClappLastModified: new Date(record.lastModifiedDate),
          lastSyncAt: new Date(),
          isActive: true,
        },
        create: {
          id: record.id,
          taskId: record.taskId,
          userId: record.userId,
          customerId: record.customerId,
          projectId: record.projectId,
          salesOrderId: record.salesOrderId,
          articleId: record.articleId,
          ticketId: record.ticketId,
          description: record.description,
          startDate: record.startDate ? new Date(record.startDate) : null,
          durationSeconds: record.durationSeconds,
          billableDurationSeconds: record.billableDurationSeconds,
          billable: record.billable ?? false,
          billableInvoiceStatus: record.billableInvoiceStatus,
          hourlyRate: record.hourlyRate,
          printOnPerformanceRecord: record.printOnPerformanceRecord ?? false,
          customAttributes: record.customAttributes,
          createdDate: new Date(record.createdDate),
          lastModifiedDate: new Date(record.lastModifiedDate),
          weClappLastModified: new Date(record.lastModifiedDate),
          lastSyncAt: new Date(),
          isActive: true,
        },
      })
      success++
    } catch (error) {
      console.error(`  ❌ Fehler bei TimeEntry ${record.id}:`, error)
      failed++
    }
  }
  
  console.log(`  ✅ ${success} Zeiteinträge synchronisiert, ${failed} fehlgeschlagen`)
  return { success, failed }
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
