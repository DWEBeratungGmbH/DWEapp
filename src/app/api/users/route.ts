import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Typ für einen User von der WeClapp API
interface WeClappUser {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  active: boolean
  roles?: string[]
  department?: string
  position?: string
  phone?: string
  mobile?: string
  createdDate?: number
  lastLoginDate?: number
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API-Konfiguration fehlt' },
        { status: 500 }
      )
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
    const activeUsers = allUsers.filter(user => user.active === true)
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
      mobile: user.mobile,
      active: user.active,
      roles: user.roles || [],
      createdDate: user.createdDate,
      lastLoginDate: user.lastLoginDate,
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
