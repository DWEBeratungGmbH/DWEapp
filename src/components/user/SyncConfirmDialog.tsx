// Synchronisations-Bestätigungs-Dialog
// Fragt ob Änderungen an WeClapp übertragen werden sollen

'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { RefreshCw, AlertTriangle, Unlink } from 'lucide-react'
import type { DataComparison } from '@/hooks/useEditUser'

interface SyncConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comparison: DataComparison | null
  isSyncing: boolean
  onSync: () => void
  onIgnore: () => void
  onUnlink: () => void
}

export function SyncConfirmDialog({
  open,
  onOpenChange,
  comparison,
  isSyncing,
  onSync,
  onIgnore,
  onUnlink
}: SyncConfirmDialogProps) {
  if (!comparison) return null

  const fields = [
    { key: 'firstName', label: 'Vorname' },
    { key: 'lastName', label: 'Nachname' },
    { key: 'email', label: 'E-Mail' }
  ] as const

  const changedFields = fields.filter(f => comparison.differences[f.key])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
            Änderungen synchronisieren?
          </DialogTitle>
          <DialogDescription>
            Du hast Daten geändert, die mit WeClapp verknüpft sind. 
            Sollen die Änderungen auch an WeClapp übertragen werden?
          </DialogDescription>
        </DialogHeader>

        {/* Geänderte Felder */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Geänderte Felder:</p>
          {changedFields.map(({ key, label }) => (
            <div 
              key={key}
              className="p-2 rounded bg-[var(--bg-tertiary)] text-sm flex justify-between"
            >
              <span>{label}:</span>
              <span className="font-medium">
                {comparison.weclapp[key]} → {comparison.dweapp[key]}
              </span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button 
              onClick={onSync}
              disabled={isSyncing}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Synchronisiere...' : 'An WeClapp übertragen'}
            </Button>
            <Button 
              variant="outline"
              onClick={onIgnore}
              disabled={isSyncing}
              className="flex-1"
            >
              Nur in DWEapp speichern
            </Button>
          </div>
          <Button 
            variant="ghost"
            onClick={onUnlink}
            disabled={isSyncing}
            className="w-full text-[var(--error)]"
          >
            <Unlink className="h-4 w-4 mr-2" />
            Verknüpfung trennen & speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
