import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await (prisma as any).user.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        weClappUserId: true
      },
      orderBy: {
        email: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      users: users
    })

  } catch (error: any) {
    console.error('Fehler beim Laden der Benutzerliste:', error)
    return NextResponse.json(
      { 
        error: 'Benutzerliste konnte nicht geladen werden',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
