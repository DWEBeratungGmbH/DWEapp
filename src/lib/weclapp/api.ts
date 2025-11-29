/**
 * WeClapp API Client
 * Zentrale Verwaltung aller WeClapp API Aufrufe
 */

import { WeClappTask, WeClappUser, WeClappResponse, WeClappTaskFilter, TaskWithAccess, TaskDataScope } from './types'

// ========================================
// KONFIGURATION
// ========================================

interface WeClappConfig {
  baseUrl: string      // z.B. "https://TENANT.weclapp.com/webapp/api/v1"
  apiToken: string     // API Token für Authentifizierung
}

// ========================================
// API CLIENT KLASSE
// ========================================

export class WeClappAPI {
  private baseUrl: string
  private apiToken: string
  
  constructor(config: WeClappConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '') // Trailing slash entfernen
    this.apiToken = config.apiToken
  }
  
  // ----------------------------------------
  // PRIVATE HELPER METHODEN
  // ----------------------------------------
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'AuthenticationToken': this.apiToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`WeClapp API Error (${response.status}): ${error}`)
    }
    
    return response.json()
  }
  
  private buildQueryString(params: Record<string, any>): string {
    const queryParts: string[] = []
    
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      
      if (Array.isArray(value)) {
        // Arrays als mehrere Parameter
        value.forEach(v => queryParts.push(`${key}=${encodeURIComponent(v)}`))
      } else {
        queryParts.push(`${key}=${encodeURIComponent(value)}`)
      }
    }
    
    return queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
  }
  
  // ----------------------------------------
  // AUFGABEN (TASKS)
  // ----------------------------------------
  
  /**
   * Alle Aufgaben laden (für Admin/Manager)
   */
  async getAllTasks(filter?: WeClappTaskFilter): Promise<WeClappTask[]> {
    const query = this.buildQueryString(filter || {})
    const response = await this.request<WeClappResponse<WeClappTask>>(`/task${query}`)
    return response.result
  }
  
  /**
   * Aufgaben für einen bestimmten Benutzer laden (als Assignee oder Watcher)
   * Für normale Benutzer - nur eigene Aufgaben
   */
  async getTasksForUser(weClappUserId: string): Promise<WeClappTask[]> {
    // WeClapp API unterstützt keine OR-Abfrage, daher zwei Abfragen
    const [assignedTasks, watchedTasks] = await Promise.all([
      this.getTasksByAssignee(weClappUserId),
      this.getTasksByWatcher(weClappUserId),
    ])
    
    // Duplikate entfernen (falls Benutzer Assignee UND Watcher ist)
    const taskMap = new Map<string, WeClappTask>()
    
    assignedTasks.forEach(task => taskMap.set(task.id, task))
    watchedTasks.forEach(task => taskMap.set(task.id, task))
    
    return Array.from(taskMap.values())
  }
  
  /**
   * Aufgaben wo Benutzer als Assignee zugewiesen ist
   */
  async getTasksByAssignee(weClappUserId: string): Promise<WeClappTask[]> {
    // WeClapp Filter: assignees-userId-eq
    const query = `?assignees-userId-eq=${weClappUserId}`
    const response = await this.request<WeClappResponse<WeClappTask>>(`/task${query}`)
    return response.result
  }
  
  /**
   * Aufgaben wo Benutzer als Watcher (Beobachter) eingetragen ist
   */
  async getTasksByWatcher(weClappUserId: string): Promise<WeClappTask[]> {
    // WeClapp Filter: watchers-id-eq
    const query = `?watchers-id-eq=${weClappUserId}`
    const response = await this.request<WeClappResponse<WeClappTask>>(`/task${query}`)
    return response.result
  }
  
  /**
   * Einzelne Aufgabe laden
   */
  async getTask(taskId: string): Promise<WeClappTask> {
    const response = await this.request<{ result: WeClappTask }>(`/task/id/${taskId}`)
    return response.result
  }
  
  /**
   * Unteraufgaben einer Aufgabe laden
   */
  async getSubTasks(parentTaskId: string): Promise<WeClappTask[]> {
    const query = `?parentTaskId-eq=${parentTaskId}`
    const response = await this.request<WeClappResponse<WeClappTask>>(`/task${query}`)
    return response.result
  }
  
  /**
   * Aufgabe erstellen
   */
  async createTask(task: Partial<WeClappTask>): Promise<WeClappTask> {
    const response = await this.request<{ result: WeClappTask }>('/task', {
      method: 'POST',
      body: JSON.stringify(task),
    })
    return response.result
  }
  
  /**
   * Aufgabe aktualisieren
   */
  async updateTask(taskId: string, updates: Partial<WeClappTask>): Promise<WeClappTask> {
    const response = await this.request<{ result: WeClappTask }>(`/task/id/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return response.result
  }
  
  /**
   * Aufgabe löschen
   */
  async deleteTask(taskId: string): Promise<void> {
    await this.request(`/task/id/${taskId}`, {
      method: 'DELETE',
    })
  }
  
  // ----------------------------------------
  // BENUTZER (USERS)
  // ----------------------------------------
  
  /**
   * Alle WeClapp Benutzer laden
   */
  async getUsers(): Promise<WeClappUser[]> {
    const response = await this.request<WeClappResponse<WeClappUser>>('/user')
    return response.result
  }
  
  /**
   * Einzelnen Benutzer laden
   */
  async getUser(userId: string): Promise<WeClappUser> {
    const response = await this.request<{ result: WeClappUser }>(`/user/id/${userId}`)
    return response.result
  }
  
  /**
   * Aktuellen Benutzer laden (authentifizierter Benutzer)
   */
  async getCurrentUser(): Promise<WeClappUser> {
    const response = await this.request<{ result: WeClappUser }>('/user/currentUser')
    return response.result
  }
}

// ========================================
// FACTORY FUNKTION
// ========================================

/**
 * WeClapp API Client erstellen
 * Verwendet Umgebungsvariablen wenn keine Konfiguration übergeben wird
 */
export function createWeClappClient(config?: Partial<WeClappConfig>): WeClappAPI {
  const baseUrl = config?.baseUrl || process.env.WECLAPP_API_URL
  const apiToken = config?.apiToken || process.env.WECLAPP_API_TOKEN
  
  if (!baseUrl || !apiToken) {
    throw new Error('WeClapp API Konfiguration fehlt. Bitte WECLAPP_API_URL und WECLAPP_API_TOKEN setzen.')
  }
  
  return new WeClappAPI({ baseUrl, apiToken })
}
