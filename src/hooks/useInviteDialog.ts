// Einladungs-Dialog Hook
// Enthält alle State- und API-Logik

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'

export interface WeClappUserInvite {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  status: string
  active?: boolean
}

export type InviteMode = 'new' | 'weclapp'

interface UseInviteDialogProps {
  onSuccess: () => void
  onClose: () => void
}

export function useInviteDialog({ onSuccess, onClose }: UseInviteDialogProps) {
  // Form State
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)

  // Mode State
  const [inviteMode, setInviteMode] = useState<InviteMode>('new')

  // WeClapp State
  const [weClappUsers, setWeClappUsers] = useState<WeClappUserInvite[]>([])
  const [allWeClappUsers, setAllWeClappUsers] = useState<WeClappUserInvite[]>([])
  const allWeClappUsersRef = useRef<WeClappUserInvite[]>([])
  const [loadingWeClappUsers, setLoadingWeClappUsers] = useState(false)
  const [selectedWeClappUser, setSelectedWeClappUser] = useState<WeClappUserInvite | null>(null)
  const [weClappSearch, setWeClappSearch] = useState('')
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false)

  // WeClapp Benutzer suchen
  const searchWeClappUsers = useCallback(async (searchText: string) => {
    if (!searchText || searchText.trim().length < 1) {
      setWeClappUsers([])
      setAllWeClappUsers([])
      allWeClappUsersRef.current = []
      setHasSearchedOnce(false)
      return
    }

    if (!hasSearchedOnce) {
      setLoadingWeClappUsers(true)
      try {
        const response = await fetch(`/api/weclapp/users?search=${encodeURIComponent(searchText.trim())}`)
        const data = await response.json()

        if (response.ok && data.users) {
          setAllWeClappUsers(data.users)
          allWeClappUsersRef.current = data.users

          const searchLower = searchText.toLowerCase()
          const filtered = data.users.filter((user: WeClappUserInvite) =>
            user.firstName.toLowerCase().startsWith(searchLower) ||
            user.lastName.toLowerCase().startsWith(searchLower) ||
            user.email.toLowerCase().startsWith(searchLower)
          )

          setWeClappUsers(filtered)
          setHasSearchedOnce(true)
        } else {
          setAllWeClappUsers([])
          allWeClappUsersRef.current = []
          setWeClappUsers([])
        }
      } catch (error) {
        console.error('WeClapp Suche fehlgeschlagen:', error)
        setAllWeClappUsers([])
        allWeClappUsersRef.current = []
        setWeClappUsers([])
      } finally {
        setLoadingWeClappUsers(false)
      }
    } else {
      // Clientseitige Filterung mit ref
      const searchLower = searchText.toLowerCase()
      const filtered = allWeClappUsersRef.current.filter((user: WeClappUserInvite) =>
        user.firstName.toLowerCase().startsWith(searchLower) ||
        user.lastName.toLowerCase().startsWith(searchLower) ||
        user.email.toLowerCase().startsWith(searchLower)
      )
      setWeClappUsers(filtered)
    }
  }, [hasSearchedOnce])

  // Automatische Suche bei Eingabe
  useEffect(() => {
    if (inviteMode === 'weclapp') {
      searchWeClappUsers(weClappSearch)
    }
  }, [weClappSearch, inviteMode, searchWeClappUsers])

  // WeClapp Benutzer auswählen
  const selectWeClappUser = (user: WeClappUserInvite) => {
    setSelectedWeClappUser(user)
    setEmail(user.email)
    setFirstName(user.firstName)
    setLastName(user.lastName)
  }

  // Formular zurücksetzen
  const resetForm = () => {
    setEmail('')
    setFirstName('')
    setLastName('')
    setRole('')
    setDepartment('')
    setSelectedWeClappUser(null)
    setWeClappUsers([])
    setAllWeClappUsers([])
    allWeClappUsersRef.current = []
    setWeClappSearch('')
    setHasSearchedOnce(false)
    setInviteMode('new')
  }

  // Einladung senden
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
        headers: { 'Content-Type': 'application/json' },
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
        const userName = inviteMode === 'weclapp' && selectedWeClappUser
          ? `${selectedWeClappUser.firstName} ${selectedWeClappUser.lastName}`
          : `${firstName} ${lastName}`

        toast.success(`Einladung an ${userName} (${email}) gesendet!`)
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

  // Validierung
  const canSubmit = inviteMode === 'weclapp' 
    ? Boolean(selectedWeClappUser && role)
    : Boolean(email && firstName && lastName && role)

  return {
    // Form
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    role,
    setRole,
    department,
    setDepartment,

    // Mode
    inviteMode,
    setInviteMode,

    // WeClapp
    weClappSearch,
    setWeClappSearch,
    weClappUsers,
    allWeClappUsers,
    loadingWeClappUsers,
    selectedWeClappUser,
    selectWeClappUser,
    hasSearchedOnce,

    // Actions
    handleSubmit,
    resetForm,
    loading,
    canSubmit
  }
}
