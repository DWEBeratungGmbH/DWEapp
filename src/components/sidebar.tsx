"use client"

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  FileText, 
  Building, 
  Folder, 
  MessageCircle,
  CheckSquare,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'
import DarkModeToggle from '@/components/dark-mode-toggle'

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredRole?: string
}

export function Sidebar() {
  const { data: session, status } = useSession()
  const user = session?.user
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Navigation items based on user role
  const getSidebarItems = (): SidebarItem[] => {
    const userRole = user?.role || 'USER'
    
    const commonItems = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
      },
      {
        title: 'Aufgaben',
        href: '/tasks',
        icon: CheckSquare,
      },
      {
        title: 'Aufträge',
        href: '/orders',
        icon: FileText,
      },
    ]

    const adminItems = [
      ...commonItems,
      {
        title: 'Administration',
        href: '/admin',
        icon: Settings,
        requiredRole: 'ADMIN',
      },
    ]

    const userItems = [
      ...commonItems,
      {
        title: 'Profil',
        href: '/profile',
        icon: User,
      },
    ]

    return userRole === 'ADMIN' ? adminItems : userItems
  }

  const sidebarItems = getSidebarItems()

  if (status === 'loading') {
    return (
      <div className="sidebar">
        <div className="animate-pulse space-y-4 p-4">
          <div className="h-8 bg-muted rounded"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="sidebar-brand">DWE Manager</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="icon-button"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="sidebar-footer">
        <div className="space-y-4">
          {/* User Profile */}
          <div className="user-profile">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <div className="user-name">
                  {user?.name || 'User'}
                </div>
                <div className="user-role">
                  {user?.email}
                </div>
              </div>
            )}
          </div>
          
          {/* Dark Mode Toggle */}
          <DarkModeToggle />
          
          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="btn btn-secondary w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && 'Abmelden'}
          </button>
        </div>
      </div>
    </div>
  )
}
