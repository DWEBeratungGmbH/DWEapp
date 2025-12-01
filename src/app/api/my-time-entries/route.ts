// Meine Zeitbuchungen API - gefiltert auf den eingeloggten User
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
          entries: [],
          stats: { total: 0, today: 0, thisWeek: 0, thisMonth: 0 },
          pagination: { page: 1, limit: 50, total: 0, pages: 0 }
        },
        message: 'Kein WeClapp-Benutzer verknüpft'
      })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const skip = (page - 1) * limit

    // Basis-Filter: Zeitbuchungen des Users
    const where: any = {
      isActive: true,
      userId: weClappUserId
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { task: { subject: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (dateFrom) {
      where.startDate = { ...where.startDate, gte: new Date(dateFrom) }
    }

    if (dateTo) {
      where.startDate = { ...where.startDate, lte: new Date(dateTo) }
    }

    // Zeiträume berechnen
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(todayStart.getDate() - todayStart.getDay() + 1)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Daten parallel laden
    const [entries, total, todayEntries, weekEntries, monthEntries] = await Promise.all([
      prisma.weClappTimeEntry.findMany({
        where,
        include: {
          task: {
            select: { id: true, subject: true, identifier: true }
          },
          customer: {
            select: { id: true, company: true, firstName: true, lastName: true }
          },
          salesOrder: {
            select: { id: true, orderNumber: true }
          }
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit
      }),
      prisma.weClappTimeEntry.count({ where }),
      // Heute
      prisma.weClappTimeEntry.aggregate({
        where: { ...where, startDate: { gte: todayStart } },
        _sum: { durationSeconds: true }
      }),
      // Diese Woche
      prisma.weClappTimeEntry.aggregate({
        where: { ...where, startDate: { gte: weekStart } },
        _sum: { durationSeconds: true }
      }),
      // Dieser Monat
      prisma.weClappTimeEntry.aggregate({
        where: { ...where, startDate: { gte: monthStart } },
        _sum: { durationSeconds: true }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        entries,
        stats: {
          total,
          todaySeconds: todayEntries._sum.durationSeconds || 0,
          weekSeconds: weekEntries._sum.durationSeconds || 0,
          monthSeconds: monthEntries._sum.durationSeconds || 0
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
    console.error('Fehler beim Abrufen meiner Zeitbuchungen:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Abrufen der Zeitbuchungen' },
      { status: 500 }
    )
  }
}
