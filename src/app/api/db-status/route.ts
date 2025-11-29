import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Tabellen prüfen
    const tables = {
      tasks: await prisma.weClappTask.count(),
      orders: await prisma.weClappOrder.count(),
      timeEntries: await prisma.weClappTimeEntry.count(),
      webhookLogs: await prisma.weClappWebhookLog.count(),
      users: await prisma.user.count(),
    }
    
    // Letzte Synchronisation prüfen
    const lastTask = await prisma.weClappTask.findFirst({
      orderBy: { lastSyncAt: 'desc' },
      select: { lastSyncAt: true, id: true, subject: true }
    })
    
    const lastWebhook = await prisma.weClappWebhookLog.findFirst({
      orderBy: { receivedAt: 'desc' },
      select: { receivedAt: true, eventType: true, processed: true }
    })
    
    // Beispiel-Daten
    const sampleTasks = await prisma.weClappTask.findMany({
      take: 5,
      select: {
        id: true,
        subject: true,
        taskStatus: true,
        taskPriority: true,
        createdDate: true,
        lastSyncAt: true,
      }
    })
    
    return Response.json({
      success: true,
      database: {
        tables,
        lastSync: {
          task: lastTask,
          webhook: lastWebhook,
        },
        sampleTasks,
      },
      message: tables.tasks > 0 
        ? 'Daten wurden synchronisiert' 
        : 'Keine Daten gefunden - initiale Sync erforderlich'
    })
    
  } catch (error) {
    console.error('❌ DB Status Fehler:', error)
    return Response.json({
      error: 'Datenbank-Fehler',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
