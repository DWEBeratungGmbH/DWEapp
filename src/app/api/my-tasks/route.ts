// Meine Aufgaben API - gefiltert auf den eingeloggten User (Assignees)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const weClappUserId = session.user.weClappUserId
    
    if (!weClappUserId) {
      return NextResponse.json({
        success: true,
        data: {
          tasks: [],
          stats: { total: 0, open: 0, inProgress: 0, completed: 0, dueToday: 0, dueThisWeek: 0 },
          pagination: { page: 1, limit: 50, total: 0, pages: 0 }
        },
        message: 'Kein WeClapp-Benutzer verknüpft'
      })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const showAll = searchParams.get('showAll') === 'true'
    const skip = (page - 1) * limit

    let tasks: any[]
    let total: number
    let stats: { open: number; inProgress: number; completed: number }

    // Status-Array für IN-Query
    const statusList = status ? status.split(',').filter(s => s.trim()) : []

    if (!showAll) {
      // Raw SQL für JSON-Array Suche (PostgreSQL) - Tasks wo User zugewiesen ist
      // Mit optionalem Multi-Status-Filter
      if (statusList.length > 0) {
        tasks = await prisma.$queryRaw<any[]>`
          SELECT t.*, 
                 p.company as "customerCompany", 
                 p."firstName" as "customerFirstName", 
                 p."lastName" as "customerLastName",
                 o."orderNumber" as "orderNumber"
          FROM weclapp_tasks t
          LEFT JOIN weclapp_parties p ON t."customerId" = p.id
          LEFT JOIN weclapp_orders o ON t."orderItemId" = o.id
          WHERE t."isActive" = true
          AND t."taskStatus" = ANY(${statusList})
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(t.assignees) as elem
            WHERE elem->>'userId' = ${weClappUserId}
          )
          ORDER BY 
            CASE t."taskPriority" WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
            t."dateTo" ASC NULLS LAST,
            t."lastModifiedDate" DESC
          LIMIT ${limit} OFFSET ${skip}
        `
        
        // Total count mit Status-Filter
        const countResult = await prisma.$queryRaw<[{count: bigint}]>`
          SELECT COUNT(*) as count
          FROM weclapp_tasks t
          WHERE t."isActive" = true
          AND t."taskStatus" = ANY(${statusList})
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(t.assignees) as elem
            WHERE elem->>'userId' = ${weClappUserId}
          )
        `
        total = Number(countResult[0].count)
      } else {
        tasks = await prisma.$queryRaw<any[]>`
          SELECT t.*, 
                 p.company as "customerCompany", 
                 p."firstName" as "customerFirstName", 
                 p."lastName" as "customerLastName",
                 o."orderNumber" as "orderNumber"
          FROM weclapp_tasks t
          LEFT JOIN weclapp_parties p ON t."customerId" = p.id
          LEFT JOIN weclapp_orders o ON t."orderItemId" = o.id
          WHERE t."isActive" = true
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(t.assignees) as elem
            WHERE elem->>'userId' = ${weClappUserId}
          )
          ORDER BY 
            CASE t."taskPriority" WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
            t."dateTo" ASC NULLS LAST,
            t."lastModifiedDate" DESC
          LIMIT ${limit} OFFSET ${skip}
        `
        
        // Total count ohne Status-Filter
        const countResult = await prisma.$queryRaw<[{count: bigint}]>`
          SELECT COUNT(*) as count
          FROM weclapp_tasks t
          WHERE t."isActive" = true
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(t.assignees) as elem
            WHERE elem->>'userId' = ${weClappUserId}
          )
        `
        total = Number(countResult[0].count)
      }
      
      // Format tasks with customer and order relation
      tasks = tasks.map(t => ({
        ...t,
        customer: t.customerCompany ? {
          id: t.customerId,
          company: t.customerCompany,
          firstName: t.customerFirstName,
          lastName: t.customerLastName
        } : null,
        order: t.orderNumber ? {
          id: t.orderItemId,
          orderNumber: t.orderNumber
        } : null
      }))

      // Stats für zugewiesene Tasks
      const statsResult = await prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*) FILTER (WHERE "taskStatus" IN ('NOT_STARTED', 'IN_PROGRESS', 'WAITING_ON_OTHERS')) as open,
          COUNT(*) FILTER (WHERE "taskStatus" = 'IN_PROGRESS') as "inProgress",
          COUNT(*) FILTER (WHERE "taskStatus" = 'COMPLETED') as completed
        FROM weclapp_tasks t
        WHERE t."isActive" = true
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(t.assignees) as elem
          WHERE elem->>'userId' = ${weClappUserId}
        )
      `
      stats = {
        open: Number(statsResult[0]?.open || 0),
        inProgress: Number(statsResult[0]?.inProgress || 0),
        completed: Number(statsResult[0]?.completed || 0)
      }
    } else {
      // Normale Prisma-Abfrage für alle Tasks mit Order-Relation
      const [allTasks, count] = await Promise.all([
        prisma.weClappTask.findMany({
          where: { isActive: true },
          include: {
            customer: { select: { id: true, company: true, firstName: true, lastName: true } },
            timeEntries: { where: { isActive: true }, select: { id: true, durationSeconds: true } }
          },
          orderBy: [{ taskPriority: 'asc' }, { dateTo: 'asc' }, { lastModifiedDate: 'desc' }],
          skip,
          take: limit
        }),
        prisma.weClappTask.count({ where: { isActive: true } })
      ])
      
      // Order-Relation für "showAll" manuell laden (Prisma hat keine direkte Relation)
      const taskIds = allTasks.map(t => t.id).filter(Boolean)
      const orders = taskIds.length > 0 ? await prisma.$queryRaw<any[]>`
        SELECT t.id as "taskId", o."orderNumber"
        FROM weclapp_tasks t
        LEFT JOIN weclapp_orders o ON t."orderItemId" = o.id
        WHERE t.id = ANY(${taskIds}) AND o.id IS NOT NULL
      ` : []
      
      const orderMap = new Map(orders.map(o => [o.taskId, { orderNumber: o.orderNumber }]))
      
      tasks = allTasks.map(t => ({
        ...t,
        order: orderMap.get(t.id) || null
      }))
      
      total = count
      
      // Stats für alle Tasks
      const openCount = await prisma.weClappTask.count({ 
        where: { isActive: true, taskStatus: { in: ['NOT_STARTED', 'IN_PROGRESS', 'WAITING_ON_OTHERS'] } } 
      })
      const inProgressCount = await prisma.weClappTask.count({ 
        where: { isActive: true, taskStatus: 'IN_PROGRESS' } 
      })
      const completedCount = await prisma.weClappTask.count({ 
        where: { isActive: true, taskStatus: 'COMPLETED' } 
      })
      stats = { open: openCount, inProgress: inProgressCount, completed: completedCount }
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        stats: {
          total,
          ...stats,
          dueToday: 0,
          dueThisWeek: 0
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Fehler beim Abrufen meiner Aufgaben:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Aufgaben' },
      { status: 500 }
    )
  }
}
