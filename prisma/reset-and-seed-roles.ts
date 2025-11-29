import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * VEREINFACHTES BERECHTIGUNGSSYSTEM
 * 
 * Fokus: WeClapp-Aufgaben mit Zuweisungen und Beobachtern
 * 
 * Sichtbarkeit:
 * - Admin/Manager: Alle Aufgaben sehen
 * - Benutzer: Nur eigene Aufgaben (als assignee oder watcher)
 * - Voraussetzung: WeClapp-Konto muss verknüpft sein
 */

const PERMISSIONS = {
  // Navigation
  NAV_DASHBOARD: 'nav.dashboard',
  NAV_TASKS: 'nav.tasks',
  NAV_ADMIN: 'nav.admin',
  
  // Aufgaben-Aktionen
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_EDIT: 'tasks.edit',
  TASKS_DELETE: 'tasks.delete',
  TASKS_ASSIGN: 'tasks.assign',
  
  // Admin-Aktionen
  ADMIN_USERS: 'admin.users',
  ADMIN_ROLES: 'admin.roles',
  ADMIN_SETTINGS: 'admin.settings',
  
  // WeClapp-Integration
  WECLAPP_CONNECT: 'weclapp.connect',
  WECLAPP_SYNC: 'weclapp.sync',
}

// Aufgaben-Sichtbarkeit
const DATA_SCOPES = {
  TASKS_ALL: 'all',       // Alle Aufgaben sehen (Admin, Manager)
  TASKS_OWN: 'own',       // Nur eigene Aufgaben (als assignee oder watcher)
}

const SIMPLIFIED_ROLES = [
  {
    roleId: 'ADMIN',
    roleName: 'Administrator',
    description: 'Vollzugriff auf alle Funktionen und Aufgaben',
    isSystem: true,
    permissions: [
      // Alle Navigation
      PERMISSIONS.NAV_DASHBOARD,
      PERMISSIONS.NAV_TASKS,
      PERMISSIONS.NAV_ADMIN,
      
      // Alle Aufgaben-Aktionen
      PERMISSIONS.TASKS_VIEW,
      PERMISSIONS.TASKS_CREATE,
      PERMISSIONS.TASKS_EDIT,
      PERMISSIONS.TASKS_DELETE,
      PERMISSIONS.TASKS_ASSIGN,
      
      // Alle Admin-Aktionen
      PERMISSIONS.ADMIN_USERS,
      PERMISSIONS.ADMIN_ROLES,
      PERMISSIONS.ADMIN_SETTINGS,
      
      // WeClapp
      PERMISSIONS.WECLAPP_CONNECT,
      PERMISSIONS.WECLAPP_SYNC,
    ],
    dataScope: {
      tasks: DATA_SCOPES.TASKS_ALL  // Alle Aufgaben sehen
    }
  },
  {
    roleId: 'MANAGER',
    roleName: 'Manager',
    description: 'Zugriff auf alle Aufgaben und Team-Management',
    isSystem: true,
    permissions: [
      // Navigation
      PERMISSIONS.NAV_DASHBOARD,
      PERMISSIONS.NAV_TASKS,
      
      // Aufgaben-Aktionen
      PERMISSIONS.TASKS_VIEW,
      PERMISSIONS.TASKS_CREATE,
      PERMISSIONS.TASKS_EDIT,
      PERMISSIONS.TASKS_DELETE,
      PERMISSIONS.TASKS_ASSIGN,
      
      // WeClapp
      PERMISSIONS.WECLAPP_CONNECT,
      PERMISSIONS.WECLAPP_SYNC,
    ],
    dataScope: {
      tasks: DATA_SCOPES.TASKS_ALL  // Alle Aufgaben sehen
    }
  },
  {
    roleId: 'USER',
    roleName: 'Benutzer',
    description: 'Zugriff auf eigene Aufgaben (als Zugewiesener oder Beobachter)',
    isSystem: true,
    permissions: [
      // Navigation
      PERMISSIONS.NAV_DASHBOARD,
      PERMISSIONS.NAV_TASKS,
      
      // Aufgaben-Aktionen (eingeschränkt)
      PERMISSIONS.TASKS_VIEW,
      PERMISSIONS.TASKS_CREATE,
      PERMISSIONS.TASKS_EDIT,
      
      // WeClapp
      PERMISSIONS.WECLAPP_CONNECT,
    ],
    dataScope: {
      tasks: DATA_SCOPES.TASKS_OWN  // Nur eigene Aufgaben (assignee/watcher)
    }
  }
]

async function resetAndSeedRoles() {
  console.log('🗑️  Lösche bestehende Rollen-Daten...')
  
  // Alte Daten löschen
  await prisma.$executeRaw`DELETE FROM role_data_scopes`
  await prisma.$executeRaw`DELETE FROM role_permissions`
  await prisma.$executeRaw`DELETE FROM roles`
  
  console.log('✅ Alte Daten gelöscht')
  console.log('')
  console.log('📝 Erstelle vereinfachte Rollen...')
  console.log('')

  for (const roleData of SIMPLIFIED_ROLES) {
    console.log(`🔄 Erstelle Rolle: ${roleData.roleName}`)
    
    // Rolle erstellen mit Raw SQL
    const result = await prisma.$queryRaw`
      INSERT INTO roles (id, "roleId", "roleName", description, "isSystem", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${roleData.roleId}, ${roleData.roleName}, ${roleData.description}, ${roleData.isSystem}, NOW(), NOW())
      RETURNING id
    ` as any[]
    
    const roleId = result[0].id

    // Berechtigungen erstellen
    for (const permissionId of roleData.permissions) {
      await prisma.$executeRaw`
        INSERT INTO role_permissions (id, "roleId", "permissionId", "createdAt")
        VALUES (gen_random_uuid(), ${roleId}, ${permissionId}, NOW())
      `
    }

    // DataScopes erstellen
    if (roleData.dataScope) {
      for (const [dataType, scope] of Object.entries(roleData.dataScope)) {
        await prisma.$executeRaw`
          INSERT INTO role_data_scopes (id, "roleId", "dataType", scope, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${roleId}, ${dataType}, ${scope}, NOW(), NOW())
        `
      }
    }

    console.log(`   ✅ ${roleData.permissions.length} Berechtigungen`)
    console.log(`   ✅ Aufgaben-Sichtbarkeit: ${roleData.dataScope.tasks}`)
    console.log('')
  }

  console.log('🎉 Vereinfachtes Berechtigungssystem erstellt!')
  console.log('')
  console.log('📋 Übersicht:')
  console.log('   • Administrator: Alle Aufgaben + Admin-Bereich')
  console.log('   • Manager: Alle Aufgaben (ohne Admin)')
  console.log('   • Benutzer: Nur eigene Aufgaben (assignee/watcher)')
  console.log('')
  console.log('⚠️  Wichtig: WeClapp-Konto muss verknüpft sein!')
}

async function main() {
  try {
    await resetAndSeedRoles()
  } catch (error) {
    console.error('❌ Fehler:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
