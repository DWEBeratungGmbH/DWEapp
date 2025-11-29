import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const invitations = await (prisma as any).invitation.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Gefunden: ${invitations.length} Einladungen in der Datenbank`)

    return NextResponse.json({
      success: true,
      invitations: invitations.map((invitation: any) => ({
        id: invitation.id,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        role: invitation.role,
        department: invitation.department,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
        weClappUserId: invitation.weClappUserId,
        userId: invitation.userId,
        createdAt: invitation.createdAt,
        user: invitation.user ? {
          id: invitation.user.id,
          email: invitation.user.email,
          firstName: invitation.user.firstName,
          lastName: invitation.user.lastName,
          isActive: invitation.user.isActive,
          emailVerified: invitation.user.emailVerified
        } : null
      })),
      total: invitations.length
    })

  } catch (error: any) {
    console.error('Einladungs-Lade-Fehler:', error)
    return NextResponse.json(
      { 
        error: 'Einladungen konnten nicht geladen werden',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
