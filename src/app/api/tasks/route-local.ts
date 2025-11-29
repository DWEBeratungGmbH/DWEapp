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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Filter-Parameter
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assigneeUserId = searchParams.get('assigneeUserId')
    const search = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '200')
    
    // Benutzer-Kontext aus Session holen (vereinfacht für Test)
    const userRole = 'ADMIN' // TODO: Aus Session lesen
    const weClappUserId = '3471' // TODO: Aus Session lesen
    
    // Basis-Query für Aufgaben
    const whereClause: any = {
      isActive: true,
    }
    
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
    
    // Assignee-Filter
    if (assigneeUserId) {
      whereClause.assignees = {
        path: '$[*].userId',
        string_contains: assigneeUserId,
      }
    }
    
    // Suche
    if (search) {
      whereClause.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { identifier: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Aufgaben aus lokaler DB laden
    const tasks = await prisma.weClappTask.findMany({
      where: whereClause,
      orderBy: [
        { taskStatus: 'asc' },
        { taskPriority: 'desc' },
        { createdDate: 'desc' },
      ],
      take: limit,
    })
    
    // Hauptaufgaben und Unteraufgaben trennen
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
    
    // Statistiken berechnen
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
    
    return NextResponse.json({
      success: true,
      tasks: tasksWithSubTasks,
      allTasks: tasks,
      stats,
      users: users.map(u => ({
        id: u.weClappUserId,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: `${u.firstName} ${u.lastName}`,
        email: u.email,
        active: true,
      })),
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
