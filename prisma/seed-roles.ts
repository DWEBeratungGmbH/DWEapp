import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_ROLES = [
  {
    roleId: 'ADMIN',
    roleName: 'Administrator',
    description: 'Vollzugriff auf alle Funktionen und Daten',
    isSystem: true,
    permissions: [
      // Navigation
      'nav.dashboard',
      'nav.admin',
      'nav.projects',
      'nav.tasks',
      'nav.users',
      'nav.settings',
      
      // Aktionen
      'action.users.create',
      'action.users.edit',
      'action.users.delete',
      'action.users.invite',
      'action.roles.create',
      'action.roles.edit',
      'action.roles.delete',
      'action.projects.create',
      'action.projects.edit',
      'action.projects.delete',
      'action.tasks.create',
      'action.tasks.edit',
      'action.tasks.delete',
      'action.api.access',
      
      // Daten-Scope
      'data.users.all',
      'data.projects.all',
      'data.tasks.all',
      'data.reports.all'
    ],
    dataScope: {
      users: 'all',
      projects: 'all',
      tasks: 'all',
      reports: 'all'
    }
  },
  {
    roleId: 'MANAGER',
    roleName: 'Manager',
    description: 'Zugriff auf Team-Management und Projektsteuerung',
    isSystem: true,
    permissions: [
      // Navigation
      'nav.dashboard',
      'nav.projects',
      'nav.tasks',
      'nav.users',
      
      // Aktionen
      'action.users.invite',
      'action.users.edit',
      'action.projects.create',
      'action.projects.edit',
      'action.tasks.create',
      'action.tasks.edit',
      'action.tasks.delete',
      'action.reports.view',
      
      // Daten-Scope
      'data.users.department',
      'data.projects.department',
      'data.tasks.department',
      'data.reports.department'
    ],
    dataScope: {
      users: 'department',
      projects: 'department',
      tasks: 'department',
      reports: 'department'
    }
  },
  {
    roleId: 'USER',
    roleName: 'Benutzer',
    description: 'Standardzugriff auf persönliche Aufgaben und Projekte',
    isSystem: true,
    permissions: [
      // Navigation
      'nav.dashboard',
      'nav.projects',
      'nav.tasks',
      
      // Aktionen
      'action.tasks.create',
      'action.tasks.edit',
      'action.reports.view',
      
      // Daten-Scope
      'data.projects.assigned',
      'data.tasks.assigned',
      'data.reports.own'
    ],
    dataScope: {
      projects: 'assigned',
      tasks: 'assigned',
      reports: 'own'
    }
  }
]

async function seedRoles() {
  console.log('🔄 Seeding Rollen...')

  for (const roleData of DEFAULT_ROLES) {
    const existingRole = await prisma.role.findUnique({
      where: { roleId: roleData.roleId }
    })

    if (!existingRole) {
      console.log(`📝 Erstelle Rolle: ${roleData.roleName}`)
      
      // Rolle erstellen
      const role = await prisma.role.create({
        data: {
          roleId: roleData.roleId,
          roleName: roleData.roleName,
          description: roleData.description,
          isSystem: roleData.isSystem,
          permissions: {
            create: roleData.permissions.map(permissionId => ({
              permissionId
            }))
          }
        }
      })

      // DataScopes separat erstellen
      if (roleData.dataScope) {
        await prisma.roleDataScope.createMany({
          data: Object.entries(roleData.dataScope).map(([dataType, scope]) => ({
            roleId: role.id,
            dataType,
            scope
          }))
        })
      }

      console.log(`✅ Rolle erstellt: ${role.roleName}`)
    } else {
      console.log(`⏭️  Rolle existiert bereits: ${roleData.roleName}`)
    }
  }

  console.log('🎉 Rollen-Seeding abgeschlossen!')
}

async function main() {
  try {
    await seedRoles()
  } catch (error) {
    console.error('❌ Fehler beim Seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
