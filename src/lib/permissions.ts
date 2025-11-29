// Berechtigungs-Typen
export interface Permission {
  id: string
  name: string
  description: string
  category: 'navigation' | 'data' | 'actions'
  module: string
}

export interface RolePermissions {
  roleId: string
  roleName: string
  permissions: string[]
  dataScope: {
    tasks: 'own' | 'assigned' | 'team' | 'all'
    projects: 'own' | 'assigned' | 'team' | 'all'
    users: 'own' | 'team' | 'all'
    orders: 'own' | 'assigned' | 'team' | 'all'
    reports: 'own' | 'team' | 'all'
  }
}

// Alle verfügbaren Berechtigungen
export const AVAILABLE_PERMISSIONS: Permission[] = [
  // Navigation Berechtigungen
  { id: 'nav.dashboard', name: 'Dashboard', description: 'Dashboard anzeigen', category: 'navigation', module: 'dashboard' },
  { id: 'nav.tasks', name: 'Aufgaben', description: 'Aufgabenbereich anzeigen', category: 'navigation', module: 'tasks' },
  { id: 'nav.projects', name: 'Projekte', description: 'Projektbereich anzeigen', category: 'navigation', module: 'projects' },
  { id: 'nav.orders', name: 'Aufträge', description: 'Auftragsbereich anzeigen', category: 'navigation', module: 'orders' },
  { id: 'nav.admin', name: 'Administration', description: 'Admin-Bereich anzeigen', category: 'navigation', module: 'admin' },
  
  // Aufgaben Berechtigungen
  { id: 'tasks.create', name: 'Aufgaben erstellen', description: 'Neue Aufgaben anlegen', category: 'actions', module: 'tasks' },
  { id: 'tasks.edit', name: 'Aufgaben bearbeiten', description: 'Bestehende Aufgaben bearbeiten', category: 'actions', module: 'tasks' },
  { id: 'tasks.delete', name: 'Aufgaben löschen', description: 'Aufgaben löschen', category: 'actions', module: 'tasks' },
  { id: 'tasks.assign', name: 'Aufgaben zuweisen', description: 'Aufgaben anderen Benutzern zuweisen', category: 'actions', module: 'tasks' },
  { id: 'tasks.complete', name: 'Aufgaben abschließen', description: 'Aufgaben als erledigt markieren', category: 'actions', module: 'tasks' },
  
  // Projekt Berechtigungen
  { id: 'projects.create', name: 'Projekte erstellen', description: 'Neue Projekte anlegen', category: 'actions', module: 'projects' },
  { id: 'projects.edit', name: 'Projekte bearbeiten', description: 'Projektdaten bearbeiten', category: 'actions', module: 'projects' },
  { id: 'projects.delete', name: 'Projekte löschen', description: 'Projekte löschen', category: 'actions', module: 'projects' },
  { id: 'projects.assign', name: 'Projekte zuweisen', description: 'Benutzer zu Projekten zuweisen', category: 'actions', module: 'projects' },
  
  // Auftrags Berechtigungen
  { id: 'orders.create', name: 'Aufträge erstellen', description: 'Neue Aufträge anlegen', category: 'actions', module: 'orders' },
  { id: 'orders.edit', name: 'Aufträge bearbeiten', description: 'Auftragsdaten bearbeiten', category: 'actions', module: 'orders' },
  { id: 'orders.delete', name: 'Aufträge löschen', description: 'Aufträge löschen', category: 'actions', module: 'orders' },
  { id: 'orders.export', name: 'Aufträge exportieren', description: 'Auftragsdaten exportieren', category: 'actions', module: 'orders' },
  
  // Benutzer Berechtigungen
  { id: 'users.create', name: 'Benutzer erstellen', description: 'Neue Benutzer anlegen/einladen', category: 'actions', module: 'users' },
  { id: 'users.edit', name: 'Benutzer bearbeiten', description: 'Benutzerdaten bearbeiten', category: 'actions', module: 'users' },
  { id: 'users.delete', name: 'Benutzer löschen', description: 'Benutzer löschen', category: 'actions', module: 'users' },
  { id: 'users.roles', name: 'Rollen verwalten', description: 'Benutzerrollen ändern', category: 'actions', module: 'users' },
  
  // System Berechtigungen
  { id: 'system.api', name: 'API-Einstellungen', description: 'API-Konfiguration bearbeiten', category: 'actions', module: 'system' },
  { id: 'system.settings', name: 'Systemeinstellungen', description: 'Globale Einstellungen bearbeiten', category: 'actions', module: 'system' },
  { id: 'system.logs', name: 'System-Logs', description: 'Systemprotokolle einsehen', category: 'actions', module: 'system' },
  { id: 'system.backup', name: 'Backup erstellen', description: 'Datensicherungen erstellen', category: 'actions', module: 'system' },
]

// Standard-Rollen-Konfigurationen
export const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  ADMIN: {
    roleId: 'ADMIN',
    roleName: 'Administrator',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    dataScope: {
      tasks: 'all',
      projects: 'all',
      users: 'all',
      orders: 'all',
      reports: 'all'
    }
  },
  MANAGER: {
    roleId: 'MANAGER',
    roleName: 'Manager',
    permissions: [
      ...AVAILABLE_PERMISSIONS.filter(p => p.category === 'navigation').map(p => p.id),
      ...AVAILABLE_PERMISSIONS.filter(p => p.module === 'tasks').map(p => p.id),
      ...AVAILABLE_PERMISSIONS.filter(p => p.module === 'projects').map(p => p.id),
      ...AVAILABLE_PERMISSIONS.filter(p => p.module === 'orders').map(p => p.id),
      'users.create', 'users.edit'
    ],
    dataScope: {
      tasks: 'team',
      projects: 'team',
      users: 'team',
      orders: 'team',
      reports: 'team'
    }
  },
  USER: {
    roleId: 'USER',
    roleName: 'Benutzer',
    permissions: [
      'nav.dashboard', 'nav.tasks', 'nav.projects', 'nav.orders',
      'tasks.create', 'tasks.edit', 'tasks.complete',
      'projects.create', 'projects.edit'
    ],
    dataScope: {
      tasks: 'assigned',
      projects: 'assigned',
      users: 'own',
      orders: 'assigned',
      reports: 'own'
    }
  }
}

// Daten-Scope Beschreibungen
export const DATA_SCOPE_DESCRIPTIONS = {
  own: 'Nur eigene Daten',
  assigned: 'Mir zugewiesene Daten',
  team: 'Team-Daten',
  all: 'Alle Daten'
}

// Hilfsfunktionen
export const hasPermission = (userRole: string, permissionId: string, customPermissions?: RolePermissions[]): boolean => {
  if (!userRole) return false
  
  // Prüfe custom permissions first
  if (customPermissions) {
    const rolePerms = customPermissions.find(rp => rp.roleId === userRole)
    return rolePerms?.permissions.includes(permissionId) || false
  }
  
  // Fallback zu default permissions
  return DEFAULT_ROLE_PERMISSIONS[userRole]?.permissions.includes(permissionId) || false
}

export const getDataScope = (userRole: string, dataType: keyof RolePermissions['dataScope'], customPermissions?: RolePermissions[]): string => {
  if (!userRole) return 'own'
  
  if (customPermissions) {
    const rolePerms = customPermissions.find(rp => rp.roleId === userRole)
    return rolePerms?.dataScope[dataType] || 'own'
  }
  
  return DEFAULT_ROLE_PERMISSIONS[userRole]?.dataScope[dataType] || 'own'
}
