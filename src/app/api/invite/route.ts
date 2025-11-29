import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, role, department, useWeClapp = true } = await request.json()

    if (!email || !role) {
      return NextResponse.json(
        { error: 'E-Mail und Rolle sind erforderlich' },
        { status: 400 }
      )
    }

    // WeClapp Benutzer suchen (optional)
    let weClappUser = null
    if (useWeClapp) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_WECLAPP_API_KEY
        const apiUrl = process.env.NEXT_PUBLIC_WECLAPP_API_URL

        if (apiKey && apiUrl) {
          const response = await fetch(`${apiUrl}/user?email=${encodeURIComponent(email)}&serializeNulls=false`, {
            headers: {
              'AuthenticationToken': apiKey,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            console.log(`WeClapp Suche für ${email}:`, {
              totalResults: data.result?.length || 0,
              results: data.result?.map((u: any) => ({
                id: u.id,
                email: u.email,
                name: `${u.firstName} ${u.lastName}`,
                status: u.status
              }))
            })
            
            if (data.result && data.result.length > 0) {
              // Finde den Benutzer mit der passenden E-Mail (case-insensitive)
              const user = data.result.find((u: any) => 
                u.email.toLowerCase() === email.toLowerCase()
              )
              
              if (user) {
                console.log(`Gefundener WeClapp Benutzer für ${email}:`, {
                  id: user.id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  status: user.status
                })
                
                weClappUser = {
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  username: user.username,
                  active: user.status === 'ACTIVE'
                }
              } else {
                console.log(`Kein WeClapp Benutzer mit E-Mail ${email} gefunden`)
              }
            } else {
              console.log(`Kein WeClapp Benutzer gefunden für ${email}`)
            }
          }
        }
      } catch (error) {
        console.log('WeClapp Benutzer-Suche fehlgeschlagen, fahre mit manueller Einladung fort:', error)
      }
    }

    // Einladungs-Token generieren
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 Tage gültig

    // Erstelle Benutzer mit Status "EINGELADEN"
    const newUser = await (prisma as any).user.create({
      data: {
        email,
        firstName: weClappUser?.firstName || null,
        lastName: weClappUser?.lastName || null,
        name: weClappUser?.firstName && weClappUser?.lastName 
          ? `${weClappUser.firstName} ${weClappUser.lastName}` 
          : email.split('@')[0], // Legacy für Kompatibilität
        role,
        department: department || null,
        weClappUserId: weClappUser?.id || null,
        isActive: false, // Eingeladene Benutzer sind erstmal inaktiv
        emailVerified: false
      }
    })

    // Erstelle Einladung
    const invitation = await (prisma as any).invitation.create({
      data: {
        email,
        token,
        expiresAt,
        firstName: weClappUser?.firstName || null,
        lastName: weClappUser?.lastName || null,
        role,
        department: department || null,
        weClappUserId: weClappUser?.id || null,
        userId: newUser.id, // Verknüpfe mit dem neuen Benutzer
        status: 'PENDING'
      }
    })

    console.log(`Invitation created: ${email} -> User ${newUser.id} as ${role}`)

    // E-Mail über Microsoft Graph API versenden
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Kein eingeloggter Benutzer gefunden' }, { status: 401 })
    }

    // Microsoft Graph API Token holen
    const tokenResponse = await fetch('https://login.microsoftonline.com/16fb7d46-199f-417d-9460-ebb505438d0c/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
        client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    })

    if (!tokenResponse.ok) {
      console.error('Microsoft Token Error:', await tokenResponse.text())
      return NextResponse.json({ error: 'Konnte kein Microsoft Token holen' }, { status: 500 })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`

    // E-Mail an intern@dwe-beratung.de senden (Benachrichtigung an Admin)
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Neue Benutzereinladung</h2>
        <p>Eine neue Benutzereinladung wurde erstellt:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Eingeladen von:</strong> ${session.user.name || session.user.email}</p>
          <p><strong>E-Mail:</strong> ${email}</p>
          <p><strong>Rolle:</strong> ${role === 'admin' ? 'Administrator' : role === 'manager' ? 'Manager' : 'Benutzer'}</p>
          ${department ? `<p><strong>Abteilung:</strong> ${department}</p>` : ''}
          ${weClappUser ? `<p><strong>WeClapp Benutzer:</strong> ${weClappUser.firstName} ${weClappUser.lastName}</p>` : ''}
        </div>
        <p><strong>Einladungs-Link:</strong> <a href="${inviteUrl}">${inviteUrl}</a></p>
        <p style="color: #666; font-size: 14px;">Dieser Link ist 7 Tage gültig.</p>
      </div>
    `

    // E-Mail über Microsoft Graph API senden
    const emailResponse = await fetch('https://graph.microsoft.com/v1.0/users/intern@dwe-beratung.de/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: `Neue Benutzereinladung: ${email}`,
          body: {
            contentType: 'HTML',
            content: adminEmailHtml
          },
          toRecipients: [
            {
              emailAddress: {
                address: 'intern@dwe-beratung.de'
              }
            }
          ]
        }
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Microsoft Graph Email Error:', errorText)
      return NextResponse.json({ error: 'E-Mail konnte nicht gesendet werden', details: errorText }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Einladung erfolgreich erstellt und E-Mail an intern@dwe-beratung.de gesendet',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        department: invitation.department,
        expiresAt: invitation.expiresAt,
        token: invitation.token,
        userId: newUser.id,
        weClappUser: weClappUser
      }
    })

  } catch (error) {
    console.error('Einladungs-Fehler:', error)
    return NextResponse.json(
      { error: 'Einladung konnte nicht gesendet werden' },
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
    const invitation = await (prisma as any).invitation.findUnique({
      where: { token }
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
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Einladung wurde bereits verwendet' },
        { status: 400 }
      )
    }

    return NextResponse.json({ result: invitation })
  } catch (error: any) {
    console.error('Einladungs-Abruf-Fehler:', error)
    return NextResponse.json(
      { error: 'Einladungen konnten nicht geladen werden' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = body

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token und Email sind erforderlich' },
        { status: 400 }
      )
    }

    // Finde Einladung per Token
    const invitation = await (prisma as any).invitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Ungültige Einladung' },
        { status: 404 }
      )
    }

    // Prüfe ob Email übereinstimmt (Sicherheitscheck)
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
            { error: 'Email stimmt nicht überein' },
            { status: 400 }
        )
    }

    // Prüfe ob Einladung bereits verwendet wurde
    if (invitation.status === 'ACCEPTED') {
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

    // Aktiviere den bestehenden Benutzer
    const user = await (prisma as any).user.update({
      where: { id: invitation.userId },
      data: {
        isActive: true,
        emailVerified: true
      }
    })

    // Markiere Einladung als verwendet
    await (prisma as any).invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    })

    console.log(`Invitation accepted: ${email} -> User ${user.id}`)

    return NextResponse.json({ 
      success: true,
      message: 'Einladung erfolgreich akzeptiert',
      result: {
        user,
        invitation: { ...invitation, status: 'ACCEPTED' }
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
