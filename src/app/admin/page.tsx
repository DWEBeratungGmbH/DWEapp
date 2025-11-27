"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Shield,
  Key,
  MoreHorizontal,
  Trash2,
  Copy,
  RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface LocalUser {
  id: string
  email: string
  name: string
  role: string
  weClappUserId: string
  isActive: boolean
  createdAt: string
}

interface Invitation {
  id: string
  email: string
  token: string
  createdAt: string
  expiresAt: string
}

interface WeClappUser {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  active: boolean
}

export default function AdminPage() {
  const { data: session } = useSession()
  
  // State
  const [activeTab, setActiveTab] = useState<'users' | 'system'>('users')
  const [localUsers, setLocalUsers] = useState<LocalUser[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [weclappUsers, setWeclappUsers] = useState<WeClappUser[]>([])
  
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingWeClapp, setIsLoadingWeClapp] = useState(false)
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWeClappUser, setSelectedWeClappUser] = useState<WeClappUser | null>(null)
  const [selectedRole, setSelectedRole] = useState('USER')
  const [isInviting, setIsInviting] = useState(false)

  // Initial Data Load
  useEffect(() => {
    fetchLocalData()
  }, [])

  // Load WeClapp users when modal opens
  useEffect(() => {
    if (showAddModal && weclappUsers.length === 0) {
      fetchWeClappUsers()
    }
  }, [showAddModal])

  const fetchLocalData = async () => {
    try {
      const res = await fetch('/api/users/list')
      const data = await res.json()
      if (data.users) setLocalUsers(data.users)
      if (data.invitations) setInvitations(data.invitations)
    } catch (error) {
      toast.error('Fehler beim Laden der Benutzerliste')
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchWeClappUsers = async () => {
    setIsLoadingWeClapp(true)
    try {
      const res = await fetch('/api/weclapp/users')
      const data = await res.json()
      if (data.result) setWeclappUsers(data.result)
    } catch (error) {
      toast.error('Fehler beim Laden der WeClapp Benutzer')
    } finally {
      setIsLoadingWeClapp(false)
    }
  }

  const handleInvite = async () => {
    if (!selectedWeClappUser) return

    setIsInviting(true)
    try {
      // Email Fallback: Wenn keine Email in WeClapp, nutze Username oder warne
      const emailToUse = selectedWeClappUser.email || selectedWeClappUser.username // Oft ist Username = Email
      
      if (!emailToUse || !emailToUse.includes('@')) {
        toast.error('Dieser WeClapp User hat keine gültige E-Mail Adresse!')
        setIsInviting(false)
        return
      }

      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          weclappUserId: selectedWeClappUser.id,
          role: selectedRole,
          name: `${selectedWeClappUser.firstName} ${selectedWeClappUser.lastName}`.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Mitarbeiter eingeladen!')
        // Link kopieren
        if (data.result.inviteUrl) {
          navigator.clipboard.writeText(data.result.inviteUrl)
          toast.success('Einladungs-Link in Zwischenablage kopiert')
        }
        
        setShowAddModal(false)
        setSelectedWeClappUser(null)
        fetchLocalData() // Refresh list
      } else {
        toast.error(data.error || 'Fehler beim Einladen')
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten')
    } finally {
      setIsInviting(false)
    }
  }

  // Helper to check if WeClapp user is already in system
  const isUserAlreadyAdded = (weclappId: string, email: string) => {
    const inLocal = localUsers.some(u => u.weClappUserId === weclappId || u.email === email)
    const inInvites = invitations.some(i => i.email === email)
    return inLocal || inInvites
  }

  // Filter WeClapp users
  const filteredWeClappUsers = weclappUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    return (
      user.active && // Nur aktive WeClapp User anzeigen
      (fullName.includes(searchLower) || 
       user.email?.toLowerCase().includes(searchLower))
    )
  })

  if (!session?.user?.role?.includes('ADMIN')) {
    return <div className="p-8">Kein Zugriff.</div>
  }

  return (
    <div className="space-y-6 p-2 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin-Einstellungen</h1>
          <p className="text-muted-foreground">Verwalte Benutzer, Rollen und Systemeinstellungen.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Mitarbeiter hinzufügen
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Mitarbeiter ({localUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'system' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Key className="h-4 w-4" />
          System & API
        </button>
      </div>

      {/* Content: Users */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Offene Einladungen */}
          {invitations.length > 0 && (
            <div className="bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Offene Einladungen ({invitations.length})
              </h3>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {invitations.map(invite => (
                  <div key={invite.id} className="bg-background border rounded-md p-3 flex justify-between items-center shadow-sm">
                    <div className="truncate">
                      <div className="font-medium text-sm truncate">{invite.email}</div>
                      <div className="text-xs text-muted-foreground">Expires: {new Date(invite.expiresAt).toLocaleDateString()}</div>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/invite/${invite.token}`)
                        toast.success('Link kopiert')
                      }}
                      className="p-2 hover:bg-accent rounded-full text-muted-foreground"
                      title="Link erneut kopieren"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Liste */}
          <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
            {isLoadingData ? (
              <div className="p-8 text-center text-muted-foreground">Lade Benutzer...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name / E-Mail</th>
                      <th className="px-4 py-3 font-medium">Rolle</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Beigetreten am</th>
                      <th className="px-4 py-3 font-medium text-right">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {localUsers.map(user => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{user.name || 'Unbekannt'}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {user.isActive ? (
                            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              Aktiv
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              Inaktiv
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1 hover:bg-accent rounded text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content: System */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" /> API Konfiguration
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">WeClapp API URL</label>
                <div className="mt-1 p-2 bg-muted rounded border font-mono text-sm truncate">
                  {process.env.NEXT_PUBLIC_WECLAPP_API_URL || 'Nicht gesetzt'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Clockin API URL</label>
                <div className="mt-1 p-2 bg-muted rounded border font-mono text-sm truncate">
                  {process.env.NEXT_PUBLIC_CLOCKIN_API_URL || 'Nicht gesetzt'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border shadow-lg rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Mitarbeiter aus WeClapp hinzufügen</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Wähle einen WeClapp-Benutzer aus, um ihn einzuladen.
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-accent rounded-full"
              >
                <span className="sr-only">Schließen</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Suchen nach Name oder E-Mail..."
                  className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* List */}
              <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                {isLoadingWeClapp ? (
                  <div className="p-8 flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Lade WeClapp Benutzer...
                  </div>
                ) : filteredWeClappUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Keine Benutzer gefunden.
                  </div>
                ) : (
                  filteredWeClappUsers.map(user => {
                    const isAdded = isUserAlreadyAdded(user.id, user.email)
                    const isSelected = selectedWeClappUser?.id === user.id

                    return (
                      <button
                        key={user.id}
                        disabled={isAdded}
                        onClick={() => setSelectedWeClappUser(user)}
                        className={`w-full text-left p-3 flex items-center justify-between transition-colors ${
                          isAdded 
                            ? 'bg-muted/50 opacity-60 cursor-not-allowed' 
                            : isSelected
                              ? 'bg-primary/10 border-l-4 border-primary'
                              : 'hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isAdded ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                          }`}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-muted-foreground">{user.email || user.username}</div>
                          </div>
                        </div>
                        
                        {isAdded && (
                          <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Bereits hinzugefügt
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>

              {/* Selection Settings */}
              {selectedWeClappUser && (
                <div className="bg-muted/30 p-4 rounded-md border animate-in slide-in-from-top-2">
                  <h4 className="text-sm font-medium mb-3">Einstellungen für {selectedWeClappUser.firstName}</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rolle zuweisen</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full p-2 rounded border bg-background text-sm"
                      >
                        <option value="USER">Mitarbeiter (Standard)</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">WeClapp ID</label>
                      <input 
                        disabled 
                        value={selectedWeClappUser.id} 
                        className="w-full p-2 rounded border bg-muted text-muted-foreground text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-muted/10 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleInvite}
                disabled={!selectedWeClappUser || isInviting}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {isInviting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sende Einladung...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Einladung senden
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
