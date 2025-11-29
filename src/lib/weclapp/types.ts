/**
 * WeClapp API Types
 * Basierend auf der WeClapp REST API Dokumentation
 */

// ========================================
// AUFGABEN (Tasks)
// ========================================

export interface WeClappTaskAssignee {
  id: string
  createdDate: number
  lastModifiedDate: number
  version: string
  plannedEffort?: number
  userId: string
}

export interface WeClappTaskWatcher {
  id: string
}

export interface WeClappTask {
  id: string
  createdDate: number
  lastModifiedDate: number
  version: string
  
  // Basis-Informationen
  subject: string
  description?: string
  identifier: string
  
  // Status & Priorität
  taskStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'WAITING_ON_OTHERS'
  taskPriority: 'LOW' | 'MEDIUM' | 'HIGH'
  
  // Zeitraum
  dateFrom?: number
  dateTo?: number
  plannedEffort?: number
  
  // Zuweisungen & Beobachter
  assignees: WeClappTaskAssignee[]
  watchers: WeClappTaskWatcher[]
  creatorUserId: string
  
  // Hierarchie (Haupt-/Unteraufgaben)
  parentTaskId?: string
  previousTaskId?: string
  positionNumber?: number
  
  // Verknüpfungen
  customerId?: string
  orderId?: string
  orderItemId?: string
  ticketId?: string
  articleId?: string
  
  // Sichtbarkeit
  taskVisibilityType: 'ORGANIZATION' | 'PRIVATE'
  
  // Abrechnung
  allowTimeBooking?: boolean
  allowOverBooking?: boolean
  billableStatus?: boolean
  invoicingStatus?: 'NOT_INVOICED' | 'PARTLY_INVOICED' | 'INVOICED'
  performanceRecordedStatus?: 'UNDEFINED' | 'NOT_PERFORMANCE_RECORDED' | 'PERFORMANCE_RECORDED'
  
  // Listen & Typen
  taskLists?: { id: string }[]
  taskTypes?: { id: string }[]
  taskTopics?: { id: string }[]
  
  // Custom Attributes
  customAttributes?: WeClappCustomAttribute[]
}

export interface WeClappCustomAttribute {
  attributeDefinitionId: string
  booleanValue?: boolean
  dateValue?: number
  numberValue?: number
  stringValue?: string
  selectedValueId?: string
  entityId?: string
}

// ========================================
// BENUTZER (Users)
// ========================================

export interface WeClappUser {
  id: string
  createdDate: number
  lastModifiedDate: number
  version: string
  
  email: string
  firstName: string
  lastName: string
  loginName: string
  
  active: boolean
  userRoles?: string[]
}

// ========================================
// API RESPONSE WRAPPER
// ========================================

export interface WeClappResponse<T> {
  result: T[]
}

export interface WeClappSingleResponse<T> {
  result: T
}

// ========================================
// FILTER & QUERY OPTIONEN
// ========================================

export interface WeClappTaskFilter {
  assigneeUserId?: string      // Aufgaben für bestimmten Benutzer
  watcherUserId?: string       // Aufgaben wo Benutzer Beobachter ist
  taskStatus?: string[]        // Status-Filter
  taskPriority?: string[]      // Prioritäts-Filter
  parentTaskId?: string        // Unteraufgaben eines bestimmten Tasks
  dateFrom?: number            // Ab Datum
  dateTo?: number              // Bis Datum
  includeSubTasks?: boolean    // Unteraufgaben einschließen
}

// ========================================
// APP-INTERNE TYPEN
// ========================================

export interface TaskWithAccess extends WeClappTask {
  // Zusätzliche App-spezifische Felder
  isAssignee: boolean          // Ist der aktuelle Benutzer Assignee?
  isWatcher: boolean           // Ist der aktuelle Benutzer Watcher?
  canEdit: boolean             // Kann der Benutzer bearbeiten?
  canDelete: boolean           // Kann der Benutzer löschen?
  subTasks?: TaskWithAccess[]  // Unteraufgaben
}

export type TaskDataScope = 'all' | 'own'
