import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const { id: invitationId } = await params

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Einladungs-ID ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Einladung existiert
    const invitation = await (prisma as any).invitation.findUnique({
      where: { id: invitationId },
      include: { user: true }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Einladung nicht gefunden' },
        { status: 404 }
      )
    }

    // Lösche den zugehörigen Benutzer (falls er noch nicht aktiv ist)
    if (invitation.user && !invitation.user.isActive) {
      await (prisma as any).user.delete({
        where: { id: invitation.userId }
      })
    }

    // Lösche die Einladung
    await (prisma as any).invitation.delete({
      where: { id: invitationId }
    })

    console.log(`Einladung gelöscht: ${invitation.email}`)

    return NextResponse.json({
      success: true,
      message: 'Einladung erfolgreich gelöscht'
    })

  } catch (error: any) {
    console.error('Einladungs-Lösch-Fehler:', error)
    return NextResponse.json(
      { 
        error: 'Einladung konnte nicht gelöscht werden',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
