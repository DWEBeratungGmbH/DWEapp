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

    // Return mock response if API is not configured
    if (!apiUrl || !apiKey || apiUrl.includes('mock') || apiKey.includes('mock')) {
      console.log('Using mock data - WeClapp API not configured')
      
      const mockTask = {
        id: id,
        title: 'Mock Task Title',
        description: 'Mock task description for testing',
        status: 'OPEN',
        priority: 'MEDIUM',
        estimatedHours: 4,
        actualHours: 2,
        assignedUser: '1',
        assignedUserName: 'Mock User',
        assignedUserId: '1',
        orderId: null,
        orderNumber: null,
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        createdDate: new Date(Date.now() - 86400000 * 2).toISOString()
      }

      return NextResponse.json({
        success: true,
        task: mockTask
      })
    }

    // WeClapp API v2 - Einzelne Aufgabe abrufen
    const response = await axios.get(`${apiUrl}/task/id/${id}`, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    const task = response.data.result
    
    if (!task || !task.id) {
      return NextResponse.json(
        { error: 'Task not found or invalid response' },
        { status: 404 }
      )
    }
    
    // Transformiere die Antwort für das Frontend
    const transformedTask = {
      id: task.id,
      title: task.name || task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedUser: task.assignedUserId,
      assignedUserName: task.assignedUserName,
      assignedUserId: task.assignedUserId,
      orderId: task.orderId,
      orderNumber: task.orderNumber,
      createdDate: task.createdDate,
      estimatedHours: task.plannedWorkingTimePerUnit ? task.plannedWorkingTimePerUnit / 3600 : null,
      actualHours: task.actualWorkingTime ? task.actualWorkingTime / 3600 : null
    }

    return NextResponse.json({
      success: true,
      task: transformedTask
    })
  } catch (error: any) {
    console.error('WeClapp Task API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Aufgabe',
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

    // Return mock response if API is not configured
    if (!apiUrl || !apiKey || apiUrl.includes('mock') || apiKey.includes('mock')) {
      console.log('Using mock data - WeClapp API not configured')
      
      const mockTask = {
        id: id,
        title: body.name || 'Updated Mock Task',
        description: body.description || 'Updated mock task description',
        status: body.status || 'OPEN',
        priority: body.priority || 'MEDIUM',
        estimatedHours: body.estimatedHours || 4,
        actualHours: body.actualHours || 2,
        assignedUser: body.assignedUserId,
        assignedUserName: body.assignedUserId ? 'Updated User' : null,
        assignedUserId: body.assignedUserId,
        orderId: body.orderId,
        orderNumber: body.orderNumber,
        dueDate: body.dueDate || new Date(Date.now() + 86400000 * 7).toISOString(),
        createdDate: new Date(Date.now() - 86400000 * 2).toISOString()
      }

      console.log(`Mock Task updated: ${mockTask.id}`)

      return NextResponse.json({
        success: true,
        task: mockTask
      })
    }

    // WeClapp API v2 - Task aktualisieren
    const weClappTaskData = {
      name: body.name,
      description: body.description || '',
      status: body.status || 'OPEN',
      priority: body.priority || 'MEDIUM',
      plannedWorkingTimePerUnit: body.estimatedHours ? body.estimatedHours * 3600 : 3600,
      assignedUserId: body.assignedUserId,
      dueDate: body.dueDate
    }

    const response = await axios.put(`${apiUrl}/task/id/${id}`, weClappTaskData, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    console.log(`WeClapp API v2 - Task updated: ${response.data.result?.id || 'unknown'}`)

    // Transformiere die Antwort für das Frontend
    const updatedTask = response.data.result
    const transformedTask = {
      id: updatedTask.id,
      title: updatedTask.name || updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate,
      assignedUser: updatedTask.assignedUserId,
      assignedUserName: updatedTask.assignedUserName,
      assignedUserId: updatedTask.assignedUserId,
      orderId: updatedTask.orderId,
      orderNumber: updatedTask.orderNumber,
      createdDate: updatedTask.createdDate,
      estimatedHours: updatedTask.plannedWorkingTimePerUnit ? updatedTask.plannedWorkingTimePerUnit / 3600 : null,
      actualHours: updatedTask.actualWorkingTime ? updatedTask.actualWorkingTime / 3600 : null
    }

    return NextResponse.json({
      success: true,
      task: transformedTask
    })
  } catch (error: any) {
    console.error('WeClapp Task Update API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Aktualisieren der Aufgabe',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
    const id = params.id

    // Return mock response if API is not configured
    if (!apiUrl || !apiKey || apiUrl.includes('mock') || apiKey.includes('mock')) {
      console.log('Using mock data - WeClapp API not configured')
      console.log(`Mock Task deleted: ${id}`)

      return NextResponse.json({
        success: true,
        message: 'Task deleted successfully'
      })
    }

    // WeClapp API v2 - Task löschen
    await axios.delete(`${apiUrl}/task/id/${id}`, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    console.log(`WeClapp API v2 - Task deleted: ${id}`)

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error: any) {
    console.error('WeClapp Task Delete API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Löschen der Aufgabe',
        details: error.response?.data || error.message 
      },
      { status: error.response?.status || 500 }
    )
  }
}
