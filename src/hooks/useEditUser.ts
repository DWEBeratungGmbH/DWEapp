// Custom Hook für Benutzer-Bearbeitung
// Enthält alle State- und API-Logik für den EditUserDialog

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'

export interface UserData {
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

export interface FormData {
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  isActive: boolean
  weClappUserId: string
}

export interface DataComparison {
  dweapp: { firstName: string; lastName: string; email: string }
  weclapp: { firstName: string; lastName: string; email: string }
  differences: { firstName: boolean; lastName: boolean; email: boolean }
}

interface UseEditUserProps {
  user: UserData | null
  onSuccess: () => void
  onClose: () => void
}

export function useEditUser({ user, onSuccess, onClose }: UseEditUserProps) {
  // Loading States
  const [loading, setLoading] = useState(false)
  const [searchingWeClapp, setSearchingWeClapp] = useState(false)
  const [syncingWithWeClapp, setSyncingWithWeClapp] = useState(false)

  // Dialog States
  const [showWeClappConfirmDialog, setShowWeClappConfirmDialog] = useState(false)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [showDataCompareDialog, setShowDataCompareDialog] = useState(false)

  // Data States
  const [foundWeClappUser, setFoundWeClappUser] = useState<any | null>(null)
  const [dataComparison, setDataComparison] = useState<DataComparison | null>(null)
  const [originalWeClappData, setOriginalWeClappData] = useState<any>(null)

  // Form State
  const [formData, setFormData] = useState<FormData>({
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

  // Form Input Handler
  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // WeClapp Suche
  const searchWeClappUserByEmail = async () => {
    if (!user?.email) {
      toast.error('Keine E-Mail Adresse vorhanden')
      return
    }

    setSearchingWeClapp(true)
    try {
      const response = await fetch(`/api/weclapp/users?search=${encodeURIComponent(user.email)}`)
      const data = await response.json()

      if (data.success && data.users.length > 0) {
        setFoundWeClappUser(data.users[0])
      } else {
        setFoundWeClappUser(null)
      }
      setShowWeClappConfirmDialog(true)
    } catch (error) {
      console.error('WeClapp Suche fehlgeschlagen:', error)
      toast.error('Fehler bei der WeClapp Suche')
    } finally {
      setSearchingWeClapp(false)
    }
  }

  // WeClapp Verknüpfung bestätigen
  const confirmWeClappLink = () => {
    if (!foundWeClappUser) return

    const comparison: DataComparison = {
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

    const hasDifferences = Object.values(comparison.differences).some(diff => diff)

    if (hasDifferences) {
      setDataComparison(comparison)
      setShowDataCompareDialog(true)
      setShowWeClappConfirmDialog(false)
    } else {
      // Direkt verbinden bei identischen Daten
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

  // WeClapp Verknüpfung trennen
  const unlinkWeClappUser = () => {
    setFormData(prev => ({ ...prev, weClappUserId: '' }))
    toast.success('WeClapp Verknüpfung entfernt')
  }

  // Mit WeClapp synchronisieren
  const syncWeClappUserData = async (userData: any) => {
    if (!formData.weClappUserId) return

    try {
      const response = await fetch('/api/weclapp/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        toast.success('Daten wurden mit WeClapp synchronisiert')
      } else {
        toast.error('Fehler bei der WeClapp Synchronisation')
      }
    } catch (error) {
      console.error('WeClapp Sync Fehler:', error)
      toast.error('Fehler bei der WeClapp Synchronisation')
    }
  }

  // Benutzer speichern
  const saveUserData = async (): Promise<boolean> => {
    if (!user) return false

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Benutzer erfolgreich aktualisiert')
        onSuccess()
        onClose()
        return true
      } else {
        toast.error(data.error || 'Fehler beim Speichern')
        return false
      }
    } catch (error) {
      console.error('Speichern fehlgeschlagen:', error)
      toast.error('Fehler beim Speichern')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Formular absenden mit Sync-Check
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Prüfe ob WeClapp verknüpft und Daten geändert
    if (formData.weClappUserId && originalWeClappData) {
      const hasChanges =
        formData.firstName !== originalWeClappData.firstName ||
        formData.lastName !== originalWeClappData.lastName ||
        formData.email !== originalWeClappData.email

      if (hasChanges) {
        const comparison: DataComparison = {
          dweapp: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email
          },
          weclapp: {
            firstName: originalWeClappData.firstName,
            lastName: originalWeClappData.lastName,
            email: originalWeClappData.email
          },
          differences: {
            firstName: formData.firstName !== originalWeClappData.firstName,
            lastName: formData.lastName !== originalWeClappData.lastName,
            email: formData.email !== originalWeClappData.email
          }
        }
        setDataComparison(comparison)
        setShowSyncDialog(true)
        return
      }
    }

    await saveUserData()
  }

  // Sync-Aktion verarbeiten
  const handleSyncAction = async (action: 'sync' | 'ignore' | 'unlink') => {
    setShowSyncDialog(false)
    setSyncingWithWeClapp(true)

    try {
      switch (action) {
        case 'sync':
          await syncWeClappUserData(formData)
          await saveUserData()
          break
        case 'ignore':
          await saveUserData()
          break
        case 'unlink':
          setFormData(prev => ({ ...prev, weClappUserId: '' }))
          setOriginalWeClappData(null)
          await saveUserData()
          break
      }
    } finally {
      setSyncingWithWeClapp(false)
    }
  }

  // Datenvergleich-Aktion
  const handleDataCompareAction = (useWeClappData: boolean) => {
    if (useWeClappData && foundWeClappUser) {
      setFormData(prev => ({
        ...prev,
        weClappUserId: foundWeClappUser.id,
        firstName: foundWeClappUser.firstName,
        lastName: foundWeClappUser.lastName
      }))
    } else if (foundWeClappUser) {
      setFormData(prev => ({
        ...prev,
        weClappUserId: foundWeClappUser.id
      }))
    }
    toast.success('WeClapp Benutzer verknüpft')
    setShowDataCompareDialog(false)
    setFoundWeClappUser(null)
  }

  return {
    // Form
    formData,
    handleInputChange,
    handleSubmit,

    // Loading States
    loading,
    searchingWeClapp,
    syncingWithWeClapp,

    // WeClapp Actions
    searchWeClappUserByEmail,
    confirmWeClappLink,
    unlinkWeClappUser,

    // Dialogs
    showWeClappConfirmDialog,
    setShowWeClappConfirmDialog,
    showSyncDialog,
    setShowSyncDialog,
    showDataCompareDialog,
    setShowDataCompareDialog,

    // Data
    foundWeClappUser,
    dataComparison,
    originalWeClappData,

    // Actions
    handleSyncAction,
    handleDataCompareAction,
    saveUserData
  }
}
