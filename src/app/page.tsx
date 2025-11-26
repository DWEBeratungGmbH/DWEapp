"use client"

import React, { useEffect, useState } from 'react'
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Euro, 
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalOrders: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  totalRevenue: number
  activeProjects: number
}

interface RecentTask {
  id: string
  name: string
  status: string
  priority: string
  dueDate?: number
  assignedUser?: string
  orderNumber?: string
}

interface RecentOrder {
  id: string
  orderNumber: string
  status: string
  customerName: string
  netAmount: string
  orderDate: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalRevenue: 0,
    activeProjects: 0
  })
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('employee')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Parallel API Calls
        const [tasksResponse, ordersResponse] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/orders')
        ])

        if (tasksResponse.ok && ordersResponse.ok) {
          const tasksData = await tasksResponse.json()
          const ordersData = await ordersResponse.json()

          const tasks = tasksData.tasks || []
          const orders = ordersData.orders || []

          // Calculate stats
          const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length
          const overdueTasks = tasks.filter((t: any) => 
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
          ).length
          const totalRevenue = orders.reduce((sum: number, order: any) => 
            sum + parseFloat(order.netAmount || 0), 0
          )
          const activeProjects = orders.filter((order: any) => 
            !['CANCELLED', 'SHIPPED'].includes(order.status)
          ).length

          setStats({
            totalOrders: orders.length,
            totalTasks: tasks.length,
            completedTasks,
            overdueTasks,
            totalRevenue,
            activeProjects
          })

          // Get recent items
          const recent = tasks
            .sort((a: any, b: any) => (b.createdDate || 0) - (a.createdDate || 0))
            .slice(0, 5)
          setRecentTasks(recent)

          const recentO = orders
            .sort((a: any, b: any) => (b.orderDate || 0) - (a.orderDate || 0))
            .slice(0, 5)
          setRecentOrders(recentO)
        }
      } catch (error) {
        console.error('Dashboard loading error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getTaskStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'OPEN': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'Erledigt'
      case 'IN_PROGRESS': return 'In Arbeit'
      case 'OPEN': return 'Offen'
      case 'OVERDUE': return 'Überfällig'
      default: return status || 'Offen'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'ORDER_ENTRY_IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'ORDER_CONFIRMATION_PRINTED': return 'bg-blue-100 text-blue-800'
      case 'INVOICED': return 'bg-green-100 text-green-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
        Lade Dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Willkommen im WeClapp Manager</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gesamte Aufträge</p>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.activeProjects} aktiv
              </p>
            </div>
            <ClipboardList className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aufgaben</p>
              <p className="text-3xl font-bold">{stats.totalTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.completedTasks} erledigt
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Überfällige Aufgaben</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdueTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Benötigen Aufmerksamkeit
              </p>
            </div>
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gesamtumsatz</p>
              <p className="text-3xl font-bold">
                €{stats.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Alle Aufträge
              </p>
            </div>
            <Euro className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Erfolgsquote</p>
              <p className="text-3xl font-bold">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Aufgaben erledigt
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Aktive Projekte</p>
              <p className="text-3xl font-bold">{stats.activeProjects}</p>
              <p className="text-sm text-muted-foreground mt-1">
                In Bearbeitung
              </p>
            </div>
            <BarChart3 className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Neueste Aufgaben</h2>
            <Link href="/tasks" className="text-primary hover:underline text-sm">
              Alle anzeigen
            </Link>
          </div>
          <div className="space-y-4">
            {recentTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Keine Aufgaben gefunden</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{task.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                        {getTaskStatusText(task.status)}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.orderNumber && (
                        <span className="text-xs text-muted-foreground">#{task.orderNumber}</span>
                      )}
                    </div>
                  </div>
                  {task.assignedUser && (
                    <div className="text-sm text-muted-foreground">{task.assignedUser}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Neueste Aufträge</h2>
            <Link href="/orders" className="text-primary hover:underline text-sm">
              Alle anzeigen
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Keine Aufträge gefunden</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">#{order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">{order.customerName}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    €{parseFloat(order.netAmount || '0').toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {(userRole === 'admin' || userRole === 'manager') && (
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Schnellaktionen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/orders" className="btn btn-outline flex items-center justify-center">
              <ClipboardList className="mr-2 h-4 w-4" />
              Aufträge verwalten
            </Link>
            <Link href="/tasks" className="btn btn-outline flex items-center justify-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Aufgaben prüfen
            </Link>
            <Link href="/reports" className="btn btn-outline flex items-center justify-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Berichte ansehen
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
