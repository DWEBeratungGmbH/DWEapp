// WeClapp Orders API Route - CASCADE-konform (<150 Zeilen)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { orderNumberAtCustomer: { contains: search, mode: 'insensitive' } },
        { note: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.orderStatus = status
    }

    if (customerId) {
      where.customerId = customerId
    }

    // Get orders with relations
    const [orders, total] = await Promise.all([
      prisma.weClappOrder.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              company: true,
              firstName: true,
              lastName: true,
              customerNumber: true
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
          },
          _count: {
            select: {
              timeEntries: true
            }
          }
        },
        orderBy: [
          { orderDate: 'desc' },
          { createdDate: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.weClappOrder.count({ where })
    ])

    // Format orders for frontend
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      orderNumberAtCustomer: order.orderNumberAtCustomer,
      orderStatus: order.orderStatus,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      currency: order.currency,
      note: order.note,
      invoiced: order.invoiced,
      paid: order.paid,
      shipped: order.shipped,
      servicesFinished: order.servicesFinished,
      projectModeActive: order.projectModeActive,
      plannedProjectStartDate: order.plannedProjectStartDate,
      plannedProjectEndDate: order.plannedProjectEndDate,
      createdDate: order.createdDate,
      lastModifiedDate: order.lastModifiedDate,
      lastSyncAt: order.lastSyncAt,
      customer: order.customer,
      timeEntriesCount: order._count.timeEntries,
      totalTrackedTime: order.timeEntries.reduce((sum: number, entry: any) => sum + (entry.durationSeconds || 0), 0),
      totalBillableTime: order.timeEntries.reduce((sum: number, entry: any) => sum + (entry.billableDurationSeconds || 0), 0)
    }))

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Fehler beim Abrufen der Orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Abrufen der Orders' 
      },
      { status: 500 }
    )
  }
}
