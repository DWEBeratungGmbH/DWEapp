import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await (prisma as any).user.findMany({
      include: {
        accounts: true,
        sessions: true,
        invitations: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Gefunden: ${users.length} Benutzer in der Datenbank`)

    // Transformiere in das Frontend-Format
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      weClappUserId: user.weClappUserId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      // Zusätzliche Infos für Debugging
      hasAccount: user.accounts.length > 0,
      providers: user.accounts.map((a: any) => a.provider),
      hasActiveSession: user.sessions.some((s: any) => new Date(s.expires) > new Date()),
      emailVerified: user.emailVerified,
      image: user.image
    }))

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total: transformedUsers.length
    })

  } catch (error: any) {
    console.error('Benutzer-Lade-Fehler:', error)
    return NextResponse.json(
      { 
        error: 'Benutzer konnten nicht geladen werden',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
