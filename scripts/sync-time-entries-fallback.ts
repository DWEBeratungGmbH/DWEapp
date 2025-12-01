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

async function syncTimeEntriesWithFallback() {
  console.log('⏱️ Synchronisiere Zeiteinträge mit Fallback-Logik...');
  let success = 0, failed = 0, fallback = 0;
  
  try {
    const timeRecords = await fetchFromWeClapp('/timeRecord');
    console.log(`  📊 ${timeRecords.length} Zeiteinträge von WeClapp geladen`);
    
    // Hole alle gültigen Task IDs für Prüfung
    const validTasks = await prisma.weClappTask.findMany({
      select: { id: true }
    });
    const validTaskIds = new Set(validTasks.map(t => t.id));
    console.log(`  🔍 ${validTaskIds.size} gültige Task-IDs in der DB gefunden`);
    
    for (const record of timeRecords) {
      try {
        // Prüfe ob Task-ID gültig ist
        const taskId = record.taskId;
        const hasValidTask = taskId && validTaskIds.has(taskId);
        
        if (hasValidTask) {
          // Normaler Sync mit gültiger Task-ID
          await prisma.weClappTimeEntry.upsert({
            where: { id: record.id },
            update: {
              taskId: record.taskId,
              userId: record.userId,
              customerId: record.customerId,
              salesOrderId: record.salesOrderId,
              description: record.description,
              startDate: record.startDate ? new Date(record.startDate) : null,
              durationSeconds: record.durationSeconds,
              billableDurationSeconds: record.billableDurationSeconds,
              billable: record.billable ?? false,
              hourlyRate: record.hourlyRate,
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
              salesOrderId: record.salesOrderId,
              description: record.description,
              startDate: record.startDate ? new Date(record.startDate) : null,
              durationSeconds: record.durationSeconds,
              billableDurationSeconds: record.billableDurationSeconds,
              billable: record.billable ?? false,
              hourlyRate: record.hourlyRate,
              createdDate: new Date(record.createdDate),
              lastModifiedDate: new Date(record.lastModifiedDate),
              weClappLastModified: new Date(record.lastModifiedDate),
              lastSyncAt: new Date(),
              isActive: true,
            },
          });
          success++;
        } else {
          // Fallback: Speichern ohne Task-ID (NULL)
          await prisma.weClappTimeEntry.upsert({
            where: { id: record.id },
            update: {
              taskId: null, // Ungültige Task-ID auf NULL setzen
              userId: record.userId,
              customerId: record.customerId,
              salesOrderId: record.salesOrderId,
              description: record.description,
              startDate: record.startDate ? new Date(record.startDate) : null,
              durationSeconds: record.durationSeconds,
              billableDurationSeconds: record.billableDurationSeconds,
              billable: record.billable ?? false,
              hourlyRate: record.hourlyRate,
              lastModifiedDate: new Date(record.lastModifiedDate),
              weClappLastModified: new Date(record.lastModifiedDate),
              lastSyncAt: new Date(),
              isActive: true,
            },
            create: {
              id: record.id,
              taskId: null, // Ungültige Task-ID auf NULL setzen
              userId: record.userId,
              customerId: record.customerId,
              salesOrderId: record.salesOrderId,
              description: record.description,
              startDate: record.startDate ? new Date(record.startDate) : null,
              durationSeconds: record.durationSeconds,
              billableDurationSeconds: record.billableDurationSeconds,
              billable: record.billable ?? false,
              hourlyRate: record.hourlyRate,
              createdDate: new Date(record.createdDate),
              lastModifiedDate: new Date(record.lastModifiedDate),
              weClappLastModified: new Date(record.lastModifiedDate),
              lastSyncAt: new Date(),
              isActive: true,
            },
          });
          fallback++;
          console.log(`  🔄 TimeEntry ${record.id}: Task-ID ${taskId} ungültig, als NULL gespeichert`);
        }
      } catch (error) {
        console.error(`  ❌ Fehler bei TimeEntry ${record.id}:`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Laden der TimeEntries:', error);
    failed++;
  }
  
  console.log(`  ✅ ${success} TimeEntries normal synchronisiert`);
  console.log(`  🔄 ${fallback} TimeEntries mit Fallback (taskId=NULL) synchronisiert`);
  console.log(`  ❌ ${failed} TimeEntries fehlgeschlagen`);
  
  return { success, fallback, failed };
}

async function main() {
  console.log('🚀 Starte TimeEntries Synchronisation mit Fallback...');
  
  try {
    const result = await syncTimeEntriesWithFallback();
    
    console.log('\n✅ TIMEENTRIES-SYNCHRONISATION ABGESCHLOSSEN:');
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
