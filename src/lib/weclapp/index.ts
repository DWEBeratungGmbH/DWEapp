/**
 * WeClapp Integration - Zentrale Exports
 * 
 * Verwendung:
 * 
 * import { TaskService, createTaskService, WeClappTask } from '@/lib/weclapp'
 */

// Types
export * from './types'

// API Client
export { WeClappAPI, createWeClappClient } from './api'

// Services
export { TaskService, createTaskService, type UserContext } from './tasks.service'

// Permissions
export { 
  PERMISSIONS, 
  hasPermission, 
  hasAllPermissions,
  hasAnyPermission,
  getTaskDataScope,
  getPermissionsForRole,
  ROLE_PERMISSIONS 
} from './permissions'

// Session Helper
export { 
  getUserContextFromSession, 
  isWeClappConnected, 
  checkPermission 
} from './session'
