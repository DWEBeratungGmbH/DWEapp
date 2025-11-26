import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Typ für einen Task von der WeClapp API
interface WeClappTask {
  id: string
  name: string
  status: string
  priority: string
  dueDate?: number
  assignedUser?: string
  assignedUserId?: string
  description?: string
  orderId?: string
  salesOrderId?: string
  orderNumber?: string
  orderItemId?: string
  createdDate?: number
  estimatedHours?: number
  actualHours?: number
  [key: string]: any
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
    const orderId = params.id

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API-Konfiguration fehlt' },
        { status: 500 }
      )
    }

    console.log(`Rufe Aufgaben für Auftrag ${orderId} ab...`)

    // Hole alle Tasks und filtere nach Auftrags-ID
    const tasksResponse = await axios.get(`${apiUrl}/task`, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    const allTasks: WeClappTask[] = tasksResponse.data.result || []
    
    // Filtere Tasks nach verschiedenen Auftragsfeldern
    const orderTasks = allTasks.filter(task => 
      task.orderId === orderId || 
      task.salesOrderId === orderId ||
      (task.orderNumber && task.orderNumber.includes(orderId))
    )

    console.log(`${orderTasks.length} von ${allTasks.length} Tasks gehören zu Auftrag ${orderId}`)

    // Berechne zusätzliche Metriken
    const taskStats = {
      total: orderTasks.length,
      completed: orderTasks.filter(t => t.status === 'COMPLETED').length,
      inProgress: orderTasks.filter(t => t.status === 'IN_PROGRESS').length,
      pending: orderTasks.filter(t => t.status === 'TODO' || t.status === 'OPEN').length,
      overdue: orderTasks.filter(t => {
        if (!t.dueDate) return false
        return new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
      }).length,
      totalEstimatedHours: orderTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
      totalActualHours: orderTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0),
    }

    // Sortiere Tasks nach Priorität und Fälligkeit
    const sortedTasks = orderTasks.sort((a, b) => {
      // Priorität sortieren (HIGH > MEDIUM > LOW)
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }
      
      // Nach Fälligkeit sortieren (früheste zuerst)
      if (a.dueDate && b.dueDate) {
        return a.dueDate - b.dueDate
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      
      // Nach Erstellungsdatum sortieren
      return (b.createdDate || 0) - (a.createdDate || 0)
    })

    return NextResponse.json({ 
      result: sortedTasks,
      stats: taskStats,
      orderId: orderId
    })
  } catch (error: any) {
    console.error('WeClapp Order Tasks API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Auftragsaufgaben',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
    const orderId = params.id
    const body = await request.json()

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API-Konfiguration fehlt' },
        { status: 500 }
      )
    }

    // Erstelle neuen Task für diesen Auftrag
    const taskData = {
      ...body,
      orderId: orderId,
      salesOrderId: orderId,
    }

    const response = await axios.post(`${apiUrl}/task`, taskData, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    console.log(`Neue Aufgabe für Auftrag ${orderId} erstellt: ${response.data.result.id}`)

    return NextResponse.json({ 
      success: true,
      result: response.data.result
    })
  } catch (error: any) {
    console.error('WeClapp Create Task API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Erstellen der Aufgabe',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}
