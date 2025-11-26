import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { filterTasksByRole, User } from '@/services/roleBasedFilterService'

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json()
    const { name, description, status, priority, estimatedHours, orderId } = taskData

    const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
      return NextResponse.json(
        { error: 'WeClapp API configuration missing' },
        { status: 500 }
      )
    }

    // Task in WeClapp erstellen
    const weClappTaskData = {
      name,
      description: description || '',
      status: status || 'OPEN',
      priority: priority || 'MEDIUM',
      plannedWorkingTimePerUnit: estimatedHours ? estimatedHours * 3600 : 3600, // Convert to seconds
      orderId: orderId,
      // Weitere WeClapp-spezifische Felder
      manualQuantity: true,
      invoicingType: 'EFFORT'
    }

    const response = await axios.post(`${WECLAPP_API_URL}/task`, weClappTaskData, {
      headers: {
        'AuthenticationToken': WECLAPP_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    console.log(`Task created: ${response.data.result?.id || 'unknown'}`)

    return NextResponse.json({
      success: true,
      task: response.data.result
    })

  } catch (error: any) {
    console.error('Create Task API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Failed to create task',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
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

    // Hole die orderId aus den Query-Parametern
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole') as User['role']

    console.log(`API URL: ${apiUrl}`)
    console.log(`API Key vorhanden: ${!!apiKey}`)
    console.log(`API Key (erste 10 Zeichen): ${apiKey?.substring(0, 10)}...`)

    // WeClapp API Endpunkt für Tasks
    let endpoint = `${apiUrl}/task`
    if (orderId) {
      endpoint += `?orderId=${orderId}`
      console.log(`Rufe Tasks für Auftrag ${orderId} ab...`)
    } else {
      console.log(`Rufe alle Tasks ab...`)
    }

    const response = await axios.get(endpoint, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    const allTasks = response.data.result || []
    console.log(`Gefunden: ${allTasks.length} Tasks`)

    // Tasks nach Rolle filtern, falls User-Informationen vorhanden
    if (userId && userRole) {
      const user: User = {
        id: userId,
        email: '', // Wird vom User Matching Service gefüllt
        name: '',
        role: userRole,
        weClappUserId: userId // Annahme: userId = WeClapp User ID
      }

      const filteredResult = filterTasksByRole(allTasks, user)
      console.log(`Nach Rolle ${userRole}: ${filteredResult.totalCount} von ${allTasks.length} Tasks`)

      return NextResponse.json({
        success: true,
        tasks: filteredResult.tasks,
        totalCount: filteredResult.totalCount,
        userRole: filteredResult.userRole,
        filters: filteredResult.filters,
        originalCount: allTasks.length
      })
    }

    return NextResponse.json({
      success: true,
      tasks: allTasks,
      totalCount: allTasks.length
    })
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
