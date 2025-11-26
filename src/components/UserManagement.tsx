'use client'

import { useState, useEffect } from 'react'
import { Search, UserCog, Check, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface WeClappUser {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  username: string
  department?: string
  position?: string
  active: boolean
  roles: string[]
  profileMatched: boolean
  localUserId: string | null
}

export default function UserManagement() {
  const [users, setUsers] = useState<WeClappUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.result) {
        setUsers(data.result)
      } else {
        setError(data.error || 'Fehler beim Laden der Benutzer')
      }
    } catch (err) {
      setError('Netzwerkfehler beim Laden der Benutzer')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Benutzerverwaltung</h2>
          <p className="text-muted-foreground">
            Verwalten Sie WeClapp-Benutzer und deren Berechtigungen.
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Aktualisieren
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Benutzerliste</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <CardDescription>
            Gesamt: {users.length} | Aktiv: {users.filter(u => u.active).length} | Zugeordnet: {users.filter(u => u.profileMatched).length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchUsers}>Erneut versuchen</Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Email / Benutzername</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Abteilung / Position</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Rollen</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-muted-foreground">
                        Keine Benutzer gefunden.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div className="font-medium">{user.name}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-sm">{user.email}</div>
                            <div className="text-xs text-muted-foreground">{user.username}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="text-sm">{user.department || '-'}</div>
                            <div className="text-xs text-muted-foreground">{user.position || '-'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {user.active ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aktiv</Badge>
                          ) : (
                            <Badge variant="secondary">Inaktiv</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.slice(0, 2).map((role, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                            {user.roles && user.roles.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.roles.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            <UserCog className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
