import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.weClappTask.count()
  console.log('Total Tasks:', count)
  
  // Zeige welche creatorUserIds es gibt
  const creators = await prisma.weClappTask.groupBy({
    by: ['creatorUserId'],
    _count: true,
    orderBy: { _count: { creatorUserId: 'desc' } },
    take: 10
  })
  console.log('\nTop Creator User IDs:')
  creators.forEach(c => {
    console.log(`  ${c.creatorUserId || 'NULL'}: ${c._count} Tasks`)
  })
  
  // Zeige alle WeClapp Users
  const users = await prisma.weClappUser.findMany({
    select: { id: true, firstName: true, lastName: true, email: true }
  })
  console.log('\nWeClapp Users:', users.length)
  users.forEach(u => {
    console.log(`  ${u.id}: ${u.firstName} ${u.lastName} (${u.email})`)
  })
  
  // Zeige verknüpfte App-Users
  const appUsers = await prisma.user.findMany({
    where: { weClappUserId: { not: null } },
    select: { id: true, email: true, weClappUserId: true }
  })
  console.log('\nVerknüpfte App-Users:', appUsers.length)
  appUsers.forEach(u => {
    console.log(`  ${u.email} -> WeClapp: ${u.weClappUserId}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
