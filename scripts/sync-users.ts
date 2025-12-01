import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// WeClapp Config hardcoded fallback da process.env manchmal zickt in npx scripts ohne dotenv
const WECLAPP_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL || 'https://dwe.weclapp.com/webapp/api/v2'
const WECLAPP_TOKEN = process.env.NEXT_PUBLIC_WECLAPP_API_KEY || '56eb9c41-5f17-42d3-a96b-b2b561254bfc'

async function main() {
  console.log(`Fetching users from WeClapp (${WECLAPP_URL})...`)
  
  try {
    const response = await axios.get(`${WECLAPP_URL}/user`, {
      headers: { 'AuthenticationToken': WECLAPP_TOKEN }
    })
    
    const users = response.data.result
    console.log(`Found ${users.length} users in WeClapp. Syncing to DB...`)
    
    let synced = 0
    for (const user of users) {
      await prisma.weClappUser.upsert({
        where: { id: user.id },
        update: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          status: user.active ? 'ACTIVE' : 'NOT_ACTIVE',
          lastSyncAt: new Date()
        },
        create: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          status: user.active ? 'ACTIVE' : 'NOT_ACTIVE',
          lastSyncAt: new Date()
        }
      })
      synced++
    }
    
    console.log(`✅ ${synced} Users synced successfully`)
    
  } catch (error: any) {
    console.error('❌ Error syncing users:', error.message)
    if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
