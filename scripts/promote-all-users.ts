import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log('Current Users:', users.length)
  
  const result = await prisma.user.updateMany({
    data: { role: 'ADMIN' }
  })
  
  console.log(`Promoted ${result.count} users to ADMIN`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
