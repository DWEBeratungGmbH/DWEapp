import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Alle Rollen mit Berechtigungen und Daten-Scope laden
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Prüfen ob Benutzer Admin ist (über ID, sicherer als Email)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      console.log(`User ${session.user.email} (ID: ${session.user.id}) tried to access roles but has role ${currentUser?.role}`)
      return NextResponse.json({ error: 'Nur Administratoren können Rollen einsehen' }, { status: 403 })
    }

    // Rollen laden mit Prisma
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        permissions: true,
        dataScopes: true
      }
    })

    // Daten zusammenführen
    const formattedRoles = roles.map((role: any) => {
      return {
        id: role.id,
        roleId: role.roleId,
        roleName: role.roleName,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions.map((p: any) => p.permissionId),
        dataScope: role.dataScopes.reduce((acc: any, ds: any) => {
          acc[ds.dataType] = ds.scope
          return acc
        }, {} as Record<string, string>)
      }
    })

    return NextResponse.json({ success: true, roles: formattedRoles })
  } catch (error) {
    console.error('Fehler beim Laden der Rollen:', error)
    return NextResponse.json({ error: 'Fehler beim Laden der Rollen' }, { status: 500 })
  }
}

// POST - Neue Rolle erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nur Administratoren können Rollen erstellen' }, { status: 403 })
    }

    const { roleId, roleName, description, permissions, dataScope } = await request.json()

    if (!roleId || !roleName) {
      return NextResponse.json({ error: 'RoleId und RoleName sind erforderlich' }, { status: 400 })
    }

    // Prüfen ob roleId bereits existiert
    const existingRole = await prisma.role.findUnique({
      where: { roleId }
    })

    if (existingRole) {
      return NextResponse.json({ error: 'Diese Rollen-ID existiert bereits' }, { status: 400 })
    }

    // Rolle erstellen mit Transaktion für atomare Operation
    const createdRole = await prisma.$transaction(async (tx: any) => {
      // 1. Rolle erstellen
      const role = await tx.role.create({
        data: {
          roleId,
          roleName,
          description,
          isSystem: false
        }
      })

      // 2. Permissions erstellen
      if (permissions && permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: permissions.map((permissionId: string) => ({
            roleId: role.id,
            permissionId
          }))
        })
      }

      // 3. DataScopes erstellen
      if (dataScope) {
        const scopeEntries = Object.entries(dataScope).filter(([_, scope]) => scope)
        if (scopeEntries.length > 0) {
          await tx.roleDataScope.createMany({
            data: scopeEntries.map(([dataType, scope]) => ({
              roleId: role.id,
              dataType,
              scope: scope as string
            }))
          })
        }
      }
      
      // 4. Rolle mit Relationen zurückgeben
      return await tx.role.findUnique({
        where: { id: role.id },
        include: {
          permissions: true,
          dataScopes: true
        }
      })
    })
    
    if (!createdRole) {
        throw new Error('Failed to create role')
    }

    // Formatieren für Frontend
    const formattedRole = {
      id: createdRole.id,
      roleId: createdRole.roleId,
      roleName: createdRole.roleName,
      description: createdRole.description,
      isSystem: createdRole.isSystem,
      permissions: createdRole.permissions.map((p: any) => p.permissionId),
      dataScope: createdRole.dataScopes.reduce((acc: any, ds: any) => {
        acc[ds.dataType] = ds.scope
        return acc
      }, {} as Record<string, string>)
    }

    return NextResponse.json({ success: true, role: formattedRole })
  } catch (error) {
    console.error('Fehler beim Erstellen der Rolle:', error)
    return NextResponse.json({ error: 'Fehler beim Erstellen der Rolle' }, { status: 500 })
  }
}
