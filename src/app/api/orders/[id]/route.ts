import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
    const id = params.id

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API-Konfiguration fehlt' },
        { status: 500 }
      )
    }

    const response = await axios.get(`${apiUrl}/salesOrder/${id}`, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('WeClapp Order API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen des Auftrags',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
    const id = params.id
    const body = await request.json()

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API-Konfiguration fehlt' },
        { status: 500 }
      )
    }

    const response = await axios.put(`${apiUrl}/salesOrder/${id}`, body, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('WeClapp Order Update API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Aktualisieren des Auftrags',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}
