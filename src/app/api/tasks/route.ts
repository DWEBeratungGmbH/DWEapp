import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

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

    // Hole die orderId aus den Query-Parametern
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId Parameter fehlt' },
        { status: 400 }
      )
    }

    console.log(`Rufe Tasks für Auftrag ${orderId} ab...`)

    // WeClapp API Endpunkt für Tasks mit Filter nach orderId
    const response = await axios.get(`${apiUrl}/task?orderId=${orderId}`, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    console.log(`Gefunden: ${response.data.result?.length || 0} Tasks für Auftrag ${orderId}`)
    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('WeClapp Tasks API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Tasks',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}
