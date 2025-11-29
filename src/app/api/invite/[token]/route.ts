import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Einladungs-Token ist erforderlich' },
        { status: 400 }
      )
    }

    // Suche Einladung in der Datenbank
    const invitation = await (prisma as any).invitation.findFirst({
      where: {
        token,
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Einladung nicht gefunden, abgelaufen oder bereits verwendet' },
        { status: 404 }
      )
    }

    console.log(`Einladung gefunden: ${invitation.email} -> ${invitation.user.email}`)

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        role: invitation.role,
        department: invitation.department,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        status: invitation.status,
        user: {
          id: invitation.user.id,
          email: invitation.user.email,
          firstName: invitation.user.firstName,
          lastName: invitation.user.lastName,
          name: invitation.user.name,
          role: invitation.user.role,
          department: invitation.user.department,
          weClappUserId: invitation.user.weClappUserId,
          isActive: invitation.user.isActive,
          emailVerified: invitation.user.emailVerified
        }
      }
    })

  } catch (error: any) {
    console.error('Einladungs-Lese-Fehler:', error)
    return NextResponse.json(
      { 
        error: 'Einladung konnte nicht geladen werden',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Einladungs-Token ist erforderlich' },
        { status: 400 }
      )
    }

    // Suche Einladung in der Datenbank
    const invitation = await (prisma as any).invitation.findFirst({
      where: {
        token,
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Einladung nicht gefunden, abgelaufen oder bereits verwendet' },
        { status: 404 }
      )
    }

    // Aktiviere den Benutzer
    const updatedUser = await (prisma as any).user.update({
      where: { id: invitation.user.id },
      data: {
        isActive: true,
        emailVerified: true
      }
    })

    // Markiere Einladung als akzeptiert
    const updatedInvitation = await (prisma as any).invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED'
      }
    })

    console.log(`Einladung akzeptiert: ${invitation.email} -> User ${updatedUser.id}`)

    return NextResponse.json({
      success: true,
      message: 'Einladung erfolgreich akzeptiert',
      user: updatedUser,
      invitation: updatedInvitation
    })

  } catch (error: any) {
    console.error('Einladungs-Akzeptanz-Fehler:', error)
    return NextResponse.json(
      { 
        error: 'Einladung konnte nicht akzeptiert werden',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
