import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// WeClapp Webhook Secret aus Environment
const WEBHOOK_SECRET = process.env.WECLAPP_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  try {
    // Webhook-Signatur verifizieren
    const signature = request.headers.get('x-weclapp-signature')
    const body = await request.text()
    
    if (!signature || !WEBHOOK_SECRET) {
      console.error('❌ Webhook: Missing signature or secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // HMAC-SHA256 Signatur prüfen
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error('❌ Webhook: Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    const payload = JSON.parse(body)
    console.log(`📥 Webhook empfangen: ${payload.eventType} für ${payload.entityId}`)
    
    // Webhook-Log speichern
    const webhookLog = await prisma.weClappWebhookLog.create({
      data: {
        eventType: payload.eventType,
        entityId: payload.entityId,
        payload: payload,
        receivedAt: new Date(),
      },
    })
    
    // Event-Typ verarbeiten
    let processed = false
    let error = null
    
    try {
      if (payload.eventType.startsWith('task.')) {
        await handleTaskWebhook(payload)
        processed = true
      } else if (payload.eventType.startsWith('salesOrder.')) {
        await handleOrderWebhook(payload)
        processed = true
      } else if (payload.eventType.startsWith('timeRecord.')) {
        await handleTimeEntryWebhook(payload)
        processed = true
      } else if (payload.eventType.startsWith('user.')) {
        await handleUserWebhook(payload)
        processed = true
      } else if (payload.eventType.startsWith('party.')) {
        await handlePartyWebhook(payload)
        processed = true
      } else {
        console.log(`⚠️ Unbekannter Event-Typ: ${payload.eventType}`)
        processed = true // Ignorieren aber als verarbeitet markieren
      }
    } catch (err) {
      console.error(`❌ Fehler bei Verarbeitung von ${payload.eventType}:`, err)
      error = err instanceof Error ? err.message : 'Unknown error'
    }
    
    // Webhook-Log aktualisieren
    await prisma.weClappWebhookLog.update({
      where: { id: webhookLog.id },
      data: {
        processed,
        error,
        processedAt: processed ? new Date() : null,
      },
    })
    
    return NextResponse.json({ 
      success: true, 
      processed,
      webhookLogId: webhookLog.id 
    })
    
  } catch (error) {
    console.error('❌ Webhook Fehler:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// ========================================
// WeClapp API Helper
// ========================================

function getWeClappConfig() {
  const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
  const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
  
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
    throw new Error('WeClapp API nicht konfiguriert')
  }
  
  return { WECLAPP_API_URL, WECLAPP_API_KEY }
}

async function fetchFromWeClapp(endpoint: string) {
  const { WECLAPP_API_URL, WECLAPP_API_KEY } = getWeClappConfig()
  
  const response = await fetch(`${WECLAPP_API_URL}${endpoint}`, {
    headers: {
      'AuthenticationToken': WECLAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`WeClapp API Fehler: ${response.status}`)
  }
  
  return response.json()
}

// ========================================
// TASK Webhook Handler
// ========================================

async function handleTaskWebhook(payload: any) {
  const { eventType, entityId } = payload
  
  if (eventType === 'task.deleted') {
    await prisma.weClappTask.update({
      where: { id: entityId },
      data: { isActive: false },
    }).catch(() => {
      // Task existiert nicht mehr - ignorieren
    })
    console.log(`🗑️ Aufgabe ${entityId} als gelöscht markiert`)
    return
  }
  
  const task = await fetchFromWeClapp(`/task/id/${entityId}`)
  
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
  
  console.log(`✅ Aufgabe ${task.id} (${task.subject}) synchronisiert`)
}

// ========================================
// SALES ORDER Webhook Handler
// ========================================

async function handleOrderWebhook(payload: any) {
  const { eventType, entityId } = payload
  
  if (eventType === 'salesOrder.deleted') {
    await prisma.weClappOrder.update({
      where: { id: entityId },
      data: { isActive: false },
    }).catch(() => {})
    console.log(`🗑️ Auftrag ${entityId} als gelöscht markiert`)
    return
  }
  
  const order = await fetchFromWeClapp(`/salesOrder/id/${entityId}`)
  
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
  
  console.log(`✅ Auftrag ${order.id} (${order.orderNumber}) synchronisiert`)
}

// ========================================
// TIME RECORD Webhook Handler
// ========================================

async function handleTimeEntryWebhook(payload: any) {
  const { eventType, entityId } = payload
  
  if (eventType === 'timeRecord.deleted') {
    await prisma.weClappTimeEntry.update({
      where: { id: entityId },
      data: { isActive: false },
    }).catch(() => {})
    console.log(`🗑️ Zeiteintrag ${entityId} als gelöscht markiert`)
    return
  }
  
  const record = await fetchFromWeClapp(`/timeRecord/id/${entityId}`)
  
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
  
  console.log(`✅ Zeiteintrag ${record.id} synchronisiert`)
}

// ========================================
// USER Webhook Handler
// ========================================

async function handleUserWebhook(payload: any) {
  const { eventType, entityId } = payload
  
  if (eventType === 'user.deleted') {
    // WeClapp-User als inaktiv markieren (nicht löschen wegen Referenzen)
    await prisma.weClappUser.update({
      where: { id: entityId },
      data: { status: 'NOT_ACTIVE' },
    }).catch(() => {})
    console.log(`🗑️ WeClapp-User ${entityId} als inaktiv markiert`)
    return
  }
  
  const user = await fetchFromWeClapp(`/user/id/${entityId}`)
  
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
  
  console.log(`✅ WeClapp-User ${user.id} (${user.firstName} ${user.lastName}) synchronisiert`)
}

// ========================================
// PARTY Webhook Handler
// ========================================

async function handlePartyWebhook(payload: any) {
  const { eventType, entityId } = payload
  
  if (eventType === 'party.deleted') {
    await prisma.weClappParty.update({
      where: { id: entityId },
      data: { isActive: false },
    }).catch(() => {})
    console.log(`🗑️ Party ${entityId} als gelöscht markiert`)
    return
  }
  
  const party = await fetchFromWeClapp(`/party/id/${entityId}`)
  
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
  
  console.log(`✅ Party ${party.id} (${party.company || `${party.firstName} ${party.lastName}`}) synchronisiert`)
}
