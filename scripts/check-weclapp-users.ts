import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const count = await prisma.weClappUser.count();
    const users = await prisma.weClappUser.findMany({ 
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true
      }
    });
    
    console.log('WeClapp Users in DB:', count);
    console.log('First 5 users:', users);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
