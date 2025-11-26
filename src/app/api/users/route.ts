import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Typ für einen User von der WeClapp API
interface WeClappUser {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  status: string
  roles?: string[]
  department?: string
  position?: string
  phone?: string
  mobile?: string
  createdDate?: number
  lastModifiedDate?: number
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    // Return mock data if API is not configured
    if (!apiUrl || !apiKey || apiUrl.includes('mock') || apiKey.includes('mock')) {
      console.log('Using mock data - WeClapp API not configured')
      
      const mockUsers = [
        {
          id: '1',
          name: 'Sebastian Möhrer',
          firstName: 'Sebastian',
          lastName: 'Möhrer',
          email: 'sebastian@dwe-beratung.de',
          username: 'sebastian.moehrer',
          department: 'Management',
          position: 'CEO',
          active: true,
          roles: ['admin', 'manager'],
          profileMatched: true,
          localUserId: '1',
          phone: '+49 123 456789',
          mobile: '+49 123 456789',
          createdDate: Date.now() - 86400000 * 365,
          lastLoginDate: Date.now() - 86400000
        },
        {
          id: '2',
          name: 'Bastian Huber',
          firstName: 'Bastian',
          lastName: 'Huber',
          email: 'bastian.huber@dwe-beratung.de',
          username: 'bastian.huber',
          department: 'Development',
          position: 'Senior Developer',
          active: true,
          roles: ['employee'],
          profileMatched: true,
          localUserId: '2',
          phone: '+49 123 456788',
          mobile: '+49 123 456788',
          createdDate: Date.now() - 86400000 * 180,
          lastLoginDate: Date.now() - 86400000 * 2
        },
        {
          id: '3',
          name: 'Anna Schmidt',
          firstName: 'Anna',
          lastName: 'Schmidt',
          email: 'anna.schmidt@dwe-beratung.de',
          username: 'anna.schmidt',
          department: 'Sales',
          position: 'Sales Manager',
          active: true,
          roles: ['manager'],
          profileMatched: false,
          localUserId: null,
          phone: '+49 123 456787',
          mobile: '+49 123 456787',
          createdDate: Date.now() - 86400000 * 90,
          lastLoginDate: Date.now() - 86400000 * 5
        },
        {
          id: '4',
          name: 'Thomas Weber',
          firstName: 'Thomas',
          lastName: 'Weber',
          email: 'thomas.weber@dwe-beratung.de',
          username: 'thomas.weber',
          department: 'Support',
          position: 'Support Specialist',
          active: false,
          roles: ['employee'],
          profileMatched: false,
          localUserId: null,
          phone: '+49 123 456786',
          mobile: '+49 123 456786',
          createdDate: Date.now() - 86400000 * 30,
          lastLoginDate: Date.now() - 86400000 * 10
        }
      ]

      return NextResponse.json({ result: mockUsers })
    }

    console.log('Rufe alle Benutzer von WeClapp ab...')

    // WeClapp API Endpunkt für alle Benutzer
    const usersResponse = await axios.get(`${apiUrl}/user`, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    const allUsers: WeClappUser[] = usersResponse.data.result || []
    console.log(`Gefunden: ${allUsers.length} Benutzer insgesamt`)

    // Zeige einen Beispiel-Benutzer, um die Struktur zu verstehen
    if (allUsers.length > 0) {
      console.log('Beispiel-Benutzer Struktur:', JSON.stringify(allUsers[0], null, 2))
    }

    // Filtere nur aktive Benutzer
    const activeUsers = allUsers.filter(user => user.status === 'ACTIVE')
    console.log(`Aktive Benutzer: ${activeUsers.length} von ${allUsers.length}`)

    // Transformiere Benutzer in unser Format
    const transformedUsers = activeUsers.map((user: WeClappUser) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      department: user.department,
      position: user.position,
      phone: user.phone,
      mobilePhoneNumber: user.mobilePhoneNumber || user.mobile,
      status: user.status === 'ACTIVE',
      roles: user.roles || [],
      createdDate: user.createdDate,
      lastModifiedDate: user.lastModifiedDate,
      // Profile matching status - initially unmatched
      profileMatched: false,
      localUserId: null,
    }))

    console.log(`Gib ${transformedUsers.length} transformierte Benutzer zurück`)
    return NextResponse.json({ result: transformedUsers })
  } catch (error: any) {
    console.error('WeClapp Users API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Benutzer',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, localUserId, role } = body

    if (!userId || !localUserId) {
      return NextResponse.json(
        { error: 'userId und localUserId sind erforderlich' },
        { status: 400 }
      )
    }

    // Hier würde die Logik zum Speichern der User-Zuordnung in einer Datenbank stattfinden
    // Für jetzt simulieren wir es mit einer einfachen Antwort
    
    console.log(`User Matching: WeClapp User ${userId} -> Local User ${localUserId} als ${role}`)

    return NextResponse.json({ 
      success: true,
      message: 'Benutzer erfolgreich zugeordnet',
      matching: {
        weClappUserId: userId,
        localUserId: localUserId,
        role: role || 'employee',
        matchedAt: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('User Matching Error:', error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Zuordnen des Benutzers',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
