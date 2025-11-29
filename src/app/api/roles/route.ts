import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Alle Rollen mit Berechtigungen und Daten-Scope laden
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Prüfen ob Benutzer Admin ist
    const currentUser = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${session.user.email}` as any[]

    if (!currentUser || currentUser.length === 0 || currentUser[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nur Administratoren können Rollen einsehen' }, { status: 403 })
    }

    // Rollen laden
    const roles = await prisma.$queryRaw`SELECT * FROM roles ORDER BY "createdAt" ASC` as any[]

    // Berechtigungen laden
    const permissions = await prisma.$queryRaw`
      SELECT rp.*, r."roleId" 
      FROM role_permissions rp 
      JOIN roles r ON rp."roleId" = r.id
    ` as any[]

    // DataScopes laden
    const dataScopes = await prisma.$queryRaw`SELECT * FROM role_data_scopes` as any[]

    // Daten zusammenführen
    const formattedRoles = roles.map((role: any) => {
      const rolePermissions = permissions.filter((p: any) => p.roleId === role.id)
      const roleDataScopes = dataScopes.filter((ds: any) => ds.roleId === role.id)

      return {
        id: role.id,
        roleId: role.roleId,
        roleName: role.roleName,
        description: role.description,
        isSystem: role.isSystem,
        permissions: rolePermissions.map((p: any) => p.permissionId),
        dataScope: roleDataScopes.reduce((acc: any, ds: any) => {
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

    const currentUser = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${session.user.email}` as any[]

    if (!currentUser || currentUser.length === 0 || currentUser[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nur Administratoren können Rollen erstellen' }, { status: 403 })
    }

    const { roleId, roleName, description, permissions, dataScope } = await request.json()

    if (!roleId || !roleName) {
      return NextResponse.json({ error: 'RoleId und RoleName sind erforderlich' }, { status: 400 })
    }

    // Prüfen ob roleId bereits existiert
    const existingRole = await prisma.$queryRaw`SELECT * FROM roles WHERE "roleId" = ${roleId}` as any[]

    if (existingRole.length > 0) {
      return NextResponse.json({ error: 'Diese Rollen-ID existiert bereits' }, { status: 400 })
    }

    // Rolle erstellen
    const result = await prisma.$queryRaw`
      INSERT INTO roles (id, "roleId", "roleName", description, "isSystem", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${roleId}, ${roleName}, ${description || null}, false, NOW(), NOW())
      RETURNING *
    ` as any[]

    const createdRole = result[0]

    // Berechtigungen erstellen
    if (permissions && permissions.length > 0) {
      const permissionValues = permissions.map((permissionId: string) => 
        `(gen_random_uuid(), ${createdRole.id}, ${permissionId}, NOW())`
      ).join(', ')
      
      await prisma.$queryRaw`
        INSERT INTO role_permissions (id, "roleId", "permissionId", "createdAt")
        VALUES ${permissionValues}
      `
    }

    // DataScopes erstellen
    if (dataScope) {
      const scopeEntries = Object.entries(dataScope).filter(([_, scope]) => scope)
      if (scopeEntries.length > 0) {
        const scopeValues = scopeEntries.map(([dataType, scope]) => 
          `(gen_random_uuid(), ${createdRole.id}, ${dataType}, ${scope}, NOW(), NOW())`
        ).join(', ')
        
        await prisma.$queryRaw`
          INSERT INTO role_data_scopes (id, "roleId", "dataType", scope, "createdAt", "updatedAt")
          VALUES ${scopeValues}
        `
      }
    }

    // Rolle mit allen Daten neu laden
    const rolePermissions = await prisma.$queryRaw`
      SELECT "permissionId" FROM role_permissions WHERE "roleId" = ${createdRole.id}
    ` as any[]

    const roleDataScopes = await prisma.$queryRaw`
      SELECT * FROM role_data_scopes WHERE "roleId" = ${createdRole.id}
    ` as any[]

    // Formatieren für Frontend
    const formattedRole = {
      id: createdRole.id,
      roleId: createdRole.roleId,
      roleName: createdRole.roleName,
      description: createdRole.description,
      isSystem: createdRole.isSystem,
      permissions: rolePermissions.map((p: any) => p.permissionId),
      dataScope: roleDataScopes.reduce((acc: any, ds: any) => {
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
