import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { filterTasksByRole, User } from '@/services/roleBasedFilterService'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json()
    const { name, description, status, priority, estimatedHours, orderId } = taskData

    const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
    const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

    // Return mock response if API is not configured
    if (!WECLAPP_API_URL || !WECLAPP_API_KEY || WECLAPP_API_URL.includes('mock') || WECLAPP_API_KEY.includes('mock')) {
      console.log('Using mock data - WeClapp API not configured')
      
      const mockTask = {
        id: `task-${Date.now()}`,
        title: name,
        description: description || '',
        status: status || 'OPEN',
        priority: priority || 'MEDIUM',
        estimatedHours: estimatedHours || 4,
        actualHours: 0,
        assignedUser: null,
        assignedUserName: null,
        orderId: orderId || null,
        orderNumber: orderId || 'A-MOCK-001',
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        createdDate: new Date().toISOString()
      }

      console.log(`Mock Task created: ${mockTask.id}`)

      return NextResponse.json({
        success: true,
        task: mockTask
      })
    }

    // Task in WeClapp API v2 erstellen
    const weClappTaskData = {
      name,
      description: description || '',
      status: status || 'OPEN',
      priority: priority || 'MEDIUM',
      plannedWorkingTimePerUnit: estimatedHours ? estimatedHours * 3600 : 3600, // Convert to seconds
      orderId: orderId,
      // WeClapp API v2 spezifische Felder
      manualQuantity: true,
      invoicingType: 'EFFORT'
    }

    const response = await axios.post(`${WECLAPP_API_URL}/task`, weClappTaskData, {
      headers: {
        'AuthenticationToken': WECLAPP_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    console.log(`WeClapp API v2 - Task created: ${response.data.result?.id || 'unknown'}`)

    // Transformiere die Antwort für das Frontend
    const createdTask = response.data.result
    const transformedTask = {
      id: createdTask.id,
      title: createdTask.name || createdTask.title,
      description: createdTask.description,
      status: createdTask.status,
      priority: createdTask.priority,
      dueDate: createdTask.dueDate,
      assignedUser: createdTask.assignedUserId,
      assignedUserName: createdTask.assignedUserName,
      assignedUserId: createdTask.assignedUserId,
      orderId: createdTask.orderId,
      orderNumber: createdTask.orderNumber,
      createdDate: createdTask.createdDate,
      estimatedHours: createdTask.plannedWorkingTimePerUnit ? createdTask.plannedWorkingTimePerUnit / 3600 : null,
      actualHours: createdTask.actualWorkingTime ? createdTask.actualWorkingTime / 3600 : null
    }

    return NextResponse.json({
      success: true,
      task: transformedTask
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

    // Return mock data if API is not configured
    if (!apiUrl || !apiKey || apiUrl.includes('mock') || apiKey.includes('mock')) {
      console.log('Using mock data - WeClapp API not configured')
      
      const mockTasks = [
        {
          id: 'task-1',
          title: 'API Integration implementieren',
          description: 'WeClapp API mit der Anwendung verbinden',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          estimatedHours: 8,
          actualHours: 4,
          assignedUser: '1',
          assignedUserName: 'Sebastian Möhrer',
          orderId: 'order-1',
          orderNumber: 'A-2024-001',
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          createdDate: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'task-2',
          title: 'Benutzeroberfläche optimieren',
          description: 'UI für bessere Benutzererfahrung verbessern',
          status: 'OPEN',
          priority: 'MEDIUM',
          estimatedHours: 6,
          actualHours: 0,
          assignedUser: '2',
          assignedUserName: 'Bastian Huber',
          orderId: 'order-2',
          orderNumber: 'A-2024-002',
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          createdDate: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'task-3',
          title: 'Dokumentation schreiben',
          description: 'Technische Dokumentation für das Projekt erstellen',
          status: 'COMPLETED',
          priority: 'LOW',
          estimatedHours: 4,
          actualHours: 5,
          assignedUser: '3',
          assignedUserName: 'Anna Schmidt',
          orderId: 'order-3',
          orderNumber: 'A-2024-003',
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          createdDate: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ]

      // Hole die orderId aus den Query-Parametern
      const searchParams = request.nextUrl.searchParams;
      const orderId = searchParams.get('orderId')
      const userId = searchParams.get('userId')
      const userRole = searchParams.get('userRole') as User['role'] | null

      let filteredTasks = mockTasks
      if (orderId) {
        filteredTasks = mockTasks.filter(task => task.orderNumber === orderId)
      }

      // Tasks nach Rolle filtern, falls User-Informationen vorhanden
      if (userId && userRole) {
        const user: User = {
          id: userId,
          email: '',
          name: '',
          role: userRole,
          weClappUserId: userId
        }

        const filteredResult = filterTasksByRole(filteredTasks, user)
        console.log(`Mock Tasks - Nach Rolle ${userRole}: ${filteredResult.totalCount} von ${filteredTasks.length} Tasks`)

        return NextResponse.json({
          success: true,
          tasks: filteredResult.tasks,
          totalCount: filteredResult.totalCount,
          userRole: filteredResult.userRole,
          filters: filteredResult.filters,
          originalCount: filteredTasks.length
        })
      }

      return NextResponse.json({
        success: true,
        tasks: filteredTasks,
        totalCount: filteredTasks.length
      })
    }

    // WeClapp API v2 - Aufgaben abrufen
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')
    const assignedTo = searchParams.getAll('assignedTo') // Mehrere Benutzer unterstützen
    const orderId = searchParams.get('orderId')
    
    // API v2 verwendet singular Endpunkt für Tasks
    let url = `${apiUrl}/task`
    const params = new URLSearchParams()
    
    // Filter für zugewiesene Aufgaben (mehrere Benutzer)
    if (assignedTo && assignedTo.length > 0) {
      // WeClapp API unterstützt möglicherweise keine Array-Parameter, 
      // daher holen wir alle Aufgaben und filtern client-seitig
      console.log(`Filter für ${assignedTo.length} Benutzer:`, assignedTo)
    }
    
    // Filter für spezifischen Auftrag
    if (orderId) {
      params.append('orderId', orderId)
    }
    
    // Sortierung nach Erstellungsdatum (neueste zuerst)
    params.append('sort', 'createdDate')
    params.append('order', 'desc')
    
    // Pagination - nur 20 Aufgaben pro Aufruf
    params.append('page', '1')
    params.append('pageSize', '50') // Erhöht für bessere Filter-Ergebnisse
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }

    console.log(`WeClapp API v2 - Fetching tasks from: ${url}`)

    const response = await axios.get(url, {
      headers: {
        'AuthenticationToken': apiKey,
        'Content-Type': 'application/json',
      },
    })

    const tasks = response.data.result || []
    console.log(`WeClapp API v2 - Retrieved ${tasks.length} tasks`)

    // Tasks für die Anwendung transformieren
    let transformedTasks = tasks.map((task: any) => ({
      id: task.id,
      title: task.name || task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedUser: task.assignedUserId,
      assignedUserName: task.assignedUserName || task.assignees?.[0]?.name,
      assignedUserId: task.assignedUserId,
      orderId: task.orderId,
      orderNumber: task.orderNumber,
      createdDate: task.createdDate,
      estimatedHours: task.plannedWorkingTimePerUnit ? task.plannedWorkingTimePerUnit / 3600 : null,
      actualHours: task.actualWorkingTime ? task.actualWorkingTime / 3600 : null
    }))

    // Client-seitiger Filter für mehrere Benutzer (falls API keine Array-Parameter unterstützt)
    if (assignedTo && assignedTo.length > 0) {
      const transformedTasksBefore = transformedTasks.length
      transformedTasks = transformedTasks.filter((task: any) => 
        assignedTo.includes(task.assignedUserId || '') ||
        assignedTo.includes(task.assignedUser || '') ||
        (task.assignees && task.assignees.some((assignee: any) => assignedTo.includes(assignee.id)))
      )
      console.log(`Multi-User Filter: ${transformedTasksBefore} → ${transformedTasks.length} Tasks`)
    }

    // Tasks nach Rolle filtern, falls User-Informationen vorhanden
    if (userId && userRole) {
      const user: User = {
        id: userId,
        email: '',
        name: '',
        role: userRole as User['role'], // Type assertion since we validated userRole exists
        weClappUserId: userId
      }

      const filteredResult = filterTasksByRole(transformedTasks, user)
      console.log(`WeClapp API v2 - Nach Rolle ${userRole}: ${filteredResult.totalCount} von ${transformedTasks.length} Tasks`)

      return NextResponse.json({
        success: true,
        tasks: filteredResult.tasks,
        totalCount: filteredResult.totalCount,
        userRole: filteredResult.userRole,
        filters: filteredResult.filters,
        originalCount: transformedTasks.length
      })
    }

    return NextResponse.json({
      success: true,
      tasks: transformedTasks,
      totalCount: transformedTasks.length
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
