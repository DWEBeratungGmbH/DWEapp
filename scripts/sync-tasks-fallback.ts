import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// WeClapp API Config
const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL;
const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY;

if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
  throw new Error('WeClapp API nicht konfiguriert');
}

async function fetchFromWeClapp(endpoint: string) {
  const url = `${WECLAPP_API_URL}${endpoint}?pageSize=1000`;
  
  const response = await fetch(url, {
    headers: {
      'AuthenticationToken': WECLAPP_API_KEY!,
      'Content-Type': 'application/json',
    } as HeadersInit,
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('WeClapp API Error:', error);
    throw new Error(`WeClapp API Fehler: ${response.status}`);
  }
  
  const data = await response.json();
  return data.result || [];
}

async function syncTasksWithFallback() {
  console.log('📋 Synchronisiere Aufgaben mit Fallback-Logik...');
  let success = 0, failed = 0, fallback = 0;
  
  try {
    const allTasks = await fetchFromWeClapp('/task');
    console.log(`  📊 ${allTasks.length} Aufgaben von WeClapp geladen`);
    
    // Hole alle gültigen User IDs für Prüfung
    const validUsers = await prisma.weClappUser.findMany({
      select: { id: true }
    });
    const validUserIds = new Set(validUsers.map(u => u.id));
    console.log(`  🔍 ${validUserIds.size} gültige User-IDs in der DB gefunden`);
    
    // Hole alle gültigen Customer IDs für Prüfung
    const validParties = await prisma.weClappParty.findMany({
      select: { id: true }
    });
    const validPartyIds = new Set(validParties.map(p => p.id));
    console.log(`  🔍 ${validPartyIds.size} gültige Party-IDs in der DB gefunden`);
    
    for (const task of allTasks) {
      try {
        // Prüfe ob Foreign Keys gültig sind
        const creatorId = task.creatorUserId;
        const customerId = task.customerId;
        
        const hasValidCreator = !creatorId || validUserIds.has(creatorId);
        const hasValidCustomer = !customerId || validPartyIds.has(customerId);
        
        if (hasValidCreator && hasValidCustomer) {
          // Normaler Sync mit gültigen Foreign Keys
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
          });
          success++;
        } else {
          // Fallback: Speichern mit NULL für ungültige Foreign Keys
          const fallbackData = {
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
            creatorUserId: hasValidCreator ? task.creatorUserId : null,
            parentTaskId: task.parentTaskId,
            previousTaskId: task.previousTaskId,
            orderItemId: task.orderItemId,
            customerId: hasValidCustomer ? task.customerId : null,
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
          };

          await prisma.weClappTask.upsert({
            where: { id: task.id },
            update: fallbackData,
            create: {
              id: task.id,
              createdDate: new Date(task.createdDate),
              ...fallbackData,
            },
          });
          fallback++;
          
          const invalidFields = [];
          if (!hasValidCreator && creatorId) invalidFields.push(`creatorUserId: ${creatorId}`);
          if (!hasValidCustomer && customerId) invalidFields.push(`customerId: ${customerId}`);
          
          console.log(`  🔄 Task ${task.id}: Ungültige Foreign Keys [${invalidFields.join(', ')}] als NULL gespeichert`);
        }
      } catch (error) {
        console.error(`  ❌ Fehler bei Task ${task.id}:`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Laden der Tasks:', error);
    failed++;
  }
  
  console.log(`  ✅ ${success} Tasks normal synchronisiert`);
  console.log(`  🔄 ${fallback} Tasks mit Fallback (ungültige FKs=NULL) synchronisiert`);
  console.log(`  ❌ ${failed} Tasks fehlgeschlagen`);
  
  return { success, fallback, failed };
}

async function main() {
  console.log('🚀 Starte Tasks Synchronisation mit Fallback...');
  
  try {
    const result = await syncTasksWithFallback();
    
    console.log('\n✅ TASKS-SYNCHRONISATION ABGESCHLOSSEN:');
    console.log(`  Normal: ${result.success}`);
    console.log(`  Fallback: ${result.fallback}`);
    console.log(`  Fehlgeschlagen: ${result.failed}`);
    console.log(`  Gesamt: ${result.success + result.fallback + result.failed}`);
    
  } catch (error) {
    console.error('❌ Sync Fehler:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
