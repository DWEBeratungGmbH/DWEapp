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
  
  // ----------------------------------------
  // PARTIES (Kunden, Lieferanten, Kontakte)
  // ----------------------------------------
  
  /**
   * Alle Parties laden
   */
  async getParties(filter?: { customer?: boolean; supplier?: boolean }): Promise<any[]> {
    const params: Record<string, any> = { pageSize: 1000 }
    if (filter?.customer !== undefined) params['customer-eq'] = filter.customer
    if (filter?.supplier !== undefined) params['supplier-eq'] = filter.supplier
    
    const query = this.buildQueryString(params)
    const response = await this.request<WeClappResponse<any>>(`/party${query}`)
    return response.result
  }
  
  /**
   * Einzelne Party laden
   */
  async getParty(partyId: string): Promise<any> {
    const response = await this.request<any>(`/party/id/${partyId}`)
    return response
  }
  
  /**
   * Party erstellen
   */
  async createParty(party: any): Promise<any> {
    const response = await this.request<any>('/party', {
      method: 'POST',
      body: JSON.stringify(party),
    })
    return response
  }
  
  /**
   * Party aktualisieren
   */
  async updateParty(partyId: string, updates: any): Promise<any> {
    const response = await this.request<any>(`/party/id/${partyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return response
  }
  
  /**
   * Party löschen
   */
  async deleteParty(partyId: string): Promise<void> {
    await this.request(`/party/id/${partyId}`, {
      method: 'DELETE',
    })
  }
  
  // ----------------------------------------
  // SALES ORDERS (Aufträge)
  // ----------------------------------------
  
  /**
   * Alle Aufträge laden
   */
  async getSalesOrders(filter?: { status?: string }): Promise<any[]> {
    const params: Record<string, any> = { pageSize: 1000 }
    if (filter?.status) params['status-eq'] = filter.status
    
    const query = this.buildQueryString(params)
    const response = await this.request<WeClappResponse<any>>(`/salesOrder${query}`)
    return response.result
  }
  
  /**
   * Einzelnen Auftrag laden
   */
  async getSalesOrder(orderId: string): Promise<any> {
    const response = await this.request<any>(`/salesOrder/id/${orderId}`)
    return response
  }
  
  /**
   * Auftrag erstellen
   */
  async createSalesOrder(order: any): Promise<any> {
    const response = await this.request<any>('/salesOrder', {
      method: 'POST',
      body: JSON.stringify(order),
    })
    return response
  }
  
  /**
   * Auftrag aktualisieren
   */
  async updateSalesOrder(orderId: string, updates: any): Promise<any> {
    const response = await this.request<any>(`/salesOrder/id/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return response
  }
  
  /**
   * Auftrag löschen
   */
  async deleteSalesOrder(orderId: string): Promise<void> {
    await this.request(`/salesOrder/id/${orderId}`, {
      method: 'DELETE',
    })
  }
  
  // ----------------------------------------
  // TIME RECORDS (Zeiteinträge)
  // ----------------------------------------
  
  /**
   * Alle Zeiteinträge laden
   */
  async getTimeRecords(filter?: { userId?: string; taskId?: string; startDate?: string; endDate?: string }): Promise<any[]> {
    const params: Record<string, any> = { pageSize: 1000 }
    if (filter?.userId) params['userId-eq'] = filter.userId
    if (filter?.taskId) params['taskId-eq'] = filter.taskId
    if (filter?.startDate) params['startDate-ge'] = filter.startDate
    if (filter?.endDate) params['startDate-le'] = filter.endDate
    
    const query = this.buildQueryString(params)
    const response = await this.request<WeClappResponse<any>>(`/timeRecord${query}`)
    return response.result
  }
  
  /**
   * Einzelnen Zeiteintrag laden
   */
  async getTimeRecord(timeRecordId: string): Promise<any> {
    const response = await this.request<any>(`/timeRecord/id/${timeRecordId}`)
    return response
  }
  
  /**
   * Zeiteintrag erstellen
   */
  async createTimeRecord(timeRecord: any): Promise<any> {
    const response = await this.request<any>('/timeRecord', {
      method: 'POST',
      body: JSON.stringify(timeRecord),
    })
    return response
  }
  
  /**
   * Zeiteintrag aktualisieren
   */
  async updateTimeRecord(timeRecordId: string, updates: any): Promise<any> {
    const response = await this.request<any>(`/timeRecord/id/${timeRecordId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    return response
  }
  
  /**
   * Zeiteintrag löschen
   */
  async deleteTimeRecord(timeRecordId: string): Promise<void> {
    await this.request(`/timeRecord/id/${timeRecordId}`, {
      method: 'DELETE',
    })
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
