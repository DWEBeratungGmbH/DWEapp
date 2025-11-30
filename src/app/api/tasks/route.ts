import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// WeClapp API Helper
async function fetchWeClappUsers() {
  const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
  const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
  
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
    throw new Error('WeClapp API nicht konfiguriert')
  }
  
  const response = await fetch(`${WECLAPP_API_URL}/user?pageSize=1000`, {
    headers: {
      'AuthenticationToken': WECLAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error('WeClapp API Error:', error)
    throw new Error(`WeClapp API Fehler: ${response.status}`)
  }
  
  const data = await response.json()
  return data.result || []
}

// WeClapp Aufträge laden (mit orderItems für Verknüpfung!)
async function fetchWeClappOrders() {
  const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
  const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
  
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
    return []
  }
  
  // WICHTIG: /salesOrder mit orderItems für Verknüpfung mit Tasks
  // Kunden-Info muss separat über customerId → party geladen werden
  const response = await fetch(`${WECLAPP_API_URL}/salesOrder?pageSize=1000&properties=id,orderNumber,orderItems,customerId,recordAddress,deliveryAddress,invoiceAddress,status`, {
    headers: {
      'AuthenticationToken': WECLAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    console.error('WeClapp Orders API Error:', await response.text())
    return []
  }
  
  const data = await response.json()
  return data.result || []
}

// WeClapp Kunden (Parties) laden für Namen
async function fetchWeClappParties(customerIds: string[]) {
  const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL
  const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
  
  if (!WECLAPP_API_URL || !WECLAPP_API_KEY || customerIds.length === 0) {
    return []
  }
  
  // Nur die benötigten Kunden laden
  const uniqueIds = Array.from(new Set(customerIds)).filter(Boolean)
  if (uniqueIds.length === 0) return []
  
  const response = await fetch(`${WECLAPP_API_URL}/party?pageSize=1000&properties=id,firstName,lastName,company,partyType`, {
    headers: {
      'AuthenticationToken': WECLAPP_API_KEY,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    console.error('WeClapp Parties API Error:', await response.text())
    return []
  }
  
  const data = await response.json()
  return data.result || []
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Filter-Parameter
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assigneeUserId = searchParams.get('assigneeUserId')
    const search = searchParams.get('q')
    const orderNumber = searchParams.get('orderNumber')
    const dueDateFrom = searchParams.get('dueDateFrom')
    const dueDateTo = searchParams.get('dueDateTo')
    const limit = parseInt(searchParams.get('limit') || '500')
    const view = searchParams.get('view') || 'all' // 'all' | 'mine'
    
    // Benutzer-Kontext aus Session holen (vereinfacht für Test)
    const userRole = 'ADMIN' // TODO: Aus Session lesen
    const weClappUserId = '3471' // TODO: Aus Session lesen
    
    // Basis-Query für Aufgaben
    const whereClause: any = {
      isActive: true,
    }
    
    // View Filter: Nur meine Aufgaben (wird als Post-Filter angewendet)
    const filterMyTasks = view === 'mine' && weClappUserId
    
    // Status-Filter
    if (status && status !== 'all') {
      if (status.includes(',')) {
        whereClause.taskStatus = {
          in: status.split(','),
        }
      } else {
        whereClause.taskStatus = status
      }
    }
    
    // Priority-Filter
    if (priority && priority !== 'all') {
      whereClause.taskPriority = priority
    }
    
    // Assignee-Filter wird nach dem Laden angewendet (JSON-Feld)
    
    // Suche
    if (search) {
      whereClause.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { identifier: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Fälligkeitsdatum-Filter (WeClapp: dateTo ist das Enddatum)
    if (dueDateFrom || dueDateTo) {
      whereClause.dateTo = {}
      if (dueDateFrom) {
        whereClause.dateTo.gte = new Date(dueDateFrom)
      }
      if (dueDateTo) {
        // Bis Ende des Tages
        const endDate = new Date(dueDateTo)
        endDate.setHours(23, 59, 59, 999)
        whereClause.dateTo.lte = endDate
      }
    }
    
    // Aufgaben aus lokalen DB laden
    let tasks = await (prisma as any).weClappTask.findMany({
      where: whereClause,
      orderBy: [
        { taskStatus: 'asc' },
        { taskPriority: 'desc' },
        { createdDate: 'desc' },
      ],
      take: limit,
    })
    
    // Post-Filter: Assignee (JSON-Feld lässt sich nicht direkt in Prisma filtern)
    if (assigneeUserId || filterMyTasks) {
      const filterUserId = String(assigneeUserId || weClappUserId)
      tasks = tasks.filter((task: any) => {
        const assignees = task.assignees || []
        return assignees.some((a: any) => {
          // IDs können als String oder Number vorliegen
          const aUserId = String(a.userId || a)
          return aUserId === filterUserId
        })
      })
    }
    
    // Aufträge für Gruppierung laden (mit Bauherrn-Infos) - VOR dem orderNumber Filter!
    const orders = await fetchWeClappOrders()
    console.log('DEBUG API: Orders loaded:', orders.length)
    
    // Kunden-IDs sammeln und Parties laden
    const customerIds = orders.map((o: any) => o.customerId).filter(Boolean)
    const parties = await fetchWeClappParties(customerIds)
    
    // Party-Map für schnellen Lookup
    const partyMap: Record<string, any> = {}
    parties.forEach((party: any) => {
      partyMap[String(party.id)] = party
    })
    console.log('DEBUG API: Parties loaded:', parties.length)
    
    // WICHTIG: Map von orderItemId → Order (nicht order.id!)
    // task.orderItemId verweist auf eine Auftragsposition, nicht auf den Auftrag selbst
    const ordersMap: Record<string, any> = {}
    
    orders.forEach((order: any) => {
      // Kunden-Info aus Party holen
      const party = partyMap[String(order.customerId)] || {}
      
      // Bauherrn-Name zusammenbauen
      let customerDisplayName = ''
      if (party.firstName && party.lastName) {
        customerDisplayName = `${party.firstName} ${party.lastName}`
      } else if (party.company) {
        customerDisplayName = party.company
      } else {
        customerDisplayName = 'Unbekannt'
      }
      
      // Adresse aus recordAddress oder deliveryAddress
      const address = order.deliveryAddress || order.recordAddress || {}
      
      const orderData = {
        id: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerDisplayName,
        customerFirstName: party.firstName || '',
        customerLastName: party.lastName || '',
        customerCompany: party.company || '',
        deliveryAddress: address,
        status: order.status,
      }
      
      // Für jede Auftragsposition eine Verknüpfung erstellen
      const orderItems = order.orderItems || []
      orderItems.forEach((item: any) => {
        if (item.id) {
          ordersMap[String(item.id)] = orderData
        }
      })
      
      // Auch die Order-ID selbst als Fallback
      ordersMap[String(order.id)] = orderData
    })
    
    console.log('DEBUG API: OrderItems mapped:', Object.keys(ordersMap).length)

    // Post-Filter: OrderNumber (nach dem Laden der Orders)
    if (orderNumber) {
      const searchLower = orderNumber.toLowerCase()
      // Filtere Tasks deren orderItemId zu einem passenden Order gehört
      tasks = tasks.filter((task: any) => {
        const orderItemId = String(task.orderItemId || '')
        const order = ordersMap[orderItemId]
        if (!order) return false
        
        // Suche in orderNumber UND customerDisplayName
        const orderNumMatch = order.orderNumber?.toLowerCase().includes(searchLower)
        const customerMatch = order.customerDisplayName?.toLowerCase().includes(searchLower)
        return orderNumMatch || customerMatch
      })
      console.log('DEBUG API: Tasks after orderNumber filter:', tasks.length)
    }
    
    // JETZT: Hauptaufgaben und Unteraufgaben trennen (NACH allen Filtern!)
    const mainTasks = tasks.filter((t: any) => !t.parentTaskId)
    const subTasksMap = new Map<string, any[]>()
    
    tasks.forEach((t: any) => {
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
    
    // Statistiken berechnen (NACH allen Filtern!)
    const stats = {
      total: tasks.length,
      open: tasks.filter((t: any) => t.taskStatus === 'NOT_STARTED').length,
      inProgress: tasks.filter((t: any) => t.taskStatus === 'IN_PROGRESS').length,
      completed: tasks.filter((t: any) => t.taskStatus === 'COMPLETED').length,
      highPriority: tasks.filter((t: any) => t.taskPriority === 'HIGH').length,
    }

    // Benutzer für Filter-Optionen laden (aus lokaler DB)
    const users = await prisma.user.findMany({
      where: { weClappUserId: { not: null }, isActive: true },
      select: {
        weClappUserId: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    })

    // WeClapp Benutzer für vollständige Daten
    const weClappUsers = await fetchWeClappUsers()
    
    // Benutzer-Map für schnellen Lookup (alle IDs als String!)
    const userMap = new Map()
    users.forEach(u => {
      const id = String(u.weClappUserId)
      userMap.set(id, {
        id: id,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        active: true
      })
    })
    
    // WeClapp Daten ergänzen (alle IDs als String!)
    weClappUsers.forEach((wu: any) => {
      const id = String(wu.id)
      if (!userMap.has(id)) {
        userMap.set(id, {
          id: id,
          firstName: wu.firstName || '',
          lastName: wu.lastName || '',
          fullName: `${wu.firstName || ''} ${wu.lastName || ''}`.trim() || wu.username || id,
          email: wu.email || '',
          active: wu.active !== false
        })
      } else {
        // Existierenden Benutzer mit WeClapp Daten aktualisieren
        const existing = userMap.get(id)
        userMap.set(id, {
          ...existing,
          firstName: wu.firstName || existing.firstName,
          lastName: wu.lastName || existing.lastName,
          fullName: `${wu.firstName || existing.firstName} ${wu.lastName || existing.lastName}`.trim() || existing.fullName,
          email: wu.email || existing.email,
          active: wu.active !== false
        })
      }
    })
    
    return NextResponse.json({
      success: true,
      tasks: tasksWithSubTasks,
      allTasks: tasks,
      stats,
      orders: ordersMap,
      users: Array.from(userMap.values()),
      userContext: {
        role: userRole,
        taskDataScope: 'all',
        weClappUserId,
        weClappConnected: true,
      },
    })
    
  } catch (error) {
    console.error('❌ Tasks API Fehler:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
