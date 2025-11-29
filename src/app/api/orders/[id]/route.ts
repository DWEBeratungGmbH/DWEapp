import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Mock Order Daten für temporäre Lösung
const mockOrder = {
  id: '1007',
  orderNumber: '1007',
  orderDate: Date.now() - 86400000 * 7, // 7 Tage alt
  status: 'ORDER_CONFIRMATION_PRINTED',
  customerId: '148381',
  customerNumber: '100001',
  netAmount: '345.00',
  grossAmount: '410.55',
  recordCurrencyName: 'EUR',
  description: 'Entwurfsplanung und Sanierung',
  invoiceAddress: {
    firstName: 'Bastian',
    lastName: 'Huber',
    city: 'Aachen',
    street1: 'Eynattener Straße 1',
    zipcode: '52064',
    countryCode: 'DE'
  },
  orderItems: [
    {
      id: '12345',
      title: 'Ausstellen der Nachweise',
      quantity: '3',
      unitPrice: '136.85',
      articleNumber: 'A4.1',
      description: 'Erstellung aller erforderlichen Nachweise'
    }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    
    // Für Demo-Zwecke geben wir immer die gleichen Mock-Daten zurück
    if (orderId === '1007') {
      return NextResponse.json({
        result: mockOrder
      })
    }
    
    // Für andere IDs versuchen wir die echte API
    const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
      return NextResponse.json(
        { error: 'API-Konfiguration fehlt' },
        { status: 500 }
      )
    }

    // Versuche verschiedene Endpunkte
    const endpoints = ['/salesorder', '/order', '/salesOrder']
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${WECLAPP_API_URL}${endpoint}/${orderId}`, {
          headers: {
            'AuthenticationToken': WECLAPP_API_KEY,
            'Content-Type': 'application/json',
          }
        })
        
        if (response.ok) {
          return NextResponse.json(await response.json())
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed, trying next...`)
        continue
      }
    }
    
    // Wenn nichts funktioniert, geben wir einen Fehler zurück
    return NextResponse.json(
      { error: 'Auftrag nicht gefunden' },
      { status: 404 }
    )
    
  } catch (error: any) {
    console.error('Order API Error:', error)
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen des Auftrags',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API-Konfiguration fehlt' },
        { status: 500 }
      )
    }

    const response = await axios.put(`${apiUrl}/salesorder/${id}`, body, {
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
