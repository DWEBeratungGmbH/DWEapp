/**
 * Task Service
 * Kombiniert WeClapp API mit App-Berechtigungen
 */

import { WeClappAPI, createWeClappClient } from './api'
import { WeClappTask, TaskWithAccess, TaskDataScope } from './types'

// ========================================
// BENUTZER-KONTEXT
// ========================================

export interface UserContext {
  userId: string              // App User ID
  weClappUserId?: string      // WeClapp User ID (muss verknüpft sein)
  role: string                // ADMIN, MANAGER, USER
  taskDataScope: TaskDataScope // 'all' oder 'own'
  permissions: string[]       // Liste der Berechtigungen
}

// ========================================
// TASK SERVICE KLASSE
// ========================================

export class TaskService {
  private api: WeClappAPI
  private userContext: UserContext
  
  constructor(userContext: UserContext, api?: WeClappAPI) {
    this.userContext = userContext
    this.api = api || createWeClappClient()
  }
  
  // ----------------------------------------
  // BERECHTIGUNGSPRÜFUNGEN
  // ----------------------------------------
  
  /**
   * Prüft ob Benutzer mit WeClapp verbunden ist
   */
  isWeClappConnected(): boolean {
    return !!this.userContext.weClappUserId
  }
  
  /**
   * Prüft ob Benutzer eine Berechtigung hat
   */
  hasPermission(permission: string): boolean {
    return this.userContext.permissions.includes(permission)
  }
  
  /**
   * Prüft ob Benutzer Aufgaben sehen kann
   */
  canViewTasks(): boolean {
    return this.isWeClappConnected() && this.hasPermission('tasks.view')
  }
  
  /**
   * Prüft ob Benutzer Aufgaben erstellen kann
   */
  canCreateTask(): boolean {
    return this.isWeClappConnected() && this.hasPermission('tasks.create')
  }
  
  /**
   * Prüft ob Benutzer eine Aufgabe bearbeiten kann
   */
  canEditTask(task: WeClappTask): boolean {
    if (!this.hasPermission('tasks.edit')) return false
    
    // Admin/Manager können alle Aufgaben bearbeiten
    if (this.userContext.taskDataScope === 'all') return true
    
    // Normale Benutzer nur eigene Aufgaben
    return this.isUserInvolved(task)
  }
  
  /**
   * Prüft ob Benutzer eine Aufgabe löschen kann
   */
  canDeleteTask(task: WeClappTask): boolean {
    if (!this.hasPermission('tasks.delete')) return false
    
    // Nur Admin/Manager können Aufgaben löschen
    return this.userContext.taskDataScope === 'all'
  }
  
  /**
   * Prüft ob Benutzer Aufgaben zuweisen kann
   */
  canAssignTask(): boolean {
    return this.hasPermission('tasks.assign')
  }
  
  /**
   * Prüft ob Benutzer an einer Aufgabe beteiligt ist (Assignee oder Watcher)
   */
  isUserInvolved(task: WeClappTask): boolean {
    const weClappUserId = this.userContext.weClappUserId
    if (!weClappUserId) return false
    
    const isAssignee = task.assignees.some(a => a.userId === weClappUserId)
    const isWatcher = task.watchers.some(w => w.id === weClappUserId)
    const isCreator = task.creatorUserId === weClappUserId
    
    return isAssignee || isWatcher || isCreator
  }
  
  // ----------------------------------------
  // AUFGABEN LADEN
  // ----------------------------------------
  
  /**
   * Aufgaben laden basierend auf Benutzer-Berechtigung
   * - Admin/Manager: Alle Aufgaben
   * - Benutzer: Nur eigene Aufgaben (Assignee/Watcher)
   */
  async getTasks(): Promise<TaskWithAccess[]> {
    if (!this.canViewTasks()) {
      throw new Error('Keine Berechtigung zum Anzeigen von Aufgaben oder WeClapp nicht verbunden')
    }
    
    let tasks: WeClappTask[]
    
    if (this.userContext.taskDataScope === 'all') {
      // Admin/Manager: Alle Aufgaben
      tasks = await this.api.getAllTasks()
    } else {
      // Normale Benutzer: Nur eigene Aufgaben
      tasks = await this.api.getTasksForUser(this.userContext.weClappUserId!)
    }
    
    // Aufgaben mit Berechtigungen anreichern
    return this.enrichTasksWithAccess(tasks)
  }
  
  /**
   * Einzelne Aufgabe laden
   */
  async getTask(taskId: string): Promise<TaskWithAccess | null> {
    if (!this.canViewTasks()) {
      throw new Error('Keine Berechtigung zum Anzeigen von Aufgaben')
    }
    
    const task = await this.api.getTask(taskId)
    
    // Berechtigungsprüfung
    if (this.userContext.taskDataScope === 'own' && !this.isUserInvolved(task)) {
      return null // Keine Berechtigung für diese Aufgabe
    }
    
    return this.enrichTaskWithAccess(task)
  }
  
  /**
   * Unteraufgaben laden
   */
  async getSubTasks(parentTaskId: string): Promise<TaskWithAccess[]> {
    if (!this.canViewTasks()) {
      throw new Error('Keine Berechtigung zum Anzeigen von Aufgaben')
    }
    
    const subTasks = await this.api.getSubTasks(parentTaskId)
    
    // Bei normalen Benutzern nur Aufgaben zeigen, an denen sie beteiligt sind
    const filteredTasks = this.userContext.taskDataScope === 'own'
      ? subTasks.filter(task => this.isUserInvolved(task))
      : subTasks
    
    return this.enrichTasksWithAccess(filteredTasks)
  }
  
  // ----------------------------------------
  // AUFGABEN ERSTELLEN/BEARBEITEN
  // ----------------------------------------
  
  /**
   * Aufgabe erstellen
   */
  async createTask(taskData: Partial<WeClappTask>): Promise<TaskWithAccess> {
    if (!this.canCreateTask()) {
      throw new Error('Keine Berechtigung zum Erstellen von Aufgaben')
    }
    
    const task = await this.api.createTask(taskData)
    return this.enrichTaskWithAccess(task)
  }
  
  /**
   * Aufgabe aktualisieren
   */
  async updateTask(taskId: string, updates: Partial<WeClappTask>): Promise<TaskWithAccess> {
    // Erst Aufgabe laden um Berechtigung zu prüfen
    const existingTask = await this.api.getTask(taskId)
    
    if (!this.canEditTask(existingTask)) {
      throw new Error('Keine Berechtigung zum Bearbeiten dieser Aufgabe')
    }
    
    const task = await this.api.updateTask(taskId, updates)
    return this.enrichTaskWithAccess(task)
  }
  
  /**
   * Aufgabe löschen
   */
  async deleteTask(taskId: string): Promise<void> {
    // Erst Aufgabe laden um Berechtigung zu prüfen
    const existingTask = await this.api.getTask(taskId)
    
    if (!this.canDeleteTask(existingTask)) {
      throw new Error('Keine Berechtigung zum Löschen dieser Aufgabe')
    }
    
    await this.api.deleteTask(taskId)
  }
  
  // ----------------------------------------
  // HELPER METHODEN
  // ----------------------------------------
  
  /**
   * Aufgabe mit Berechtigungsinformationen anreichern
   */
  private enrichTaskWithAccess(task: WeClappTask): TaskWithAccess {
    const weClappUserId = this.userContext.weClappUserId
    
    return {
      ...task,
      isAssignee: weClappUserId ? task.assignees.some(a => a.userId === weClappUserId) : false,
      isWatcher: weClappUserId ? task.watchers.some(w => w.id === weClappUserId) : false,
      canEdit: this.canEditTask(task),
      canDelete: this.canDeleteTask(task),
    }
  }
  
  /**
   * Mehrere Aufgaben mit Berechtigungsinformationen anreichern
   */
  private enrichTasksWithAccess(tasks: WeClappTask[]): TaskWithAccess[] {
    return tasks.map(task => this.enrichTaskWithAccess(task))
  }
}

// ========================================
// FACTORY FUNKTION
// ========================================

/**
 * Task Service erstellen
 */
export function createTaskService(userContext: UserContext): TaskService {
  return new TaskService(userContext)
}
