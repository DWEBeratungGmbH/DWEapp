import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/types'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, weclappUserId, role = 'USER' } = body

    if (!email || !weclappUserId) {
      return NextResponse.json(
        { error: 'Email und WeClapp User ID sind erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob User bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User mit dieser Email existiert bereits' },
        { status: 400 }
      )
    }

    // Finde den Admin-User (der die Einladung erstellt)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Kein Admin-User gefunden' },
        { status: 500 }
      )
    }

    // Generiere Einladungs-Token
    const token = generateInviteToken()
    
    // Erstelle Einladung mit 7 Tagen Gültigkeit
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        expiresAt,
        invitedBy: {
          connect: { id: adminUser.id }
        }
      },
      include: {
        invitedBy: true
      }
    })

    console.log(`Invitation created: ${email} -> ${weclappUserId} as ${role}`)

    // In einer echten Anwendung würde hier eine E-Mail gesendet
    // Für jetzt geben wir die Einladungs-URL zurück
    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`

    return NextResponse.json({ 
      success: true,
      message: 'Einladung erfolgreich erstellt',
      result: {
        invitation,
        inviteUrl,
        weclappUserId,
        role
      }
    })
  } catch (error: any) {
    console.error('Invite POST Error:', error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Erstellen der Einladung',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      )
    }

    // Finde Einladung per Token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        invitedBy: true
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Ungültige Einladung' },
        { status: 404 }
      )
    }

    // Prüfe ob Einladung abgelaufen ist
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'Einladung abgelaufen' },
        { status: 410 }
      )
    }

    // Prüfe ob Einladung bereits verwendet wurde
    if (invitation.isUsed) {
      return NextResponse.json(
        { error: 'Einladung wurde bereits verwendet' },
        { status: 400 }
      )
    }

    return NextResponse.json({ result: invitation })
  } catch (error: any) {
    console.error('Invite GET Error:', error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Einladung',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, name, weClappUserId, role = 'USER' } = body

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token und Email sind erforderlich' },
        { status: 400 }
      )
    }

    // Finde Einladung per Token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        invitedBy: true
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Ungültige Einladung' },
        { status: 404 }
      )
    }

    // Prüfe ob Einladung bereits verwendet wurde
    if (invitation.isUsed) {
      return NextResponse.json(
        { error: 'Einladung wurde bereits verwendet' },
        { status: 400 }
      )
    }

    // Prüfe ob Einladung abgelaufen ist
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'Einladung abgelaufen' },
        { status: 410 }
      )
    }

    // Erstelle den neuen User
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role as any,
        weClappUserId,
        isActive: true
      }
    })

    // Markiere Einladung als verwendet
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { isUsed: true }
    })

    console.log(`Invitation accepted: ${email} -> User ${user.id}`)

    return NextResponse.json({ 
      success: true,
      message: 'Einladung erfolgreich akzeptiert',
      result: {
        user,
        invitation: { ...invitation, isUsed: true }
      }
    })
  } catch (error: any) {
    console.error('Invite PUT Error:', error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Akzeptieren der Einladung',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Hilfsfunktionen
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}
