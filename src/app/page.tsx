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
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  assignedUser?: string
  assignedUserName?: string
  orderId?: string
  orderNumber?: string
  createdDate: string
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
            .sort((a: any, b: any) => new Date(b.createdDate || 0).getTime() - new Date(a.createdDate || 0).getTime())
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
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'OPEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'ORDER_ENTRY_IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ORDER_CONFIRMATION_PRINTED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'INVOICED': return 'bg-green-100 text-green-800 border-green-200'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-xl text-muted-foreground mt-2">Willkommen im WeClapp Manager</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gesamte Aufträge</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <span className="text-green-600">{stats.activeProjects}</span>
                  <span className="ml-1">aktiv</span>
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aufgaben</p>
                <p className="text-3xl font-bold mt-2">{stats.totalTasks}</p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                  <span className="text-green-600">{stats.completedTasks}</span>
                  <span className="ml-1">erledigt</span>
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Überfällige Aufgaben</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdueTasks}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Benötigen Aufmerksamkeit
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gesamtumsatz</p>
                <p className="text-3xl font-bold mt-2">
                  €{stats.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Alle Aufträge
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Erfolgsquote</p>
                <p className="text-3xl font-bold mt-2">
                  {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Aufgaben erledigt
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktive Projekte</p>
                <p className="text-3xl font-bold mt-2">{stats.activeProjects}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  In Bearbeitung
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Neueste Aufgaben</CardTitle>
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="text-primary">
                Alle anzeigen
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Keine Aufgaben gefunden</p>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-base">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getTaskStatusColor(task.status)}`}>
                          {getTaskStatusText(task.status)}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        {task.orderNumber && (
                          <Badge variant="outline" className="text-xs">
                            #{task.orderNumber}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {task.assignedUserName && (
                      <div className="text-sm text-muted-foreground ml-4">{task.assignedUserName}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Neueste Aufträge</CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-primary">
                Alle anzeigen
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Keine Aufträge gefunden</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-base">#{order.orderNumber}</div>
                      <div className="text-sm text-muted-foreground">{order.customerName}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-right ml-4">
                      €{parseFloat(order.netAmount || '0').toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {(userRole === 'admin' || userRole === 'manager') && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Schnellaktionen</CardTitle>
            <CardDescription>
              Häufig genutzte Funktionen für die Verwaltung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/orders">
                <Button variant="outline" className="w-full h-12 justify-center">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Aufträge verwalten
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" className="w-full h-12 justify-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aufgaben prüfen
                </Button>
              </Link>
              <Link href="/team">
                <Button variant="outline" className="w-full h-12 justify-center">
                  <Users className="mr-2 h-4 w-4" />
                  Team verwalten
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
