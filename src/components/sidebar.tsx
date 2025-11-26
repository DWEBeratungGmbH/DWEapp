"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  CheckSquare,
  Settings,
  Clock,
  BarChart3,
  UserCircle,
  Filter
} from 'lucide-react'

export function Sidebar({ userRole = 'employee' }: { userRole?: string }) {
  const pathname = usePathname()

  // Rollen-basierte Navigation
  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'manager', 'project_manager', 'employee'] },
      { name: 'Meine Aufgaben', href: '/tasks?view=my', icon: CheckSquare, roles: ['admin', 'manager', 'project_manager', 'employee'] },
      { name: 'Alle Aufgaben', href: '/tasks?view=all', icon: CheckSquare, roles: ['admin', 'manager', 'project_manager'] },
      { name: 'Aufträge', href: '/orders', icon: ClipboardList, roles: ['admin', 'manager', 'project_manager', 'employee'] },
      { name: 'Zeit-Buchung', href: '/time', icon: Clock, roles: ['admin', 'manager', 'project_manager', 'employee'] },
      { name: 'Team', href: '/team', icon: Users, roles: ['admin', 'manager'] },
      { name: 'Kunden', href: '/customers', icon: Users, roles: ['admin', 'manager'] },
      { name: 'Statistik', href: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
      { name: 'Einstellungen', href: '/settings', icon: Settings, roles: ['admin'] },
    ]

    return baseNav.filter(item => item.roles.includes(userRole))
  }

  const navigation = getNavigation()

  return (
    <div className="flex h-full w-64 flex-col bg-card">
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <h1 className="text-xl font-semibold text-foreground">Weclapp Manager</h1>
      </div>
      
      {/* User Info */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Benutzer</div>
            <div className="text-xs text-muted-foreground capitalize">{userRole}</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col px-4 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                            (item.href === '/tasks' && pathname.startsWith('/tasks'))
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors'
                  )}
                >
                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
