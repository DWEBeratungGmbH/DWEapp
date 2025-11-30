// WeClapp Bestätigungs-Dialog
// Zeigt gefundenen WeClapp-Benutzer zur Bestätigung

'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { CheckCircle2, XCircle } from 'lucide-react'

interface WeClappConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  foundUser: any | null
  userEmail: string
  onConfirm: () => void
}

export function WeClappConfirmDialog({
  open,
  onOpenChange,
  foundUser,
  userEmail,
  onConfirm
}: WeClappConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>WeClapp Verknüpfung</DialogTitle>
          <DialogDescription>
            {foundUser
              ? `Benutzer "${foundUser.firstName} ${foundUser.lastName}" wurde in WeClapp gefunden.`
              : `Kein Benutzer mit der E-Mail "${userEmail}" in WeClapp gefunden.`}
          </DialogDescription>
        </DialogHeader>

        {foundUser ? (
          <div className="space-y-4">
            {/* Gefundener Benutzer */}
            <div className="p-4 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-[var(--accent)]" />
                <div>
                  <p className="font-medium">{foundUser.firstName} {foundUser.lastName}</p>
                  <p className="text-sm text-secondary">{foundUser.email}</p>
                  <p className="text-xs text-muted">WeClapp ID: {foundUser.id}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button onClick={onConfirm}>
                Verknüpfen
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Nicht gefunden */}
            <div className="p-4 rounded-lg bg-[rgba(220,38,38,0.1)] border border-[var(--error)]">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-[var(--error)]" />
                <div>
                  <p className="font-medium">Kein Benutzer gefunden</p>
                  <p className="text-sm text-secondary">
                    In WeClapp existiert kein Benutzer mit dieser E-Mail.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>
                Schließen
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
