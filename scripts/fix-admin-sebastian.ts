import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'sebastian@dwe-beratung.de'
  
  console.log(`Checking user: ${email}...`)

  // 1. WeClapp User suchen (Sebastian Möhrer)
  const weClappUser = await prisma.weClappUser.findFirst({
    where: {
      OR: [
        { email: { equals: email, mode: 'insensitive' } },
        { 
          AND: [
            { firstName: { contains: 'Sebastian', mode: 'insensitive' } },
            { lastName: { contains: 'Möhrer', mode: 'insensitive' } }
          ]
        }
      ]
    }
  })

  if (weClappUser) {
    console.log(`✅ WeClapp User gefunden: ${weClappUser.firstName} ${weClappUser.lastName} (${weClappUser.email})`)
  } else {
    console.log('⚠️ Kein passender WeClapp User gefunden. Bitte erst WeClapp Sync durchführen.')
  }

  // 2. App User erstellen oder aktualisieren
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      weClappUserId: weClappUser?.id // Nur updaten wenn WeClapp User gefunden
    },
    create: {
      email,
      name: 'Sebastian Möhrer',
      firstName: 'Sebastian',
      lastName: 'Möhrer',
      role: 'ADMIN',
      weClappUserId: weClappUser?.id,
      isActive: true
    }
  })

  console.log(`✅ User ${user.email} ist jetzt ${user.role}`)
  if (user.weClappUserId) {
    console.log(`✅ Verknüpft mit WeClapp User ID: ${user.weClappUserId}`)
  } else {
    console.log('⚠️ Nicht mit WeClapp User verknüpft.')
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
