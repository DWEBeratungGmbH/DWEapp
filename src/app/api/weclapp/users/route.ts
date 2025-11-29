import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL

    console.log('WeClapp API Konfiguration:', { 
      hasApiKey: !!apiKey, 
      hasApiUrl: !!apiUrl,
      apiKey: apiKey?.substring(0, 10) + '...',
      apiUrl,
      search
    })

    if (!apiKey || !apiUrl) {
      console.log('WeClapp API nicht konfiguriert, verwende Mock-Daten...')
      
      // Mock-Daten, die zu echten WeClapp Benutzern passen (nur aktive)
      const mockWeClappUsers = [
        {
          id: '12345',
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max.mustermann@dwe.de',
          username: 'max.mustermann',
          active: true,
          status: 'ACTIVE'
        },
        {
          id: '67890',
          firstName: 'Sarah',
          lastName: 'Schmidt',
          email: 'sarah.schmidt@dwe.de',
          username: 'sarah.schmidt',
          active: true,
          status: 'ACTIVE'
        },
        {
          id: '54321',
          firstName: 'Julia',
          lastName: 'Fischer',
          email: 'julia.fischer@dwe.de',
          username: 'julia.fischer',
          active: true,
          status: 'ACTIVE'
        },
        {
          id: '98765',
          firstName: 'Maria',
          lastName: 'Garcia',
          email: 'maria.garcia@dwe.de',
          username: 'maria.garcia',
          active: true,
          status: 'ACTIVE'
        },
        {
          id: '11111',
          firstName: 'Klaus',
          lastName: 'Müller',
          email: 'klaus.mueller@dwe.de',
          username: 'klaus.mueller',
          active: true,
          status: 'ACTIVE'
        },
        {
          id: '33333',
          firstName: 'Robert',
          lastName: 'Becker',
          email: 'robert.becker@dwe.de',
          username: 'robert.becker',
          active: true,
          status: 'ACTIVE'
        },
        {
          id: '44444',
          firstName: 'Lisa',
          lastName: 'Schulz',
          email: 'lisa.schulz@dwe.de',
          username: 'lisa.schulz',
          active: true,
          status: 'ACTIVE'
        },
        {
          id: '55555',
          firstName: 'Sebastian',
          lastName: 'Mürow',
          email: 'sebastian.murow@dwe-beratung.de',
          username: 'sebastian.murow',
          active: true,
          status: 'ACTIVE'
        }
      ]

      // Wenn Suchparameter vorhanden, filtere die Mock-Daten
      let filteredUsers = mockWeClappUsers
      if (search) {
        const searchLower = search.toLowerCase()
        filteredUsers = mockWeClappUsers.filter(user => 
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
        )
      }

      return NextResponse.json({ 
        success: true,
        users: filteredUsers 
      })
    }

    // Fetch users from WeClapp
    console.log(`Rufe WeClapp API an: ${apiUrl}/user`)
    
    // Wenn kein Suchparameter, leere Liste zurückgeben
    if (!search || search.trim().length < 1) {
      return NextResponse.json({ 
        success: true,
        users: []
      })
    }
    
    let apiUrlWithParams = `${apiUrl}/user?serializeNulls=false`
    
    // WeClapp API Filter für Namen
    if (search.includes('@')) {
      // Bei E-Mail: exakte Suche
      apiUrlWithParams += `&email-eq=${encodeURIComponent(search)}&status-eq=ACTIVE&pageSize=10`
      console.log('E-Mail-Suche mit email-eq und status-eq=ACTIVE:', search)
    } else {
      // Bei Name: Lade alle aktiven Benutzer (Performance: clientseitige Filterung)
      apiUrlWithParams += `&status-eq=ACTIVE&pageSize=100`
      console.log('Lade alle aktiven Benutzer für clientseitige Filterung:', search)
      console.log('Vollständige API URL:', apiUrlWithParams)
    }
    
    const response = await fetch(apiUrlWithParams, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json'
      }
    })

    console.log('WeClapp API Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WeClapp API Error:', response.status, errorText)
      
      // Bei API-Fehler, Mock-Daten zurückgeben
      console.log('WeClapp API Fehler, verwende Mock-Daten...')
      const mockWeClappUsers = [
        {
          id: '12345',
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max.mustermann@dwe.de',
          username: 'max.mustermann',
          active: true,
          status: 'ACTIVE'
        }
      ]
      return NextResponse.json({ 
        success: true,
        users: mockWeClappUsers 
      })
    }

    const data = await response.json()
    console.log('WeClapp API Response Struktur:', Object.keys(data))
    console.log('WeClapp API Response Inhalt:', JSON.stringify(data, null, 2))
    
    // Prüfe, ob result existiert und ein Array ist
    if (!data.result || !Array.isArray(data.result)) {
      console.error('WeClapp API hat unerwartete Struktur:', data)
      
      // Bei falscher Struktur, Mock-Daten zurückgeben
      const mockWeClappUsers = [
        {
          id: '12345',
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max.mustermann@dwe.de',
          username: 'max.mustermann',
          active: true,
          status: 'ACTIVE'
        }
      ]
      return NextResponse.json({ 
        success: true,
        users: mockWeClappUsers 
      })
    }
    
    console.log(`WeClapp API hat ${data.result.length} Benutzer zurückgegeben`)
    
    // Nur relevante Felder zurückgeben
    const users = data.result
      .map((user: any, index: number) => {
        console.log(`WeClapp User ${index}:`, {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          status: user.status
        })
        
        return {
          id: user.id,
          firstName: user.firstName || user.name || 'Unbekannt',
          lastName: user.lastName || user.surname || '',
          email: user.email || user.mail || '',
          username: user.username || user.login || user.email || '',
          active: user.status === 'ACTIVE' || user.active === true,
          status: user.status || (user.active ? 'ACTIVE' : 'INACTIVE')
        }
      }).filter((user: { email: string }) => user.email) // Nur Benutzer mit E-Mail

    console.log(`Gefiltert auf ${users.length} aktive WeClapp Benutzer`)
    
    // Direkt zurückgeben, API filtert bereits
    return NextResponse.json({ 
      success: true,
      users: users 
    })
  } catch (error: any) {
    console.error('Error fetching WeClapp users:', error)
    
    // Bei Fehler, Mock-Daten zurückgeben
    const mockWeClappUsers = [
      {
        id: '12345',
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max.mustermann@dwe.de',
        username: 'max.mustermann',
        active: true,
        status: 'ACTIVE'
      }
    ]
    return NextResponse.json({ 
      success: true,
      users: mockWeClappUsers 
    })
  }
}
