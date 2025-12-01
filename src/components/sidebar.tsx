"use client"

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Settings, 
  FileText, 
  CheckSquare,
  Menu,
  X,
  LogOut,
  User,
  Clock,
  StickyNote,
  Calendar,
  LayoutDashboard,
  UserCog,
  BarChart3,
  Building2,
  FileStack,
  Wrench,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import DarkModeToggle from '@/components/dark-mode-toggle'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface NavSection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
  minRole: 'USER' | 'MANAGER' | 'ADMIN'
  color: string
}

// Navigation Struktur
const navSections: NavSection[] = [
  {
    id: 'user',
    title: 'Meine Arbeit',
    icon: User,
    color: 'text-blue-500',
    minRole: 'USER',
    items: [
      { title: 'Meine Aufgaben', href: '/my-tasks', icon: CheckSquare },
      { title: 'Zeitbuchung', href: '/time-tracking', icon: Clock },
      { title: 'Notizen', href: '/notes', icon: StickyNote },
      { title: 'Kalender', href: '/calendar', icon: Calendar },
    ]
  },
  {
    id: 'management',
    title: 'Management',
    icon: LayoutDashboard,
    color: 'text-green-500',
    minRole: 'MANAGER',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: Home },
      { title: 'Aufgaben', href: '/tasks', icon: CheckSquare },
      { title: 'Aufträge', href: '/orders', icon: FileText },
      { title: 'Zeiterfassung', href: '/time-entries', icon: Clock },
      { title: 'Controlling', href: '/reports', icon: BarChart3 },
    ]
  },
  {
    id: 'admin',
    title: 'Administration',
    icon: Settings,
    color: 'text-orange-500',
    minRole: 'ADMIN',
    items: [
      { title: 'Benutzer', href: '/admin', icon: Users },
      { title: 'Stammdaten', href: '/admin/master-data', icon: Building2 },
      { title: 'Vorlagen', href: '/admin/templates', icon: FileStack },
      { title: 'Einstellungen', href: '/admin/settings', icon: Wrench },
    ]
  }
]

// Rollen-Hierarchie
const roleHierarchy: Record<string, number> = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3
}

export function Sidebar() {
  const { data: session, status } = useSession()
  const user = session?.user
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['user', 'management', 'admin'])

  const userRole = (user?.role as string) || 'USER'
  const userRoleLevel = roleHierarchy[userRole] || 1

  // Prüfen ob User Zugriff auf Section hat
  const hasAccess = (minRole: string): boolean => {
    const minRoleLevel = roleHierarchy[minRole] || 1
    return userRoleLevel >= minRoleLevel
  }

  // Section toggle
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  // Filtere Sections nach Rolle
  const visibleSections = navSections.filter(section => hasAccess(section.minRole))

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

      {/* Navigation mit Bereichen */}
      <nav className="sidebar-nav">
        <div className="space-y-4">
          {visibleSections.map((section) => {
            const SectionIcon = section.icon
            const isExpanded = expandedSections.includes(section.id)
            
            return (
              <div key={section.id} className="nav-section">
                {/* Section Header */}
                <button
                  onClick={() => !isCollapsed && toggleSection(section.id)}
                  className={`nav-section-header ${section.color}`}
                >
                  <div className="flex items-center gap-2">
                    <SectionIcon className="h-4 w-4" />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium text-sm">{section.title}</span>
                        <span className="ml-auto">
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* Section Items */}
                {(isExpanded || isCollapsed) && (
                  <div className={`nav-section-items ${isCollapsed ? 'mt-1' : 'mt-2'}`}>
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`nav-item ${isActive ? 'active' : ''}`}
                          title={isCollapsed ? item.title : undefined}
                        >
                          <Icon className="nav-icon" />
                          {!isCollapsed && (
                            <span className="flex-1">{item.title}</span>
                          )}
                          {!isCollapsed && item.badge && (
                            <span className="nav-badge">{item.badge}</span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
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
                  {userRole}
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
