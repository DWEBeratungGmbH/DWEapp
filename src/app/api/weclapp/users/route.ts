import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL

    if (!apiKey || !apiUrl) {
      return NextResponse.json({ error: 'API configuration missing' }, { status: 500 })
    }

    // Fetch users from WeClapp
    const response = await fetch(`${apiUrl}/user?pageSize=1000&serializeNulls=false`, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`WeClapp API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Nur relevante Felder zurückgeben
    const users = data.result.map((user: any) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username, // Manchmal ist email leer, dann username nutzen
      active: user.active
    }))

    return NextResponse.json({ result: users })
  } catch (error: any) {
    console.error('Error fetching WeClapp users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    )
  }
}
