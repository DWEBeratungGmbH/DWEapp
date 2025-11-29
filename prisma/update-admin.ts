import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAdminUser() {
  try {
    console.log('🔍 Suche Benutzer sebastian@dwe-beratung.de...')
    
    const user = await prisma.user.findUnique({
      where: { email: 'sebastian@dwe-beratung.de' }
    })

    if (!user) {
      console.log('❌ Benutzer nicht gefunden')
      return
    }

    console.log(`✅ Benutzer gefunden: ${user.name || user.email}`)
    console.log(`📝 Aktuelle Rolle: ${user.role}`)

    // Rolle auf ADMIN ändern
    const updatedUser = await prisma.user.update({
      where: { email: 'sebastian@dwe-beratung.de' },
      data: { role: 'ADMIN' }
    })

    console.log(`🎉 Rolle aktualisiert auf: ${updatedUser.role}`)
    console.log('✅ Benutzer hat jetzt Admin-Rechte!')
    
  } catch (error) {
    console.error('❌ Fehler:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminUser()
