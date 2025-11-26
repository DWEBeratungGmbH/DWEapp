import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@/types'

// Simulierte Datenbank für Benutzerzuordnungen
// In einer echten Anwendung würde dies in einer Datenbank gespeichert
const userMatches = new Map<string, {
  weclappUserId: string
  localUserId: string
  role: UserRole
  matchedAt: string
}>()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Finde die Zuordnung für diesen Benutzer
    const match = userMatches.get(id)
    
    if (!match) {
      return NextResponse.json(
        { error: 'Keine Zuordnung für diesen Benutzer gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ result: match })
  } catch (error: any) {
    console.error('User Match GET Error:', error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Abrufen der Benutzerzuordnung',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { role } = body

    if (!role || !['employee', 'manager', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Ungültige Rolle. Erlaubt: employee, manager, admin' },
        { status: 400 }
      )
    }

    // Finde existierende Zuordnung
    const existingMatch = userMatches.get(id)
    
    if (!existingMatch) {
      return NextResponse.json(
        { error: 'Keine Zuordnung für diesen Benutzer gefunden' },
        { status: 404 }
      )
    }

    // Aktualisiere die Rolle
    const updatedMatch = {
      ...existingMatch,
      role: role as UserRole,
      updatedAt: new Date().toISOString()
    }
    
    userMatches.set(id, updatedMatch)

    console.log(`User Role Updated: ${id} -> ${role}`)

    return NextResponse.json({ 
      success: true,
      message: 'Benutzerrolle erfolgreich aktualisiert',
      result: updatedMatch
    })
  } catch (error: any) {
    console.error('User Role PUT Error:', error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Aktualisieren der Benutzerrolle',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Lösche die Zuordnung
    const deleted = userMatches.delete(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Keine Zuordnung für diesen Benutzer gefunden' },
        { status: 404 }
      )
    }

    console.log(`User Match Deleted: ${id}`)

    return NextResponse.json({ 
      success: true,
      message: 'Benutzerzuordnung erfolgreich gelöscht'
    })
  } catch (error: any) {
    console.error('User Match DELETE Error:', error.message)
    return NextResponse.json(
      { 
        error: 'Fehler beim Löschen der Benutzerzuordnung',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
