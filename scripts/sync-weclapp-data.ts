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

async function syncParties() {
  console.log('🏢 Synchronisiere Parties...');
  let success = 0, failed = 0;
  
  try {
    const parties = await fetchFromWeClapp('/party');
    console.log(`  📊 ${parties.length} Parties von WeClapp geladen`);
    
    for (const party of parties) {
      try {
        await prisma.weClappParty.upsert({
          where: { id: party.id },
          update: {
            partyType: party.partyType,
            company: party.company,
            firstName: party.firstName,
            lastName: party.lastName,
            email: party.email,
            customer: party.customer ?? false,
            customerNumber: party.customerNumber,
            supplier: party.supplier ?? false,
            supplierNumber: party.supplierNumber,
            lastModifiedDate: party.lastModifiedDate ? new Date(party.lastModifiedDate) : null,
            lastSyncAt: new Date(),
            isActive: true,
          },
          create: {
            id: party.id,
            partyType: party.partyType,
            company: party.company,
            firstName: party.firstName,
            lastName: party.lastName,
            email: party.email,
            customer: party.customer ?? false,
            customerNumber: party.customerNumber,
            supplier: party.supplier ?? false,
            supplierNumber: party.supplierNumber,
            createdDate: party.createdDate ? new Date(party.createdDate) : null,
            lastModifiedDate: party.lastModifiedDate ? new Date(party.lastModifiedDate) : null,
            lastSyncAt: new Date(),
            isActive: true,
          },
        });
        success++;
      } catch (error) {
        console.error(`  ❌ Fehler bei Party ${party.id}:`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Laden der Parties:', error);
    failed++;
  }
  
  console.log(`  ✅ ${success} Parties synchronisiert, ${failed} fehlgeschlagen`);
  return { success, failed };
}

async function syncOrders() {
  console.log('📦 Synchronisiere Aufträge...');
  let success = 0, failed = 0;
  
  try {
    const orders = await fetchFromWeClapp('/salesOrder');
    console.log(`  📊 ${orders.length} Aufträge von WeClapp geladen`);
    
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
            totalAmount: order.netAmount || order.grossAmount,
            currency: order.currencyId,
            note: order.note,
            invoiced: order.invoiced ?? false,
            paid: order.paid ?? false,
            shipped: order.shipped ?? false,
            servicesFinished: order.servicesFinished ?? false,
            projectModeActive: order.projectModeActive ?? false,
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
            totalAmount: order.netAmount || order.grossAmount,
            currency: order.currencyId,
            note: order.note,
            invoiced: order.invoiced ?? false,
            paid: order.paid ?? false,
            shipped: order.shipped ?? false,
            servicesFinished: order.servicesFinished ?? false,
            projectModeActive: order.projectModeActive ?? false,
            createdDate: new Date(order.createdDate),
            lastModifiedDate: new Date(order.lastModifiedDate),
            weClappLastModified: new Date(order.lastModifiedDate),
            lastSyncAt: new Date(),
            isActive: true,
          },
        });
        success++;
      } catch (error) {
        console.error(`  ❌ Fehler bei Order ${order.id}:`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Laden der Orders:', error);
    failed++;
  }
  
  console.log(`  ✅ ${success} Aufträge synchronisiert, ${failed} fehlgeschlagen`);
  return { success, failed };
}

async function syncTasks() {
  console.log('📋 Synchronisiere Aufgaben...');
  let success = 0, failed = 0;
  
  try {
    const tasks = await fetchFromWeClapp('/task');
    console.log(`  📊 ${tasks.length} Aufgaben von WeClapp geladen`);
    
    for (const task of tasks) {
      try {
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
            creatorUserId: task.creatorUserId,
            customerId: task.customerId,
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
            creatorUserId: task.creatorUserId,
            customerId: task.customerId,
            createdDate: new Date(task.createdDate),
            lastModifiedDate: new Date(task.lastModifiedDate),
            weClappLastModified: new Date(task.lastModifiedDate),
            lastSyncAt: new Date(),
            isActive: true,
          },
        });
        success++;
      } catch (error) {
        console.error(`  ❌ Fehler bei Task ${task.id}:`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Laden der Tasks:', error);
    failed++;
  }
  
  console.log(`  ✅ ${success} Aufgaben synchronisiert, ${failed} fehlgeschlagen`);
  return { success, failed };
}

async function syncTimeEntries() {
  console.log('⏱️ Synchronisiere Zeiteinträge...');
  let success = 0, failed = 0;
  
  try {
    const timeRecords = await fetchFromWeClapp('/timeRecord');
    console.log(`  📊 ${timeRecords.length} Zeiteinträge von WeClapp geladen`);
    
    for (const record of timeRecords) {
      try {
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
      } catch (error) {
        console.error(`  ❌ Fehler bei TimeEntry ${record.id}:`, error);
        failed++;
      }
    }
  } catch (error) {
    console.error('❌ Fehler beim Laden der TimeEntries:', error);
    failed++;
  }
  
  console.log(`  ✅ ${success} Zeiteinträge synchronisiert, ${failed} fehlgeschlagen`);
  return { success, failed };
}

async function main() {
  console.log('🚀 Starte WeClapp Datensynchronisation...');
  
  try {
    const partiesResult = await syncParties();
    const ordersResult = await syncOrders();
    const tasksResult = await syncTasks();
    const timeEntriesResult = await syncTimeEntries();
    
    console.log('\n✅ SYNCHRONISATION ABGESCHLOSSEN:');
    console.log(`  Parties: ${partiesResult.success} erfolgreich, ${partiesResult.failed} fehlgeschlagen`);
    console.log(`  Orders: ${ordersResult.success} erfolgreich, ${ordersResult.failed} fehlgeschlagen`);
    console.log(`  Tasks: ${tasksResult.success} erfolgreich, ${tasksResult.failed} fehlgeschlagen`);
    console.log(`  TimeEntries: ${timeEntriesResult.success} erfolgreich, ${timeEntriesResult.failed} fehlgeschlagen`);
    
  } catch (error) {
    console.error('❌ Sync Fehler:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
