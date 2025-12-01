// WeClapp Users API Route - CASCADE-konform (<150 Zeilen)

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {
      isActive: true
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get users from local database
    const [users, total] = await Promise.all([
      prisma.weClappUser.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          title: true,
          status: true,
          phoneNumber: true,
          mobilePhoneNumber: true,
          createdDate: true,
          lastModifiedDate: true,
          lastSyncAt: true
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.weClappUser.count({ where })
    ])

    // Format users for frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: user.username || user.email || '',
      title: user.title || '',
      status: user.status,
      active: user.status === 'ACTIVE',
      phoneNumber: user.phoneNumber,
      mobilePhoneNumber: user.mobilePhoneNumber,
      createdDate: user.createdDate,
      lastModifiedDate: user.lastModifiedDate,
      lastSyncAt: user.lastSyncAt,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }))

    return NextResponse.json({ 
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Fehler beim Abrufen der WeClapp Benutzer:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Fehler beim Abrufen der Benutzer' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
