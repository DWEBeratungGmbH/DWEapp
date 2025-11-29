import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { weClappUserId, userData } = await request.json()
    
    console.log('WeClapp Sync Request:', { weClappUserId, userData })

    if (!weClappUserId || !userData) {
      return NextResponse.json({ 
        success: false, 
        error: 'WeClapp ID und Benutzerdaten erforderlich' 
      }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL

    if (!apiKey || !apiUrl) {
      console.log('WeClapp API nicht konfiguriert, simuliere Sync...')
      // Simuliere erfolgreiche Synchronisation für Mock-Daten
      return NextResponse.json({ 
        success: true, 
        message: 'Mock-Synchronisation erfolgreich' 
      })
    }

    // Synchronisiere Benutzerdaten mit WeClapp
    console.log(`Synchronisiere mit WeClapp API: ${apiUrl}/user/id/${weClappUserId}`)
    
    const response = await fetch(`${apiUrl}/user/id/${weClappUserId}`, {
      method: 'PUT',
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      })
    })

    console.log('WeClapp Sync Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WeClapp Sync Error:', response.status, errorText)
      
      return NextResponse.json({ 
        success: false, 
        error: `WeClapp Sync Fehler: ${response.status}` 
      }, { status: 500 })
    }

    const data = await response.json()
    console.log('WeClapp Sync Response:', data)

    return NextResponse.json({ 
      success: true, 
      message: 'Benutzerdaten erfolgreich mit WeClapp synchronisiert',
      data: data
    })

  } catch (error: any) {
    console.error('WeClapp Sync Error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'Interner Serverfehler bei der WeClapp Synchronisation' 
    }, { status: 500 })
  }
}
