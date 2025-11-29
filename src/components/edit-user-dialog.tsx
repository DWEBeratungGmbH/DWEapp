'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { Search, Link, Unlink, User, Mail, Building, Shield, CheckCircle2, AlertCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  role: string
  department?: string
  isActive: boolean
  weClappUserId?: string
  createdAt: string
  updatedAt: string
  emailVerified?: boolean
}

interface EditUserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EditUserDialog({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [searchingWeClapp, setSearchingWeClapp] = useState(false)
  const [showWeClappConfirmDialog, setShowWeClappConfirmDialog] = useState(false)
  const [foundWeClappUser, setFoundWeClappUser] = useState<any | null>(null)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [syncingWithWeClapp, setSyncingWithWeClapp] = useState(false)
  const [showDataCompareDialog, setShowDataCompareDialog] = useState(false)
  const [dataComparison, setDataComparison] = useState<any>(null)
  const [originalWeClappData, setOriginalWeClappData] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER',
    department: '',
    isActive: true,
    weClappUserId: ''
  })

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        role: user.role,
        department: user.department || '',
        isActive: user.isActive,
        weClappUserId: user.weClappUserId || ''
      })

      // Lade originale WeClapp Daten wenn verknüpft
      if (user.weClappUserId) {
        loadOriginalWeClappData(user.weClappUserId)
      } else {
        setOriginalWeClappData(null)
      }
    }
  }, [user])

  // Lade originale WeClapp Daten für Vergleich
  const loadOriginalWeClappData = async (weClappUserId: string) => {
    try {
      const response = await fetch(`/api/weclapp/users?search=${encodeURIComponent(weClappUserId)}`)
      const data = await response.json()
      
      if (data.success && data.users.length > 0) {
        const weClappUser = data.users.find((u: any) => u.id === weClappUserId)
        if (weClappUser) {
          setOriginalWeClappData({
            firstName: weClappUser.firstName,
            lastName: weClappUser.lastName,
            email: weClappUser.email
          })
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der WeClapp Daten:', error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const searchWeClappUserByEmail = async () => {
    if (!user?.email) {
      toast.error('Keine E-Mail Adresse vorhanden')
      return
    }

    setSearchingWeClapp(true)
    try {
      console.log('Suche WeClapp Benutzer für E-Mail:', user.email)
      const response = await fetch(`/api/weclapp/users?search=${encodeURIComponent(user.email)}`)
      const data = await response.json()
      
      console.log('WeClapp API Response:', data)
      
      if (data.success && data.users.length > 0) {
        // Nimm den ersten gefundenen Benutzer
        const foundUser = data.users[0]
        console.log('Gefundenen Benutzer:', foundUser)
        setFoundWeClappUser(foundUser)
        setShowWeClappConfirmDialog(true)
      } else {
        console.log('Keinen Benutzer gefunden für E-Mail:', user.email)
        setFoundWeClappUser(null)
        setShowWeClappConfirmDialog(true)
      }
    } catch (error) {
      console.error('WeClapp search error:', error)
      toast.error('Fehler bei der WeClapp Suche')
    } finally {
      setSearchingWeClapp(false)
    }
  }

  const confirmWeClappLink = async () => {
    if (foundWeClappUser) {
      // Vergleiche DWEapp und WeClapp Daten vor dem Verbinden
      const comparison = {
        dweapp: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        },
        weclapp: {
          firstName: foundWeClappUser.firstName,
          lastName: foundWeClappUser.lastName,
          email: foundWeClappUser.email
        },
        differences: {
          firstName: formData.firstName !== foundWeClappUser.firstName,
          lastName: formData.lastName !== foundWeClappUser.lastName,
          email: formData.email !== foundWeClappUser.email
        }
      }
      
      // Prüfe ob es Unterschiede gibt
      const hasDifferences = Object.values(comparison.differences).some(diff => diff)
      
      if (hasDifferences) {
        // Bei Unterschieden: Zeige Vergleichs-Dialog
        setDataComparison(comparison)
        setShowDataCompareDialog(true)
        setShowWeClappConfirmDialog(false)
      } else {
        // Bei identischen Daten: Direkt verbinden
        setFormData(prev => ({
          ...prev,
          weClappUserId: foundWeClappUser.id,
          firstName: foundWeClappUser.firstName || prev.firstName,
          lastName: foundWeClappUser.lastName || prev.lastName
        }))
        toast.success('WeClapp Benutzer verknüpft')
        setShowWeClappConfirmDialog(false)
        setFoundWeClappUser(null)
      }
    }
  }

  const unlinkWeClappUser = () => {
    setFormData(prev => ({
      ...prev,
      weClappUserId: ''
    }))
    toast.success('WeClapp Verknüpfung entfernt')
  }

  const syncWeClappUserData = async (userData: any) => {
    if (!formData.weClappUserId) {
      console.log('Keine WeClapp ID vorhanden, überspringe Synchronisation')
      return
    }

    try {
      console.log('Synchronisiere Benutzerdaten mit WeClapp:', userData)
      
      const response = await fetch('/api/weclapp/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weClappUserId: formData.weClappUserId,
          userData: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email
          }
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('WeClapp Synchronisation erfolgreich:', data)
        toast.success('Daten wurden mit WeClapp synchronisiert')
      } else {
        console.error('WeClapp Synchronisation fehlgeschlagen:', data)
        toast.error('Fehler bei der WeClapp Synchronisation')
      }
    } catch (error) {
      console.error('WeClapp sync error:', error)
      toast.error('Fehler bei der WeClapp Synchronisation')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Prüfe ob WeClapp verknüpft und ob sich Daten geändert haben
    if (formData.weClappUserId && originalWeClappData) {
      const hasChanges = 
        formData.firstName !== originalWeClappData.firstName ||
        formData.lastName !== originalWeClappData.lastName ||
        formData.email !== originalWeClappData.email

      if (hasChanges) {
        // Zeige Synchronisations-Dialog für geänderte Daten
        const comparison = {
          dweapp: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email
          },
          weclapp: originalWeClappData,
          differences: {
            firstName: formData.firstName !== originalWeClappData.firstName,
            lastName: formData.lastName !== originalWeClappData.lastName,
            email: formData.email !== originalWeClappData.email
          }
        }
        
        setDataComparison(comparison)
        setShowSyncDialog(true)
        return // Nicht speichern, erst Benutzer-Entscheidung abwarten
      }
    }

    // Normal speichern wenn keine WeClapp-Änderungen
    await saveUserData()
  }

  const saveUserData = async (currentUser: any = user) => {
    setLoading(true)
    try {
      // DWEapp Daten speichern (inklusive WeClapp Verknüpfung falls vorhanden)
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Benutzer erfolgreich aktualisiert')
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Benutzer konnte nicht aktualisiert werden')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Fehler beim Aktualisieren des Benutzers')
    } finally {
      setLoading(false)
    }
  }

  const performWeClappSync = async () => {
    setSyncingWithWeClapp(true)
    try {
      await syncWeClappUserData(formData)
      onSuccess()
      onOpenChange(false)
    } finally {
      setSyncingWithWeClapp(false)
      setShowSyncDialog(false)
    }
  }

  const compareDataBeforeSync = async () => {
    if (!formData.weClappUserId) return

    try {
      // Hole aktuelle WeClapp Daten zum Vergleich
      console.log('Hole aktuelle WeClapp Daten für Vergleich...')
      const response = await fetch(`/api/weclapp/users?search=${encodeURIComponent(formData.email)}`)
      const data = await response.json()
      
      if (data.success && data.users.length > 0) {
        const weClappUser = data.users[0]
        
        // Vergleiche DWEapp und WeClapp Daten
        const comparison = {
          dweapp: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email
          },
          weclapp: {
            firstName: weClappUser.firstName,
            lastName: weClappUser.lastName,
            email: weClappUser.email
          },
          differences: {
            firstName: formData.firstName !== weClappUser.firstName,
            lastName: formData.lastName !== weClappUser.lastName,
            email: formData.email !== weClappUser.email
          }
        }
        
        setDataComparison(comparison)
        setShowDataCompareDialog(true)
        setShowSyncDialog(false)
      } else {
        // Keine Unterschiede gefunden oder Fehler, direkt synchronisieren
        await performWeClappSync()
      }
    } catch (error) {
      console.error('Fehler beim Datenvergleich:', error)
      // Bei Fehler direkt synchronisieren
      await performWeClappSync()
    }
  }

  const syncWithSelectedData = async (useWeClappData: boolean) => {
    if (foundWeClappUser && dataComparison) {
      if (useWeClappData) {
        // Überschreibe DWEapp Daten mit WeClapp Daten
        setFormData(prev => ({
          ...prev,
          weClappUserId: foundWeClappUser.id,
          firstName: dataComparison.weclapp.firstName,
          lastName: dataComparison.weclapp.lastName,
          email: dataComparison.weclapp.email
        }))
        // Speichere originale WeClapp Daten für zukünftige Vergleiche
        setOriginalWeClappData(dataComparison.weclapp)
      } else {
        // Behalte DWEapp Daten, verknüpfe nur mit WeClapp
        setFormData(prev => ({
          ...prev,
          weClappUserId: foundWeClappUser.id
        }))
        // Speichere originale WeClapp Daten für zukünftige Vergleiche
        setOriginalWeClappData(dataComparison.weclapp)
      }
      
      toast.success('WeClapp Benutzer verknüpft')
      setShowDataCompareDialog(false)
      setFoundWeClappUser(null)
      setDataComparison(null)
    }
  }

  const cancelDataComparison = () => {
    // Bei Abbruch: Nichts speichern, nur Dialoge schließen
    setShowDataCompareDialog(false)
    setShowWeClappConfirmDialog(false)
    setFoundWeClappUser(null)
    setDataComparison(null)
    // Keine WeClapp Verknüpfung, keine Datenänderung
  }

  const handleSyncOption = async (option: 'sync' | 'ignore' | 'unlink') => {
    setShowSyncDialog(false)
    
    switch (option) {
      case 'sync':
        // Daten mit WeClapp synchronisieren
        await syncWeClappUserData(formData)
        await saveUserData()
        break
      case 'ignore':
        // Nur DWEapp speichern, WeClapp nicht aktualisieren
        await saveUserData()
        break
      case 'unlink':
        // WeClapp Verknüpfung lösen und speichern
        setFormData(prev => ({ ...prev, weClappUserId: '' }))
        setOriginalWeClappData(null)
        await saveUserData()
        break
    }
  }

  if (!user) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Benutzer bearbeiten: {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
            </DialogTitle>
            <DialogDescription>
              Hier können Sie die Benutzerdaten und die WeClapp-Verknüpfung bearbeiten.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* DWEapp spezifische Felder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">DWEapp Benutzerdaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Vorname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Nachname"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="E-Mail"
                    disabled // E-Mail sollte nicht änderbar sein
                  />
                  <p className="text-xs text-muted-foreground mt-1">E-Mail kann nicht geändert werden</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Rolle</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Benutzer</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="ADMIN">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Abteilung</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="Abteilung"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Benutzer ist aktiv</Label>
                </div>
              </CardContent>
            </Card>

            {/* WeClapp Verknüpfung */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  WeClapp Verknüpfung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.weClappUserId ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">Mit WeClapp verknüpft</p>
                          <p className="text-sm text-green-600">WeClapp ID: {formData.weClappUserId}</p>
                          <p className="text-xs text-green-500">Daten werden automatisch synchronisiert</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={unlinkWeClappUser}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        Trennen
                      </Button>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Link className="h-4 w-4 text-blue-600" />
                        <p className="text-sm text-blue-700">
                          <strong>Automatische Synchronisation:</strong> Änderungen an Name und E-Mail werden automatisch an WeClapp übertragen.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-orange-800">Nicht mit WeClapp verknüpft</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">WeClapp Verknüpfung herstellen</p>
                        <p className="text-sm text-blue-600">
                          Automatische Suche nach Benutzer mit E-Mail: {user.email}
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={searchWeClappUserByEmail}
                        disabled={searchingWeClapp}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {searchingWeClapp ? 'Suche...' : 'Mit WeClapp verbinden'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Wird gespeichert...' : 'Speichern'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* WeClapp Bestätigungs-Dialog */}
      <Dialog open={showWeClappConfirmDialog} onOpenChange={setShowWeClappConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>WeClapp Verknüpfung</DialogTitle>
            <DialogDescription>
              {foundWeClappUser 
                ? `Benutzer "${foundWeClappUser.firstName} ${foundWeClappUser.lastName}" wurde in WeClapp gefunden.`
                : `Kein Benutzer mit der E-Mail "${user?.email}" in WeClapp gefunden.`}
            </DialogDescription>
          </DialogHeader>

          {foundWeClappUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">
                      {foundWeClappUser.firstName} {foundWeClappUser.lastName}
                    </p>
                    <p className="text-sm text-green-600">{foundWeClappUser.email}</p>
                    <p className="text-xs text-green-500">WeClapp ID: {foundWeClappUser.id}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWeClappConfirmDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={confirmWeClappLink}>
                  <Link className="h-4 w-4 mr-2" />
                  Verbinden
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800">
                    Es wurde kein passender WeClapp-Benutzer für diese E-Mail-Adresse gefunden.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowWeClappConfirmDialog(false)}>
                  OK
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WeClapp Synchronisations-Dialog für geänderte Daten */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              WeClapp Synchronisation erforderlich
            </DialogTitle>
            <DialogDescription>
              Die DWEapp Daten wurden geändert. Wie möchten Sie mit der WeClapp Synchronisation umgehen?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Vergleichstabelle */}
            {dataComparison && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-900">Feld</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-600">DWEapp</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-green-600">WeClapp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dataComparison.differences.firstName && (
                      <tr className="bg-orange-50">
                        <td className="px-3 py-2 text-xs font-medium">Vorname</td>
                        <td className="px-3 py-2 text-xs">{dataComparison.dweapp.firstName}</td>
                        <td className="px-3 py-2 text-xs">{dataComparison.weclapp.firstName}</td>
                      </tr>
                    )}
                    {dataComparison.differences.lastName && (
                      <tr className="bg-orange-50">
                        <td className="px-3 py-2 text-xs font-medium">Nachname</td>
                        <td className="px-3 py-2 text-xs">{dataComparison.dweapp.lastName}</td>
                        <td className="px-3 py-2 text-xs">{dataComparison.weclapp.lastName}</td>
                      </tr>
                    )}
                    {dataComparison.differences.email && (
                      <tr className="bg-orange-50">
                        <td className="px-3 py-2 text-xs font-medium">E-Mail</td>
                        <td className="px-3 py-2 text-xs">{dataComparison.dweapp.email}</td>
                        <td className="px-3 py-2 text-xs">{dataComparison.weclapp.email}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <DialogFooter className="flex-col gap-2">
              <Button 
                onClick={() => handleSyncOption('sync')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Link className="h-4 w-4 mr-2" />
                In WeClapp ändern
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleSyncOption('ignore')}
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Nur DWEapp speichern
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleSyncOption('unlink')}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <Unlink className="h-4 w-4 mr-2" />
                Verbindung lösen
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Daten-Vergleichs-Dialog */}
      <Dialog open={showDataCompareDialog} onOpenChange={setShowDataCompareDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Daten-Abgleich: DWEapp vs WeClapp
            </DialogTitle>
            <DialogDescription>
              Es wurden Unterschiede zwischen den DWEapp und WeClapp Daten festgestellt. Bitte wählen Sie welche Daten behalten werden sollen.
            </DialogDescription>
          </DialogHeader>

          {dataComparison && (
            <div className="space-y-4">
              {/* Vergleichstabelle */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Feld</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-blue-600">DWEapp</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-green-600">WeClapp</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className={dataComparison.differences.firstName ? 'bg-orange-50' : ''}>
                      <td className="px-4 py-2 text-sm font-medium">Vorname</td>
                      <td className="px-4 py-2 text-sm">{dataComparison.dweapp.firstName}</td>
                      <td className="px-4 py-2 text-sm">{dataComparison.weclapp.firstName}</td>
                      <td className="px-4 py-2 text-center">
                        {dataComparison.differences.firstName ? (
                          <Badge variant="destructive" className="text-xs">Unterschiedlich</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Identisch</Badge>
                        )}
                      </td>
                    </tr>
                    <tr className={dataComparison.differences.lastName ? 'bg-orange-50' : ''}>
                      <td className="px-4 py-2 text-sm font-medium">Nachname</td>
                      <td className="px-4 py-2 text-sm">{dataComparison.dweapp.lastName}</td>
                      <td className="px-4 py-2 text-sm">{dataComparison.weclapp.lastName}</td>
                      <td className="px-4 py-2 text-center">
                        {dataComparison.differences.lastName ? (
                          <Badge variant="destructive" className="text-xs">Unterschiedlich</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Identisch</Badge>
                        )}
                      </td>
                    </tr>
                    <tr className={dataComparison.differences.email ? 'bg-orange-50' : ''}>
                      <td className="px-4 py-2 text-sm font-medium">E-Mail</td>
                      <td className="px-4 py-2 text-sm">{dataComparison.dweapp.email}</td>
                      <td className="px-4 py-2 text-sm">{dataComparison.weclapp.email}</td>
                      <td className="px-4 py-2 text-center">
                        {dataComparison.differences.email ? (
                          <Badge variant="destructive" className="text-xs">Unterschiedlich</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Identisch</Badge>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Warnung und Optionen */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium mb-2">Daten-Überschreibung warnung:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>DWEapp behalten:</strong> WeClapp Daten werden mit DWEapp überschrieben</li>
                      <li><strong>WeClapp übernehmen:</strong> DWEapp Daten werden mit WeClapp überschrieben</li>
                      <li>Wählen Sie welche Datenquelle als "Wahrheit" gelten soll</li>
                    </ul>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => syncWithSelectedData(false)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <User className="h-4 w-4 mr-2" />
                  DWEapp Daten behalten
                </Button>
                <Button 
                  variant="outline" 
                  onClick={cancelDataComparison}
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={() => syncWithSelectedData(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Link className="h-4 w-4 mr-2" />
                  WeClapp Daten übernehmen
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
