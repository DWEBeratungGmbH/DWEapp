'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Mail, Building, Shield, Loader2, Search, Link, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'

interface WeClappUser {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  status: string
  active?: boolean
}

interface InviteDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function InviteDialog({ onClose, onSuccess }: InviteDialogProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteMode, setInviteMode] = useState<'new' | 'weclapp'>('new') // new: normaler Benutzer, weclapp: aus WeClapp auswählen
  const [weClappUsers, setWeClappUsers] = useState<WeClappUser[]>([])
  const [allWeClappUsers, setAllWeClappUsers] = useState<WeClappUser[]>([])
  const [loadingWeClappUsers, setLoadingWeClappUsers] = useState(false)
  const [selectedWeClappUser, setSelectedWeClappUser] = useState<WeClappUser | null>(null)
  const [weClappSearch, setWeClappSearch] = useState('')
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false)

  // WeClapp Benutzer suchen (nur beim ersten Buchstaben)
  const searchWeClappUsers = async (searchText: string) => {
    if (!searchText || searchText.trim().length < 1) {
      setWeClappUsers([])
      setAllWeClappUsers([])
      setHasSearchedOnce(false)
      return
    }

    // Nur beim ersten Buchstaben API aufrufen
    if (!hasSearchedOnce) {
      setLoadingWeClappUsers(true)
      try {
        const response = await fetch(`/api/weclapp/users?search=${encodeURIComponent(searchText.trim())}`)
        const data = await response.json()

        if (response.ok && data.users) {
          setAllWeClappUsers(data.users)
          
          // Direkt "beginnt mit" filtern
          const searchLower = searchText.toLowerCase()
          const filtered = data.users.filter((user: WeClappUser) => 
            user.firstName.toLowerCase().startsWith(searchLower) ||
            user.lastName.toLowerCase().startsWith(searchLower) ||
            user.email.toLowerCase().startsWith(searchLower)
          )
          
          setWeClappUsers(filtered)
          setHasSearchedOnce(true)
        } else {
          setAllWeClappUsers([])
          setWeClappUsers([])
        }
      } catch (error) {
        console.error('WeClapp Suche fehlgeschlagen:', error)
        setAllWeClappUsers([])
        setWeClappUsers([])
      } finally {
        setLoadingWeClappUsers(false)
      }
    } else {
      // Clientseitige Filterung für weitere Buchstaben - "beginnt mit" statt "enthält"
      const searchLower = searchText.toLowerCase()
      const filtered = allWeClappUsers.filter((user: WeClappUser) => 
        user.firstName.toLowerCase().startsWith(searchLower) ||
        user.lastName.toLowerCase().startsWith(searchLower) ||
        user.email.toLowerCase().startsWith(searchLower)
      )
      setWeClappUsers(filtered)
    }
  }

  // Automatische Suche bei Eingabe
  useEffect(() => {
    if (inviteMode === 'weclapp') {
      searchWeClappUsers(weClappSearch)
    }
  }, [weClappSearch, inviteMode])

  // WeClapp Benutzer auswählen
  const selectWeClappUser = (user: WeClappUser) => {
    setSelectedWeClappUser(user)
    setEmail(user.email)
    setFirstName(user.firstName)
    setLastName(user.lastName)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !role) {
      toast.error('E-Mail und Rolle sind erforderlich')
      return
    }

    if (inviteMode === 'new' && (!firstName || !lastName)) {
      toast.error('Vorname und Nachname sind erforderlich')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName: inviteMode === 'new' ? firstName : selectedWeClappUser?.firstName,
          lastName: inviteMode === 'new' ? lastName : selectedWeClappUser?.lastName,
          role,
          department: department || null,
          useWeClapp: inviteMode === 'weclapp' && selectedWeClappUser !== null,
          weClappUserId: inviteMode === 'weclapp' ? selectedWeClappUser?.id : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        const successMessage = inviteMode === 'weclapp' && selectedWeClappUser
          ? `Einladung an ${selectedWeClappUser.firstName} ${selectedWeClappUser.lastName} (${email}) gesendet! WeClapp wird automatisch verknüpft.`
          : `Einladung an ${firstName} ${lastName} (${email}) gesendet!`
        
        toast.success(successMessage)
        resetForm()
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Einladung konnte nicht gesendet werden')
      }
    } catch (error) {
      console.error('Einladungs-Fehler:', error)
      toast.error('Einladung konnte nicht gesendet werden')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setFirstName('')
    setLastName('')
    setRole('')
    setDepartment('')
    setSelectedWeClappUser(null)
    setWeClappUsers([])
    setAllWeClappUsers([])
    setWeClappSearch('')
    setHasSearchedOnce(false)
    setInviteMode('new')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Benutzer einladen</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Einladungsart auswählen */}
          <div>
            <Label className="text-base font-medium">Wie möchten Sie den Benutzer einladen?</Label>
            <div className="space-y-3 mt-3">
              <div className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setInviteMode('new')}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="inviteMode"
                    checked={inviteMode === 'new'}
                    onChange={() => setInviteMode('new')}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">Neuer Benutzer einladen</h4>
                    <p className="text-sm text-muted-foreground">Manuelle Einladung mit Vor- und Nachname</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setInviteMode('weclapp')}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="inviteMode"
                    checked={inviteMode === 'weclapp'}
                    onChange={() => setInviteMode('weclapp')}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">WeClapp Benutzer einladen</h4>
                    <p className="text-sm text-muted-foreground">Aus WeClapp auswählen und direkt verbinden</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Neuer Benutzer - Formularfelder */}
          {inviteMode === 'new' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Vorname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Nachname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="benutzer@beispiel.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* WeClapp Benutzer - Dropdown-Auswahl */}
          {inviteMode === 'weclapp' && (
            <div>
              <Label>WeClapp Benutzer auswählen</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Mindestens 1 Buchstabe eingeben..."
                  value={weClappSearch}
                  onChange={(e) => setWeClappSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Suchergebnisse */}
              <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg">
                {weClappSearch.trim().length < 1 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Bitte mindestens 1 Buchstabe eingeben...</p>
                  </div>
                ) : loadingWeClappUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Lade WeClapp Benutzer...</span>
                  </div>
                ) : weClappUsers.length > 0 ? (
                  <>
                    {hasSearchedOnce && (
                      <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                        {allWeClappUsers.length} aktive Benutzer gefunden
                      </div>
                    )}
                    {weClappUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 cursor-pointer transition-colors border-b last:border-b-0 ${
                          selectedWeClappUser?.id === user.id 
                            ? 'bg-blue-50 hover:bg-blue-100' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => selectWeClappUser(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                              Aktiv
                            </span>
                            {selectedWeClappUser?.id === user.id && (
                              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : hasSearchedOnce ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Keine Treffer für "{weClappSearch}"
                    </p>
                    <p className="text-xs mt-1">Versuche einen anderen Buchstaben</p>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Keine aktiven Benutzer gefunden
                    </p>
                  </div>
                )}
              </div>

              {/* Ausgewählter Benutzer Info */}
              {selectedWeClappUser && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Link className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-green-800">Ausgewählter WeClapp Benutzer</h4>
                  </div>
                  <div className="text-sm text-green-700">
                    <p><strong>Name:</strong> {selectedWeClappUser.firstName} {selectedWeClappUser.lastName}</p>
                    <p><strong>E-Mail:</strong> {selectedWeClappUser.email}</p>
                    <p className="text-xs mt-1">Daten werden direkt übernommen und mit WeClapp verbunden.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gemeinsame Felder */}
          <div>
            <Label htmlFor="role">Rolle</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger className="pl-9">
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Benutzer</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="department">Abteilung (optional)</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="department"
                type="text"
                placeholder="z.B. Marketing, IT, Vertrieb"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || (inviteMode === 'weclapp' && !selectedWeClappUser)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Einladung senden
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
