// WeClapp Parties API Route - CASCADE-konform (<150 Zeilen)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const partyType = searchParams.get('partyType') // ORGANIZATION, PERSON
    const customer = searchParams.get('customer') // true/false
    const supplier = searchParams.get('supplier') // true/false
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { customerNumber: { contains: search, mode: 'insensitive' } },
        { supplierNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (partyType && partyType !== 'all') {
      where.partyType = partyType
    }

    if (customer === 'true') {
      where.customer = true
    }

    if (supplier === 'true') {
      where.supplier = true
    }

    // Get parties with relations
    const [parties, total] = await Promise.all([
      prisma.weClappParty.findMany({
        where,
        select: {
          id: true,
          partyType: true,
          company: true,
          company2: true,
          firstName: true,
          lastName: true,
          salutation: true,
          email: true,
          phone: true,
          mobilePhone1: true,
          website: true,
          customer: true,
          customerNumber: true,
          customerBlocked: true,
          supplier: true,
          supplierNumber: true,
          createdDate: true,
          lastModifiedDate: true,
          lastSyncAt: true,
          // Count relations
          _count: {
            select: {
              tasks: true,
              orders: true,
              timeEntries: true
            }
          }
        },
        orderBy: [
          { company: 'asc' },
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.weClappParty.count({ where })
    ])

    // Format parties for frontend
    const formattedParties = parties.map((party: any) => ({
      id: party.id,
      partyType: party.partyType,
      company: party.company,
      company2: party.company2,
      firstName: party.firstName,
      lastName: party.lastName,
      salutation: party.salutation,
      email: party.email,
      phone: party.phone,
      mobilePhone1: party.mobilePhone1,
      website: party.website,
      customer: party.customer,
      customerNumber: party.customerNumber,
      customerBlocked: party.customerBlocked,
      supplier: party.supplier,
      supplierNumber: party.supplierNumber,
      createdDate: party.createdDate,
      lastModifiedDate: party.lastModifiedDate,
      lastSyncAt: party.lastSyncAt,
      displayName: party.company || `${party.firstName || ''} ${party.lastName || ''}`.trim(),
      stats: {
        tasksCount: party._count.tasks,
        ordersCount: party._count.orders,
        timeEntriesCount: party._count.timeEntries
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        parties: formattedParties,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Fehler beim Abrufen der Parties:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Abrufen der Parties' 
      },
      { status: 500 }
    )
  }
}
