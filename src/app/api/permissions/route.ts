import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AVAILABLE_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, RolePermissions } from '@/lib/permissions'

// GET /api/permissions - Alle verfügbaren Berechtigungen und Rollen-Konfigurationen
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      permissions: AVAILABLE_PERMISSIONS,
      defaultRoles: DEFAULT_ROLE_PERMISSIONS
    })
  } catch (error) {
    console.error('Fehler beim Laden der Berechtigungen:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

// PUT /api/permissions - Rollen-Berechtigungen aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 })
    }

    const body: RolePermissions = await request.json()
    
    // Validierung
    if (!body.roleId || !body.roleName || !Array.isArray(body.permissions) || !body.dataScope) {
      return NextResponse.json({ error: 'Ungültige Daten' }, { status: 400 })
    }

    // Prüfen ob alle Berechtigungen gültig sind
    const validPermissionIds = AVAILABLE_PERMISSIONS.map(p => p.id)
    const invalidPermissions = body.permissions.filter(p => !validPermissionIds.includes(p))
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json({ 
        error: 'Ungültige Berechtigungen', 
        invalidPermissions 
      }, { status: 400 })
    }

    // Hier würde die Speicherung in der Datenbank erfolgen
    // Zum Beispiel:
    // await db.rolePermissions.upsert({
    //   where: { roleId: body.roleId },
    //   update: body,
    //   create: body
    // })

    console.log('Berechtigungen gespeichert:', body)

    return NextResponse.json({
      success: true,
      message: 'Berechtigungen erfolgreich gespeichert',
      rolePermissions: body
    })
  } catch (error) {
    console.error('Fehler beim Speichern der Berechtigungen:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
