import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Admin-User erstellen
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dwe.de' },
    update: {},
    create: {
      email: 'admin@dwe.de',
      name: 'Admin User',
      role: 'ADMIN',
      department: 'IT',
      weClappUserId: 'admin-weclapp-id',
      isActive: true
    }
  })

  console.log('Admin user created:', adminUser)

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
