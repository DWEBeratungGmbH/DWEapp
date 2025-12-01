import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== DATENBANK-STATUS ===');
    
    // Users
    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount}`);
    
    // WeClapp Users
    const weClappUserCount = await prisma.weClappUser.count();
    console.log(`WeClapp Users: ${weClappUserCount}`);
    
    // WeClapp Orders
    const orderCount = await prisma.weClappOrder.count();
    console.log(`WeClapp Orders: ${orderCount}`);
    
    // WeClapp Tasks
    const taskCount = await prisma.weClappTask.count();
    console.log(`WeClapp Tasks: ${taskCount}`);
    
    // WeClapp Time Entries
    const timeEntryCount = await prisma.weClappTimeEntry.count();
    console.log(`WeClapp Time Entries: ${timeEntryCount}`);
    
    // WeClapp Parties
    const partyCount = await prisma.weClappParty.count();
    console.log(`WeClapp Parties: ${partyCount}`);
    
    // Sample checks
    console.log('\n=== SAMPLE DATA ===');
    const sampleOrder = await prisma.weClappOrder.findFirst({ select: { id: true, orderNumber: true, orderStatus: true } });
    console.log('Sample Order:', sampleOrder);
    
    const sampleTask = await prisma.weClappTask.findFirst({ select: { id: true, subject: true, taskStatus: true } });
    console.log('Sample Task:', sampleTask);
    
    const sampleTimeEntry = await prisma.weClappTimeEntry.findFirst({ select: { id: true, durationSeconds: true, startDate: true } });
    console.log('Sample Time Entry:', sampleTimeEntry);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
