// WeClapp Tasks API Route - CASCADE-konform (<150 Zeilen)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assigneeId = searchParams.get('assigneeId')
    const customerId = searchParams.get('customerId')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (status && status !== 'all') {
      where.taskStatus = status
    }

    if (priority && priority !== 'all') {
      where.taskPriority = priority
    }

    if (assigneeId) {
      where.assignees = {
        some: {
          userId: assigneeId
        }
      }
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { identifier: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get tasks with relations
    const [tasks, total] = await Promise.all([
      prisma.weClappTask.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          customer: {
            select: {
              id: true,
              company: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          parentTask: {
            select: {
              id: true,
              subject: true,
              identifier: true
            }
          },
          previousTask: {
            select: {
              id: true,
              subject: true,
              identifier: true
            }
          },
          timeEntries: {
            where: { isActive: true },
            select: {
              id: true,
              durationSeconds: true,
              billableDurationSeconds: true,
              startDate: true
            }
          }
        },
        orderBy: [
          { lastModifiedDate: 'desc' },
          { createdDate: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.weClappTask.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Fehler beim Abrufen der Tasks:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Abrufen der Tasks' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const task = await prisma.weClappTask.create({
      data: {
        ...body,
        createdDate: new Date(),
        lastModifiedDate: new Date(),
        weClappLastModified: new Date(),
        lastSyncAt: new Date(),
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: task
    })

  } catch (error) {
    console.error('Fehler beim Erstellen des Tasks:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Erstellen des Tasks' 
      },
      { status: 500 }
    )
  }
}
