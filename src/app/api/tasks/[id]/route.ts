import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

// GET - Einzelne Aufgabe laden
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Session prüfen
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
      // Mock-Daten wenn API nicht konfiguriert
      return NextResponse.json({
        success: true,
        task: getMockTask(id)
      })
    }

    // WeClapp API - Aufgabe laden
    const response = await fetch(`${WECLAPP_API_URL}/task/id/${id}`, {
      headers: {
        'AuthenticationToken': WECLAPP_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 })
      }
      throw new Error(`WeClapp API Fehler: ${response.status}`)
    }

    const data = await response.json()
    const task = data.result || data

    return NextResponse.json({
      success: true,
      task: {
        ...task,
        // App-spezifische Felder
        canEdit: true,
        canDelete: true,
      }
    })
    
  } catch (error: any) {
    console.error('Task GET Error:', error)
    return NextResponse.json({ 
      error: 'Fehler beim Laden der Aufgabe',
      details: error.message 
    }, { status: 500 })
  }
}

// PUT - Aufgabe aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
      return NextResponse.json({
        success: true,
        task: { id, ...body }
      })
    }

    // Erst aktuelle Version laden
    const getResponse = await fetch(`${WECLAPP_API_URL}/task/id/${id}`, {
      headers: {
        'AuthenticationToken': WECLAPP_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!getResponse.ok) {
      throw new Error('Aufgabe nicht gefunden')
    }

    const currentData = await getResponse.json()
    const currentTask = currentData.result || currentData

    // Update-Daten zusammenstellen (nur geänderte Felder)
    const updateData: any = {
      version: currentTask.version, // Version ist erforderlich für Updates
    }

    if (body.subject !== undefined) updateData.subject = body.subject
    if (body.description !== undefined) updateData.description = body.description
    if (body.taskStatus !== undefined) updateData.taskStatus = body.taskStatus
    if (body.taskPriority !== undefined) updateData.taskPriority = body.taskPriority
    if (body.dateFrom !== undefined) updateData.dateFrom = body.dateFrom
    if (body.dateTo !== undefined) updateData.dateTo = body.dateTo
    if (body.plannedEffort !== undefined) updateData.plannedEffort = body.plannedEffort
    if (body.assignees !== undefined) updateData.assignees = body.assignees

    // WeClapp API - Aufgabe aktualisieren
    const response = await fetch(`${WECLAPP_API_URL}/task/id/${id}`, {
      method: 'PUT',
      headers: {
        'AuthenticationToken': WECLAPP_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WeClapp Update Error:', errorText)
      throw new Error(`WeClapp API Fehler: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Aufgabe aktualisiert: ${id}`)

    return NextResponse.json({
      success: true,
      task: data.result || data
    })
    
  } catch (error: any) {
    console.error('Task PUT Error:', error)
    return NextResponse.json({ 
      error: 'Fehler beim Aktualisieren',
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE - Aufgabe löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
      return NextResponse.json({ success: true, message: 'Aufgabe gelöscht' })
    }

    const response = await fetch(`${WECLAPP_API_URL}/task/id/${id}`, {
      method: 'DELETE',
      headers: {
        'AuthenticationToken': WECLAPP_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok && response.status !== 204) {
      throw new Error(`WeClapp API Fehler: ${response.status}`)
    }

    console.log(`✅ Aufgabe gelöscht: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Aufgabe erfolgreich gelöscht'
    })
    
  } catch (error: any) {
    console.error('Task DELETE Error:', error)
    return NextResponse.json({ 
      error: 'Fehler beim Löschen',
      details: error.message 
    }, { status: 500 })
  }
}

// Mock-Task für Tests
function getMockTask(id: string) {
  return {
    id,
    subject: 'Mock Aufgabe',
    description: '<p>Dies ist eine Test-Aufgabe.</p>',
    identifier: 'TASK-001',
    taskStatus: 'IN_PROGRESS',
    taskPriority: 'MEDIUM',
    dateFrom: Date.now(),
    dateTo: Date.now() + 86400000 * 7,
    plannedEffort: 14400, // 4 Stunden in Sekunden
    assignees: [{ id: '1', userId: '1' }],
    watchers: [],
    creatorUserId: '1',
    createdDate: Date.now() - 86400000 * 2,
    lastModifiedDate: Date.now(),
    canEdit: true,
    canDelete: true,
  }
}
