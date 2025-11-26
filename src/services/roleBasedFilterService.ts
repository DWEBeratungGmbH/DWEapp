// Role-based Task Filtering Service
export interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  assignedUser?: string
  assignedUserName?: string
  orderId?: string
  orderNumber?: string
  dueDate?: string
  createdDate: string
  estimatedHours?: number
  actualHours?: number
}

export interface User {
  id: string
  email: string
  name: string
  role: 'employee' | 'manager' | 'admin' | 'project_manager'
  weClappUserId?: string
  department?: string
}

export interface FilteredTasks {
  tasks: Task[]
  totalCount: number
  userRole: string
  filters: string[]
}

// Aufgaben nach Benutzerrolle filtern
export function filterTasksByRole(tasks: Task[], user: User): FilteredTasks {
  const { role, id: userId, weClappUserId } = user
  let filteredTasks: Task[] = []
  const appliedFilters: string[] = []
  
  switch (role) {
    case 'employee':
      // Nur eigene Aufgaben
      filteredTasks = tasks.filter(task => 
        task.assignedUser === userId || 
        task.assignedUser === weClappUserId
      )
      appliedFilters.push('assigned-to-me')
      break
      
    case 'project_manager':
      // Alle Aufgaben + offene Aufträge
      filteredTasks = tasks.filter(task => 
        task.status !== 'completed' && 
        task.status !== 'closed'
      )
      appliedFilters.push('open-tasks')
      break
      
    case 'manager':
      // Alle Aufgaben + offene Aufträge
      filteredTasks = tasks.filter(task => 
        task.status !== 'completed' && 
        task.status !== 'closed'
      )
      appliedFilters.push('open-tasks', 'manager-view')
      break
      
    case 'admin':
      // Alle Aufgaben (kein Filter)
      filteredTasks = tasks
      appliedFilters.push('all-access')
      break
      
    default:
      filteredTasks = []
      appliedFilters.push('no-role')
  }
  
  // Zusätzliche Filter nach Department (falls vorhanden)
  if (user.department && role !== 'admin') {
    filteredTasks = filteredTasks.filter(task => {
      // Hier könnten wir Aufgaben nach Department filtern
      // Für jetzt lassen wir das offen
      return true
    })
    if (user.department) {
      appliedFilters.push(`department-${user.department}`)
    }
  }
  
  return {
    tasks: filteredTasks,
    totalCount: filteredTasks.length,
    userRole: role,
    filters: appliedFilters
  }
}

// Aufträge nach Benutzerrolle filtern
export function filterOrdersByRole(orders: any[], user: User) {
  const { role } = user
  let filteredOrders = orders
  
  switch (role) {
    case 'employee':
      // Nur eigene Aufträge (wo man als Mitarbeiter zugeordnet ist)
      filteredOrders = orders.filter(order => 
        order.projectMembers?.some((member: any) => 
          member.userId === user.weClappUserId
        )
      )
      break
      
    case 'project_manager':
    case 'manager':
      // Alle offenen Aufträge
      filteredOrders = orders.filter(order => 
        order.status !== 'completed' && 
        order.status !== 'closed'
      )
      break
      
    case 'admin':
      // Alle Aufträge
      break
  }
  
  return {
    orders: filteredOrders,
    totalCount: filteredOrders.length,
    userRole: role
  }
}

// Berechtigungen für Aktionen prüfen
export function canUserPerformAction(user: User, action: string, resource?: any): boolean {
  const { role } = user
  
  switch (action) {
    case 'view_all_tasks':
      return role === 'admin' || role === 'manager' || role === 'project_manager'
      
    case 'edit_task':
      return role === 'admin' || role === 'manager' || role === 'project_manager'
      
    case 'delete_task':
      return role === 'admin' || role === 'manager'
      
    case 'assign_task':
      return role === 'admin' || role === 'manager' || role === 'project_manager'
      
    case 'view_all_orders':
      return role === 'admin' || role === 'manager'
      
    case 'create_order':
      return role === 'admin' || role === 'manager'
      
    case 'edit_order':
      return role === 'admin' || role === 'manager'
      
    case 'delete_order':
      return role === 'admin'
      
    case 'manage_users':
      return role === 'admin'
      
    default:
      return false
  }
}
