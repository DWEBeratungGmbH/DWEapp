// Benutzer-Bearbeiten Dialog
// Schlanker Wrapper, der alle Sub-Komponenten zusammenführt

'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { User } from 'lucide-react'

import { useEditUser, type UserData } from '@/hooks/useEditUser'
import { UserFormFields } from './UserFormFields'
import { WeClappLinkSection } from './WeClappLinkSection'
import { WeClappConfirmDialog } from './WeClappConfirmDialog'
import { DataCompareDialog } from './DataCompareDialog'
import { SyncConfirmDialog } from './SyncConfirmDialog'

interface EditUserDialogProps {
  user: UserData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function EditUserDialog({ 
  user, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditUserDialogProps) {
  const {
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

    // Actions
    handleSyncAction,
    handleDataCompareAction
  } = useEditUser({
    user,
    onSuccess,
    onClose: () => onOpenChange(false)
  })

  if (!user) return null

  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.email

  return (
    <>
      {/* Haupt-Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Benutzer bearbeiten: {userName}
            </DialogTitle>
            <DialogDescription>
              Hier kannst du die Benutzerdaten und die WeClapp-Verknüpfung bearbeiten.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Benutzer-Formular */}
            <UserFormFields 
              formData={formData}
              onInputChange={handleInputChange}
            />

            {/* WeClapp Verknüpfung */}
            <WeClappLinkSection
              weClappUserId={formData.weClappUserId}
              userEmail={user.email}
              isSearching={searchingWeClapp}
              onSearch={searchWeClappUserByEmail}
              onUnlink={unlinkWeClappUser}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Wird gespeichert...' : 'Speichern'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sub-Dialoge */}
      <WeClappConfirmDialog
        open={showWeClappConfirmDialog}
        onOpenChange={setShowWeClappConfirmDialog}
        foundUser={foundWeClappUser}
        userEmail={user.email}
        onConfirm={confirmWeClappLink}
      />

      <DataCompareDialog
        open={showDataCompareDialog}
        onOpenChange={setShowDataCompareDialog}
        comparison={dataComparison}
        onUseWeClappData={() => handleDataCompareAction(true)}
        onUseDWEappData={() => handleDataCompareAction(false)}
      />

      <SyncConfirmDialog
        open={showSyncDialog}
        onOpenChange={setShowSyncDialog}
        comparison={dataComparison}
        isSyncing={syncingWithWeClapp}
        onSync={() => handleSyncAction('sync')}
        onIgnore={() => handleSyncAction('ignore')}
        onUnlink={() => handleSyncAction('unlink')}
      />
    </>
  )
}
