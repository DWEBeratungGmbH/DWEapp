import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    console.log('API URL:', apiUrl)
    console.log('API Key vorhanden:', !!apiKey)
    console.log('API Key (erste 10 Zeichen):', apiKey?.substring(0, 10))

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API-Konfiguration fehlt' },
        { status: 500 }
      )
    }

    // API v2 Endpunkte testen - salesOrder zuerst, da es vollständige Auftragsdaten enthalten sollte
    const v2Endpoints = ['/salesOrder', '/projectOrderStatusPage']
    let fullUrl = `${apiUrl}/salesOrder` // Standard: Verkaufsaufträge
    let workingEndpoint = null
    
    for (const endpoint of v2Endpoints) {
      try {
        console.log(`Teste API v2 Endpunkt: ${endpoint}`)
        const testResponse = await axios.get(`${apiUrl}${endpoint}`, {
          headers: {
            'AuthenticationToken': apiKey,
            'Content-Type': 'application/json',
          },
        })
        console.log(`✅ ${endpoint} funktioniert! Status: ${testResponse.status}`)
        if (testResponse.data.result && testResponse.data.result.length > 0) {
          console.log(`📊 ${endpoint} enthält ${testResponse.data.result.length} Datensätze`)
        }
        workingEndpoint = endpoint
        break
      } catch (testError: any) {
        console.log(`❌ ${endpoint} funktioniert nicht: ${testError.response?.status}`)
      }
    }
    
    fullUrl = workingEndpoint ? `${apiUrl}${workingEndpoint}` : `${apiUrl}/salesOrder`
    console.log('Verwende API v2 Endpunkt:', fullUrl)

    const response = await axios.get(fullUrl, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    console.log('Erfolgreiche Antwort:', response.status)
    
    // Zeige ein Beispiel-Datensatz, um die Struktur zu verstehen
    if (response.data.result && response.data.result.length > 0) {
      console.log('Beispiel-Auftragsdaten:', JSON.stringify(response.data.result[0], null, 2))
    }
    
    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('WeClapp API Error Details:')
    console.error('Status:', error.response?.status)
    console.error('StatusText:', error.response?.statusText)
    console.error('Data:', error.response?.data)
    console.error('Headers:', error.response?.headers)
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Projekte',
        status: error.response?.status,
        statusText: error.response?.statusText,
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}
