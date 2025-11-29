import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT - Rolle aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nur Administratoren können Rollen bearbeiten' }, { status: 403 })
    }

    const { roleName, description, permissions, dataScope } = await request.json()

    // Rolle finden
    const role = await prisma.role.findUnique({
      where: { roleId }
    })

    if (!role) {
      return NextResponse.json({ error: 'Rolle nicht gefunden' }, { status: 404 })
    }

    // Systemrollen können nicht bearbeitet werden (außer Berechtigungen)
    if (role.isSystem && (roleName !== role.roleName || description !== role.description)) {
      return NextResponse.json({ error: 'Systemrollen können nicht umbenannt werden' }, { status: 400 })
    }

    // Berechtigungen aktualisieren
    if (permissions) {
      // Alte Berechtigungen löschen
      await prisma.rolePermission.deleteMany({
        where: { roleId: role.id }
      })

      // Neue Berechtigungen hinzufügen
      if (permissions.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissions.map((permissionId: string) => ({
            roleId: role.id,
            permissionId
          }))
        })
      }
    }

    // Daten-Scope aktualisieren
    if (dataScope) {
      // Alte Scopes löschen
      await prisma.roleDataScope.deleteMany({
        where: { roleId: role.id }
      })

      // Neue Scopes hinzufügen
      const scopeEntries = Object.entries(dataScope).filter(([_, scope]) => scope)
      if (scopeEntries.length > 0) {
        await prisma.roleDataScope.createMany({
          data: scopeEntries.map(([dataType, scope]) => ({
            roleId: role.id,
            dataType,
            scope: scope as string
          }))
        })
      }
    }

    // Rolle aktualisieren (wenn keine Systemrolle)
    const updatedRole = await prisma.role.update({
      where: { id: role.id },
      data: {
        ...(roleName && !role.isSystem ? { roleName } : {}),
        ...(description !== undefined && !role.isSystem ? { description } : {})
      },
      include: {
        permissions: {
          select: {
            permissionId: true
          }
        }
      }
    })

    // DataScopes neu laden
    const updatedDataScopes = await prisma.roleDataScope.findMany({
      where: { roleId: role.id }
    })

    // Formatieren für Frontend
    const formattedRole = {
      id: updatedRole.id,
      roleId: updatedRole.roleId,
      roleName: updatedRole.roleName,
      description: updatedRole.description,
      isSystem: updatedRole.isSystem,
      permissions: updatedRole.permissions.map(p => p.permissionId),
      dataScope: updatedDataScopes.reduce((acc, scope) => {
        acc[scope.dataType] = scope.scope
        return acc
      }, {} as Record<string, string>)
    }

    return NextResponse.json({ success: true, role: formattedRole })
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Rolle:', error)
    return NextResponse.json({ error: 'Fehler beim Aktualisieren der Rolle' }, { status: 500 })
  }
}

// DELETE - Rolle löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nur Administratoren können Rollen löschen' }, { status: 403 })
    }

    // Rolle finden
    const role = await prisma.role.findUnique({
      where: { roleId }
    })

    if (!role) {
      return NextResponse.json({ error: 'Rolle nicht gefunden' }, { status: 404 })
    }

    // Systemrollen können nicht gelöscht werden
    if (role.isSystem) {
      return NextResponse.json({ error: 'Systemrollen können nicht gelöscht werden' }, { status: 400 })
    }

    // Prüfen ob Benutzer diese Rolle haben
    const usersWithRole = await prisma.user.count({
      where: { role: roleId }
    })

    if (usersWithRole > 0) {
      return NextResponse.json({ error: 'Diese Rolle wird noch von Benutzern verwendet' }, { status: 400 })
    }

    // Rolle löschen (Cascade löscht automatisch Berechtigungen und DataScopes)
    await prisma.role.delete({
      where: { id: role.id }
    })

    return NextResponse.json({ success: true, message: 'Rolle erfolgreich gelöscht' })
  } catch (error) {
    console.error('Fehler beim Löschen der Rolle:', error)
    return NextResponse.json({ error: 'Fehler beim Löschen der Rolle' }, { status: 500 })
  }
}
