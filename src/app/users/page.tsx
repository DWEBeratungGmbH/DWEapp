"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  RefreshCw,
  UserCircle,
  Shield,
  ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface User {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  username: string
  department?: string
  position?: string
  phone?: string
  mobilePhoneNumber?: string
  status: boolean
  roles: string[]
  createdDate?: number
  lastModifiedDate?: number
  profileMatched: boolean
  localUserId: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>('employee')
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Column header filter states
  const [columnFilters, setColumnFilters] = useState({
    status: 'all',
    department: 'all',
    role: 'all'
  })
  const [activeColumnFilter, setActiveColumnFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        
        const response = await fetch('/api/users')
        
        if (!response.ok) {
          throw new Error('Benutzer konnten nicht geladen werden')
        }
        
        const data = await response.json()
        setUsers(data.result || [])
        setError(null)
      } catch (err: any) {
        console.error('Fehler beim Abrufen der Benutzer:', err)
        setError(`Konnte die Benutzer nicht laden: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Get unique values for filters
  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(users.map(user => user.department).filter(Boolean)))
  }, [users])
  
  const uniqueRoles = useMemo(() => {
    const allRoles = users.flatMap(user => user.roles)
    return Array.from(new Set(allRoles)).filter(Boolean)
  }, [users])

  // Filter Logik
  const filteredUsers = users.filter(user => {
    // Suchfilter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!user.name?.toLowerCase().includes(searchLower) &&
          !user.email?.toLowerCase().includes(searchLower) &&
          !user.username?.toLowerCase().includes(searchLower) &&
          !user.department?.toLowerCase().includes(searchLower) &&
          !user.position?.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Column header filters
    if (columnFilters.status !== 'all') {
      if (columnFilters.status === 'active' && !user.status) return false
      if (columnFilters.status === 'inactive' && user.status) return false
    }
    
    if (columnFilters.department !== 'all' && user.department !== columnFilters.department) {
      return false
    }
    
    if (columnFilters.role !== 'all' && !user.roles.includes(columnFilters.role)) {
      return false
    }

    // Statusfilter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !user.status) return false
      if (statusFilter === 'inactive' && user.status) return false
    }

    // Rollenfilter
    if (roleFilter !== 'all' && !user.roles.includes(roleFilter)) {
      return false
    }

    // Abteilungsfilter
    if (departmentFilter !== 'all' && user.department !== departmentFilter) {
      return false
    }

    return true
  })

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setRoleFilter('all')
    setDepartmentFilter('all')
    setColumnFilters({
      status: 'all',
      department: 'all',
      role: 'all'
    })
  }

  const activeFiltersCount = [
    searchTerm ? 'search' : null,
    statusFilter !== 'all' ? 'status' : null,
    roleFilter !== 'all' ? 'role' : null,
    departmentFilter !== 'all' ? 'department' : null,
    columnFilters.status !== 'all' ? 'columnStatus' : null,
    columnFilters.department !== 'all' ? 'columnDepartment' : null,
    columnFilters.role !== 'all' ? 'columnRole' : null
  ].filter(Boolean).length

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString('de-DE')
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'employee': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'Administrator'
      case 'manager': return 'Manager'
      case 'employee': return 'Mitarbeiter'
      default: return role
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Benutzer</h1>
          <p className="text-muted-foreground">
            {filteredUsers.length} von {users.length} Benutzern
          </p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Neuer Benutzer
        </Button>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" onClick={clearFilters}>
                  Filter löschen
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Aktualisieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Benutzer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                >
                  <option value="all">Alle Status</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rolle</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                >
                  <option value="all">Alle Rollen</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>
                      {getRoleText(role)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Abteilung</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md"
                >
                  <option value="all">Alle Abteilungen</option>
                  {uniqueDepartments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Lade Benutzer...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-800">
            <strong>Fehler:</strong> {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      <div className="flex items-center space-x-2">
                        <span>Benutzer</span>
                        <div className="relative">
                          <button
                            onClick={() => setActiveColumnFilter(activeColumnFilter === 'status' ? null : 'status')}
                            className="p-1 hover:bg-muted rounded"
                            title="Status filtern"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          {activeColumnFilter === 'status' && (
                            <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-10 min-w-40">
                              <select
                                value={columnFilters.status}
                                onChange={(e) => setColumnFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full p-2 border-0 bg-transparent"
                                autoFocus
                              >
                                <option value="all">Alle Status</option>
                                <option value="active">Aktiv</option>
                                <option value="inactive">Inaktiv</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Kontakt</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      <div className="flex items-center space-x-2">
                        <span>Rolle</span>
                        <div className="relative">
                          <button
                            onClick={() => setActiveColumnFilter(activeColumnFilter === 'role' ? null : 'role')}
                            className="p-1 hover:bg-muted rounded"
                            title="Rolle filtern"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          {activeColumnFilter === 'role' && (
                            <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-10 min-w-40">
                              <select
                                value={columnFilters.role}
                                onChange={(e) => setColumnFilters(prev => ({ ...prev, role: e.target.value }))}
                                className="w-full p-2 border-0 bg-transparent"
                                autoFocus
                              >
                                <option value="all">Alle Rollen</option>
                                {uniqueRoles.map(role => (
                                  <option key={role} value={role}>
                                    {getRoleText(role)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">
                      <div className="flex items-center space-x-2">
                        <span>Abteilung</span>
                        <div className="relative">
                          <button
                            onClick={() => setActiveColumnFilter(activeColumnFilter === 'department' ? null : 'department')}
                            className="p-1 hover:bg-muted rounded"
                            title="Abteilung filtern"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          {activeColumnFilter === 'department' && (
                            <div className="absolute top-full left-0 mt-1 bg-background border rounded-md shadow-lg z-10 min-w-40">
                              <select
                                value={columnFilters.department}
                                onChange={(e) => setColumnFilters(prev => ({ ...prev, department: e.target.value }))}
                                className="w-full p-2 border-0 bg-transparent"
                                autoFocus
                              >
                                <option value="all">Alle Abteilungen</option>
                                {uniqueDepartments.map(dept => (
                                  <option key={dept} value={dept}>
                                    {dept}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Erstellt</th>
                    <th className="h-12 px-4 text-left align-middle font-medium w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        {users.length === 0 ? 'Keine Benutzer gefunden.' : 'Keine Benutzer entsprechen den Filterkriterien.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                              <UserCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                              <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  user.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.status ? 'Aktiv' : 'Inaktiv'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="mr-2 h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                            {user.mobilePhoneNumber && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="mr-2 h-3 w-3" />
                                {user.mobilePhoneNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{user.position || '-'}</div>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role) => (
                                <Badge key={role} variant="secondary" className={`text-xs ${getRoleBadgeColor(role)}`}>
                                  {getRoleText(role)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center text-sm">
                            <Building className="mr-2 h-3 w-3 text-muted-foreground" />
                            {user.department || '-'}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-3 w-3" />
                            {formatDate(user.createdDate)}
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
