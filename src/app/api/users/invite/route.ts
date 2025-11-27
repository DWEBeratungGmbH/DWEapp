import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@/types'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Simulierte Einladungsdatenbank
const invitations = new Map<string, {
  id: string
  email: string
  weclappUserId: string
  role: UserRole
  token: string
  status: 'pending' | 'accepted' | 'expired'
  createdAt: string
  expiresAt: string
}>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, weclappUserId, role = 'employee' } = body

    if (!email || !weclappUserId) {
      return NextResponse.json(
        { error: 'Email und WeClapp User ID sind erforderlich' },
        { status: 400 }
      )
    }

    // Generiere Einladungs-Token
    const token = generateInviteToken()
    const invitationId = generateId()
    
    // Erstelle Einladung mit 7 Tagen Gültigkeit
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const invitation = {
      id: invitationId,
      email,
      weclappUserId,
      role: role as UserRole,
      token,
      status: 'pending' as const,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    }

    // Speichere Einladung
    invitations.set(invitationId, invitation)

    console.log(`Invitation created: ${email} -> ${weclappUserId} as ${role}`)

    // In einer echten Anwendung würde hier eine E-Mail gesendet
    // Für jetzt geben wir die Einladungs-URL zurück
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

    return NextResponse.json({ 
      success: true,
      message: 'Einladung erfolgreich erstellt',
      result: {
        invitation,
        inviteUrl
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
    const invitation = Array.from(invitations.values()).find(inv => inv.token === token)

    if (!invitation) {
      return NextResponse.json(
        { error: 'Ungültige Einladung' },
        { status: 404 }
      )
    }

    // Prüfe ob Einladung abgelaufen ist
    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = 'expired'
      return NextResponse.json(
        { error: 'Einladung abgelaufen' },
        { status: 410 }
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
    const { token, localUserId } = body

    if (!token || !localUserId) {
      return NextResponse.json(
        { error: 'Token und Local User ID sind erforderlich' },
        { status: 400 }
      )
    }

    // Finde Einladung per Token
    const invitationEntry = Array.from(invitations.entries()).find(([_, inv]) => inv.token === token)

    if (!invitationEntry) {
      return NextResponse.json(
        { error: 'Ungültige Einladung' },
        { status: 404 }
      )
    }

    const [invitationId, invitation] = invitationEntry

    // Prüfe ob Einladung bereits akzeptiert wurde
    if (invitation.status === 'accepted') {
      return NextResponse.json(
        { error: 'Einladung wurde bereits akzeptiert' },
        { status: 400 }
      )
    }

    // Akzeptiere Einladung
    invitation.status = 'accepted'
    invitations.set(invitationId, invitation)

    console.log(`Invitation accepted: ${invitation.email} -> ${localUserId}`)

    return NextResponse.json({ 
      success: true,
      message: 'Einladung erfolgreich akzeptiert',
      result: invitation
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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
