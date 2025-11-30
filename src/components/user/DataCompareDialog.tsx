// Datenvergleich-Dialog
// Zeigt Unterschiede zwischen DWEapp und WeClapp Daten

'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ArrowRight } from 'lucide-react'
import type { DataComparison } from '@/hooks/useEditUser'

interface DataCompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comparison: DataComparison | null
  onUseWeClappData: () => void
  onUseDWEappData: () => void
}

export function DataCompareDialog({
  open,
  onOpenChange,
  comparison,
  onUseWeClappData,
  onUseDWEappData
}: DataCompareDialogProps) {
  if (!comparison) return null

  const fields = [
    { key: 'firstName', label: 'Vorname' },
    { key: 'lastName', label: 'Nachname' },
    { key: 'email', label: 'E-Mail' }
  ] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Datenunterschiede erkannt</DialogTitle>
          <DialogDescription>
            Die Daten in DWEapp und WeClapp unterscheiden sich. 
            Welche Daten sollen verwendet werden?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {fields.map(({ key, label }) => {
            const isDifferent = comparison.differences[key]
            if (!isDifferent) return null

            return (
              <div 
                key={key}
                className="p-3 rounded-lg border border-[var(--warning)] bg-[rgba(208,96,64,0.05)]"
              >
                <p className="text-sm font-medium mb-2">{label}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)]">
                    {comparison.dweapp[key] || '(leer)'}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted" />
                  <span className="px-2 py-1 rounded bg-[var(--accent-muted)]">
                    {comparison.weclapp[key] || '(leer)'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="sm:mr-auto"
          >
            Abbrechen
          </Button>
          <Button 
            variant="outline"
            onClick={onUseDWEappData}
          >
            DWEapp-Daten behalten
          </Button>
          <Button onClick={onUseWeClappData}>
            WeClapp-Daten übernehmen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
