import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function linkAzureAccount() {
  try {
    console.log('🔍 Suche Benutzer sebastian@dwe-beratung.de...')
    
    const user = await prisma.user.findUnique({
      where: { email: 'sebastian@dwe-beratung.de' },
      include: {
        accounts: true
      }
    })

    if (!user) {
      console.log('❌ Benutzer nicht gefunden')
      return
    }

    console.log(`✅ Benutzer gefunden: ${user.name || user.email}`)
    console.log(`📝 Aktuelle Rolle: ${user.role}`)
    console.log(`🔗 Verknüpfte Accounts: ${user.accounts.length}`)

    if (user.accounts.length > 0) {
      console.log('ℹ️  Benutzer hat bereits verknüpfte Accounts:')
      user.accounts.forEach(account => {
        console.log(`   - Provider: ${account.provider}, Account ID: ${account.providerAccountId}`)
      })
    } else {
      console.log('⚠️  Keine verknüpften Accounts gefunden')
      console.log('💡 Bitte melde dich zuerst über Azure AD an, dann führen wir dieses Script erneut aus')
    }
    
  } catch (error) {
    console.error('❌ Fehler:', error)
  } finally {
    await prisma.$disconnect()
  }
}

linkAzureAccount()
