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
      } else if (payload.eventType.startsWith('timeTracking.')) {
        await handleTimeEntryWebhook(payload)
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

async function handleTaskWebhook(payload: any) {
  const { eventType, entityId } = payload
  
  if (eventType === 'task.deleted') {
    // Aufgabe löschen
    await prisma.weClappTask.delete({
      where: { id: entityId },
    })
    console.log(`🗑️ Aufgabe ${entityId} gelöscht`)
    return
  }
  
  // Aufgabe aus WeClapp holen und speichern/updaten
  const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
  const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
  
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
    throw new Error('WeClapp API nicht konfiguriert')
  }
  
  const response = await fetch(`${WECLAPP_API_URL}/task/id/${entityId}`, {
    headers: {
      'AuthenticationToken': WECLAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`WeClapp API Fehler: ${response.status}`)
  }
  
  const task = await response.json()
  
  // Aufgabe speichern/updaten
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
  
  console.log(`✅ Aufgabe ${task.id} (${task.subject}) synchronisiert`)
}

async function handleOrderWebhook(payload: any) {
  // TODO: Implement Order Webhook Handling
  console.log(`📦 Order Webhook: ${payload.eventType} für ${payload.entityId}`)
}

async function handleTimeEntryWebhook(payload: any) {
  // TODO: Implement TimeEntry Webhook Handling
  console.log(`⏱️ TimeEntry Webhook: ${payload.eventType} für ${payload.entityId}`)
}
