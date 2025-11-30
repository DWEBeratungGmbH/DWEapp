import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// WeClapp API Konfiguration
const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// ========================================
// BERECHTIGUNGEN
// ========================================

const PERMISSIONS = {
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_EDIT: 'tasks.edit',
  TASKS_DELETE: 'tasks.delete',
}


function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case 'ADMIN':
      return [PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_EDIT, PERMISSIONS.TASKS_DELETE]
    case 'MANAGER':
      return [PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_EDIT, PERMISSIONS.TASKS_DELETE]
    default:
      return [PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_CREATE, PERMISSIONS.TASKS_EDIT]
  }
}

function getTaskDataScope(role: string): 'all' | 'own' {
  return role === 'ADMIN' || role === 'MANAGER' ? 'all' : 'own'
}

// ========================================
// WECLAPP API HELPER
// ========================================

// Cache für WeClapp-Benutzer (5 Minuten)
let usersCache: { data: any[], timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000

async function fetchWeClappUsers(): Promise<any[]> {
  if (usersCache && Date.now() - usersCache.timestamp < CACHE_DURATION) {
    return usersCache.data
  }
  
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY) return []
  
  try {
    const response = await fetch(`${WECLAPP_API_URL}/user?pageSize=200`, {
      headers: {
        'AuthenticationToken': WECLAPP_API_KEY,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      usersCache = { data: data.result || [], timestamp: Date.now() }
      return usersCache.data
    }
  } catch (error) {
    console.error('Fehler beim Laden der WeClapp-Benutzer:', error)
  }
  
  return []
}

async function fetchWeClappTasks(filters: {
  weClappUserId?: string
  taskDataScope: 'all' | 'own'
  assigneeUserId?: string // Filter für bestimmten Benutzer
  status?: string[]
  priority?: string
  search?: string
  limit?: number
}): Promise<any[]> {
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
    throw new Error('WeClapp API nicht konfiguriert')
  }
  
  const pageSize = Math.min(filters.limit || 200, 200)
  let url = `${WECLAPP_API_URL}/task?pageSize=${pageSize}`
  
  // WeClapp API Filter direkt verwenden
  if (filters.assigneeUserId) {
    url += `&assignees-userId-eq=${filters.assigneeUserId}`
    console.log(`📋 Lade Aufgaben für Benutzer ${filters.assigneeUserId}...`)
  } else if (filters.taskDataScope === 'own' && filters.weClappUserId) {
    url += `&assignees-userId-eq=${filters.weClappUserId}`
    console.log(`📋 Lade eigene Aufgaben für ${filters.weClappUserId}...`)
  } else {
    console.log(`📋 Lade alle Aufgaben (Admin/Manager)...`)
  }
  
  // Status Filter mit WeClapp API
  if (filters.status && filters.status.length > 0) {
    if (filters.status.length === 1) {
      url += `&taskStatus-eq=${filters.status[0]}`
    } else {
      // WeClapp unterstützt 'in' Operator
      url += `&taskStatus-in=["${filters.status.join('","')}"]`
    }
    console.log(`   → Status-Filter: ${filters.status.join(', ')}`)
  }
  
  // Priority Filter
  if (filters.priority && filters.priority !== 'all') {
    url += `&taskPriority-eq=${filters.priority}`
    console.log(`   → Priority-Filter: ${filters.priority}`)
  }
  
  // Suche mit WeClapp 'like' Operator
  if (filters.search) {
    // WeClapp API unterstützt kein subject-like, wir machen Suche client-seitig
    console.log(`   → Suche wird client-seitig durchgeführt: "${filters.search}"`)
  }
  
  const response = await fetch(url, {
    headers: {
      'AuthenticationToken': WECLAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  })
  
  if (response.ok) {
    const data = await response.json()
    const allTasks = data.result || []
    console.log(`   → ${allTasks.length} Aufgaben von WeClapp API`)
    return allTasks
  } else {
    const error = await response.text()
    console.error('WeClapp API Error:', error)
    throw new Error(`WeClapp API Fehler: ${response.status}`)
  }
}

// Order-Informationen laden
async function fetchOrderInfo(orderItemId: string): Promise<any | null> {
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY || !orderItemId) return null
  
  try {
    // Erst das OrderItem laden um die salesOrderId zu bekommen
    const response = await fetch(`${WECLAPP_API_URL}/salesOrderItem/id/${orderItemId}`, {
      headers: {
        'AuthenticationToken': WECLAPP_API_KEY,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const orderItem = await response.json()
      return {
        orderItemId,
        orderNumber: orderItem.result?.orderNumber || orderItem.orderNumber,
        articleNumber: orderItem.result?.articleNumber || orderItem.articleNumber,
        title: orderItem.result?.title || orderItem.title,
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden der Order-Info:', error)
  }
  
  return null
}

// ========================================
// GET - Aufgaben laden
// ========================================

export async function GET(request: NextRequest) {
  try {
    // URL Parameter
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const priorityParam = searchParams.get('priority')
    const searchParam = searchParams.get('q')?.trim()
    const limitParam = searchParams.get('limit') || '200'
    const includeCompleted = searchParams.get('includeCompleted') === 'true'
    const assigneeUserId = searchParams.get('assigneeUserId')
    const includeUsers = searchParams.get('includeUsers') === 'true'
    
    // Session prüfen
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    // Benutzer aus DB laden
    const users = await prisma.$queryRaw`
      SELECT * FROM users WHERE email = ${session.user.email}
    ` as any[]
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }
    
    const user = users[0]
    const role = user.role || 'USER'
    const weClappUserId = user.weClappUserId
    const taskDataScope = getTaskDataScope(role)
    
    console.log(`👤 Benutzer: ${user.email}, Rolle: ${role}, WeClapp-ID: ${weClappUserId || 'nicht verbunden'}`)
    
    // WeClapp-Verbindung prüfen
    if (!weClappUserId) {
      return getMockTasks(role, taskDataScope)
    }
    
    // Status-Filter
    let statusFilter: string[] | undefined
    if (statusParam) {
      statusFilter = statusParam.split(',').filter(Boolean)
    } else if (!includeCompleted) {
      statusFilter = ['NOT_STARTED', 'IN_PROGRESS', 'WAITING_ON_OTHERS', 'DEFERRED']
    }
    
    // WeClapp-Benutzer laden (für Filter-Dropdown)
    let weClappUsers: any[] = []
    if (includeUsers || assigneeUserId) {
      weClappUsers = await fetchWeClappUsers()
    }
    
    // Echte WeClapp-Daten laden mit allen Filtern
    const limit = Math.min(parseInt(limitParam, 10) || 200, 200)
    const tasks = await fetchWeClappTasks({
      weClappUserId,
      taskDataScope,
      assigneeUserId: taskDataScope === 'all' ? assigneeUserId || undefined : undefined,
      status: statusFilter,
      priority: priorityParam || undefined,
      search: searchParam,
      limit,
    })
    
    // Benutzer-Map erstellen für schnellen Zugriff
    const userMap = new Map(weClappUsers.map((u: any) => [u.id, u]))
    
    // Aufgaben für Frontend formatieren
    const formattedTasks = tasks.map((task: any) => {
      // Assignee-Namen auflösen
      const assigneesWithNames = (task.assignees || []).map((a: any) => {
        const user = userMap.get(a.userId)
        return {
          ...a,
          firstName: user?.firstName,
          lastName: user?.lastName,
          fullName: user ? `${user.firstName} ${user.lastName}` : a.userId,
        }
      })
      
      return {
        id: task.id,
        subject: task.subject || task.name,
        description: task.description,
        taskStatus: task.taskStatus,
        taskPriority: task.taskPriority,
        assignees: assigneesWithNames,
        watchers: task.watchers || [],
        creatorUserId: task.creatorUserId,
        parentTaskId: task.parentTaskId,
        orderItemId: task.orderItemId,
        customerId: task.customerId,
        dateFrom: task.dateFrom,
        dateTo: task.dateTo,
        plannedEffort: task.plannedEffort,
        createdDate: task.createdDate,
        lastModifiedDate: task.lastModifiedDate,
        identifier: task.identifier,
        // Benutzer-spezifische Flags
        isAssignee: task.assignees?.some((a: any) => a.userId === weClappUserId) || false,
        isWatcher: task.watchers?.some((w: any) => w.id === weClappUserId) || false,
        canEdit: role === 'ADMIN' || role === 'MANAGER' || 
                 task.assignees?.some((a: any) => a.userId === weClappUserId),
        canDelete: role === 'ADMIN' || role === 'MANAGER',
      }
    })
    
    // Hauptaufgaben und Unteraufgaben trennen
    let filteredTasks = formattedTasks
    
    // Suche client-seitig durchführen
    if (searchParam) {
      const normalizedSearch = searchParam.toLowerCase()
      filteredTasks = formattedTasks.filter((task: any) => {
        const textParts = [
          task.subject || '',
          task.identifier || '',
          task.description || '',
          ...task.assignees.map((a: any) => a.fullName || a.firstName || a.userId || ''),
        ]
        return textParts.some((part) => part.toLowerCase().includes(normalizedSearch))
      })
      console.log(`   → ${filteredTasks.length} Aufgaben nach Suche (von ${formattedTasks.length})`)
    }
    
    const mainTasks = filteredTasks.filter((t: any) => !t.parentTaskId)
    const subTasksMap = new Map<string, any[]>()
    
    filteredTasks.forEach((t: any) => {
      if (t.parentTaskId) {
        const existing = subTasksMap.get(t.parentTaskId) || []
        existing.push(t)
        subTasksMap.set(t.parentTaskId, existing)
      }
    })
    
    // Unteraufgaben zu Hauptaufgaben hinzufügen
    const tasksWithSubTasks = mainTasks.map((t: any) => ({
      ...t,
      subTasks: subTasksMap.get(t.id) || [],
    }))
    
    // Statistiken berechnen
    const stats = {
      total: filteredTasks.length,
      open: filteredTasks.filter((t: any) => t.taskStatus === 'NOT_STARTED').length,
      inProgress: filteredTasks.filter((t: any) => t.taskStatus === 'IN_PROGRESS').length,
      completed: filteredTasks.filter((t: any) => t.taskStatus === 'COMPLETED').length,
      highPriority: filteredTasks.filter((t: any) => t.taskPriority === 'HIGH').length,
    }
    
    return NextResponse.json({
      success: true,
      tasks: tasksWithSubTasks,
      allTasks: filteredTasks,
      stats,
      users: weClappUsers.map((u: any) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: `${u.firstName} ${u.lastName}`,
        email: u.email,
        active: u.active,
      })),
      userContext: {
        role,
        taskDataScope,
        weClappUserId,
        weClappConnected: true,
      },
    })
    
  } catch (error: any) {
    console.error('Tasks API Error:', error)
    
    if (error.message?.includes('WeClapp')) {
      return getMockTasks('USER', 'own')
    }
    
    return NextResponse.json({ 
      error: 'Fehler beim Laden der Aufgaben',
      details: error.message 
    }, { status: 500 })
  }
}

// ========================================
// POST - Aufgabe erstellen
// ========================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }
    
    const users = await prisma.$queryRaw`
      SELECT * FROM users WHERE email = ${session.user.email}
    ` as any[]
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 })
    }
    
    const user = users[0]
    const role = user.role || 'USER'
    const weClappUserId = user.weClappUserId
    const permissions = getPermissionsForRole(role)
    
    if (!permissions.includes(PERMISSIONS.TASKS_CREATE)) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })
    }
    
    const taskData = await request.json()
    
    // Wenn WeClapp verbunden, echte Aufgabe erstellen
    if (weClappUserId && WECLAPP_API_URL && WECLAPP_API_KEY) {
      const weClappTask = {
        subject: taskData.subject || taskData.title,
        description: taskData.description || '',
        taskStatus: taskData.status || 'NOT_STARTED',
        taskPriority: taskData.priority || 'MEDIUM',
        parentTaskId: taskData.parentTaskId,
        customerId: taskData.customerId,
        // Ersteller als Assignee hinzufügen
        assignees: [{
          userId: weClappUserId,
        }],
      }
      
      const response = await fetch(`${WECLAPP_API_URL}/task`, {
        method: 'POST',
        headers: {
          'AuthenticationToken': WECLAPP_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(weClappTask),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Aufgabe erstellt: ${data.id}`)
        
        return NextResponse.json({ 
          success: true, 
          task: {
            ...data,
            isAssignee: true,
            isWatcher: false,
            canEdit: true,
            canDelete: role === 'ADMIN' || role === 'MANAGER',
          }
        })
      } else {
        const error = await response.text()
        console.error('WeClapp Create Error:', error)
        return NextResponse.json({ 
          error: 'Fehler beim Erstellen in WeClapp',
          details: error 
        }, { status: 500 })
      }
    }
    
    // Mock-Aufgabe wenn nicht verbunden
    const mockTask = {
      id: `task-${Date.now()}`,
      subject: taskData.subject || taskData.title,
      description: taskData.description,
      taskStatus: taskData.status || 'NOT_STARTED',
      taskPriority: taskData.priority || 'MEDIUM',
      assignees: [],
      watchers: [],
      creatorUserId: user.id,
      isAssignee: true,
      isWatcher: false,
      canEdit: true,
      canDelete: role === 'ADMIN' || role === 'MANAGER',
      createdDate: Date.now(),
    }
    
    return NextResponse.json({ success: true, task: mockTask })
    
  } catch (error: any) {
    console.error('Create Task Error:', error)
    return NextResponse.json({ 
      error: 'Fehler beim Erstellen der Aufgabe',
      details: error.message 
    }, { status: 500 })
  }
}

// ========================================
// MOCK-DATEN (wenn WeClapp nicht konfiguriert)
// ========================================

function getMockTasks(role: string, taskDataScope: 'all' | 'own') {
  const allMockTasks = [
    {
      id: 'mock-1',
      subject: 'API Integration implementieren',
      description: 'WeClapp API mit der Anwendung verbinden',
      taskStatus: 'IN_PROGRESS',
      taskPriority: 'HIGH',
      assignees: [{ id: '1', visaId: '1', plannedEffort: 8 }],
      watchers: [],
      creatorUserId: '1',
      isAssignee: true,
      isWatcher: false,
      canEdit: true,
      canDelete: role === 'ADMIN' || role === 'MANAGER',
      createdDate: Date.now() - 86400000 * 3,
      dateFrom: Date.now(),
      dateTo: Date.now() + 86400000 * 14,
    },
    {
      id: 'mock-2',
      subject: 'Benutzeroberfläche optimieren',
      description: 'UI für bessere Benutzererfahrung verbessern',
      taskStatus: 'NOT_STARTED',
      taskPriority: 'MEDIUM',
      assignees: [{ id: '2', userId: '2', plannedEffort: 6 }],
      watchers: [{ id: '1' }],
      creatorUserId: '2',
      isAssignee: false,
      isWatcher: true,
      canEdit: true,
      canDelete: role === 'ADMIN' || role === 'MANAGER',
      createdDate: Date.now() - 86400000,
      dateFrom: Date.now(),
      dateTo: Date.now() + 86400000 * 10,
    },
    {
      id: 'mock-3',
      subject: 'Dokumentation schreiben',
      description: 'Technische Dokumentation für das Projekt erstellen',
      taskStatus: 'COMPLETED',
      taskPriority: 'LOW',
      assignees: [{ id: '3', userId: '3', plannedEffort: 4 }],
      watchers: [],
      creatorUserId: '3',
      isAssignee: false,
      isWatcher: false,
      canEdit: role === 'ADMIN' || role === 'MANAGER',
      canDelete: role === 'ADMIN' || role === 'MANAGER',
      createdDate: Date.now() - 86400000 * 5,
      dateFrom: Date.now() - 86400000 * 7,
      dateTo: Date.now() - 86400000,
    },
    {
      id: 'mock-4',
      subject: 'Datenbank-Migration',
      description: 'Datenbank auf neues Schema migrieren',
      taskStatus: 'IN_PROGRESS',
      taskPriority: 'HIGH',
      parentTaskId: 'mock-1', // Unteraufgabe von mock-1
      assignees: [{ id: '1', userId: '1', plannedEffort: 4 }],
      watchers: [{ id: '2' }],
      creatorUserId: '1',
      isAssignee: true,
      isWatcher: false,
      canEdit: true,
      canDelete: role === 'ADMIN' || role === 'MANAGER',
      createdDate: Date.now() - 86400000 * 2,
      dateFrom: Date.now(),
      dateTo: Date.now() + 86400000 * 7,
    },
  ]
  
  // Bei normalen Benutzern nur eigene Aufgaben zeigen
  const filteredTasks = taskDataScope === 'own'
    ? allMockTasks.filter(t => t.isAssignee || t.isWatcher)
    : allMockTasks
  
  const stats = {
    total: filteredTasks.length,
    open: filteredTasks.filter(t => t.taskStatus === 'NOT_STARTED').length,
    inProgress: filteredTasks.filter(t => t.taskStatus === 'IN_PROGRESS').length,
    completed: filteredTasks.filter(t => t.taskStatus === 'COMPLETED').length,
    highPriority: filteredTasks.filter(t => t.taskPriority === 'HIGH').length,
  }
  
  return NextResponse.json({
    success: true,
    tasks: filteredTasks,
    stats,
    userContext: {
      role,
      taskDataScope,
      weClappConnected: false,
    },
    isMockData: true,
    message: 'WeClapp nicht verbunden - Mock-Daten werden angezeigt'
  })
}
