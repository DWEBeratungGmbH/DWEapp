// Einladungs-Dialog
// Schlanker Wrapper für alle Invite-Komponenten

'use client'

import { UserPlus, Mail, Building, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInviteDialog } from '@/hooks/useInviteDialog'
import { InviteModeSelector } from './InviteModeSelector'
import { WeClappUserSearch } from './WeClappUserSearch'

interface InviteDialogProps {
  onClose: () => void
  onSuccess: () => void
}

export function InviteDialog({ onClose, onSuccess }: InviteDialogProps) {
  const {
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
    loading,
    canSubmit
  } = useInviteDialog({ onSuccess, onClose })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">Benutzer einladen</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Modus-Auswahl */}
          <InviteModeSelector mode={inviteMode} onModeChange={setInviteMode} />

          {/* Neuer Benutzer - Formular */}
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
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted" />
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

          {/* WeClapp Benutzer-Suche */}
          {inviteMode === 'weclapp' && (
            <WeClappUserSearch
              searchValue={weClappSearch}
              onSearchChange={setWeClappSearch}
              users={weClappUsers}
              allUsersCount={allWeClappUsers.length}
              loading={loadingWeClappUsers}
              selectedUser={selectedWeClappUser}
              onSelectUser={selectWeClappUser}
              hasSearchedOnce={hasSearchedOnce}
            />
          )}

          {/* Gemeinsame Felder: Rolle */}
          <div>
            <Label htmlFor="role">Rolle</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted" />
              <Select value={role} onValueChange={setRole}>
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

          {/* Abteilung */}
          <div>
            <Label htmlFor="department">Abteilung (optional)</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted" />
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
              disabled={loading || !canSubmit}
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
