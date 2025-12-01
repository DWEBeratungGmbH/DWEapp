import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Importing WeClapp users to App users...')

  // 1. Alle aktiven WeClapp User laden
  const weClappUsers = await prisma.weClappUser.findMany({
    where: { status: 'ACTIVE' }
  })

  console.log(`Found ${weClappUsers.length} active WeClapp users.`)

  let created = 0
  let updated = 0

  for (const wUser of weClappUsers) {
    if (!wUser.email) {
      console.log(`⚠️ Skipping ${wUser.username}: No email`)
      continue
    }

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: wUser.email },
      update: {
        firstName: wUser.firstName,
        lastName: wUser.lastName,
        weClappUserId: wUser.id
      },
      create: {
        email: wUser.email,
        name: `${wUser.firstName} ${wUser.lastName}`.trim() || wUser.username || wUser.email,
        firstName: wUser.firstName,
        lastName: wUser.lastName,
        role: 'USER', // Standardrolle
        weClappUserId: wUser.id,
        isActive: true
      }
    })

    if (user.createdAt.getTime() === user.updatedAt.getTime()) {
      created++
    } else {
      updated++
    }
  }

  console.log(`✅ Import finished: ${created} created, ${updated} updated / linked.`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
