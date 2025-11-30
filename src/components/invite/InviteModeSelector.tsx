// Einladungsmodus-Auswahl Komponente

'use client'

import { Label } from '@/components/ui/label'
import type { InviteMode } from '@/hooks/useInviteDialog'

interface InviteModeSelectorProps {
  mode: InviteMode
  onModeChange: (mode: InviteMode) => void
}

export function InviteModeSelector({ mode, onModeChange }: InviteModeSelectorProps) {
  return (
    <div>
      <Label className="text-base font-medium">Wie möchtest du den Benutzer einladen?</Label>
      <div className="space-y-3 mt-3">
        {/* Neuer Benutzer */}
        <div
          className="border border-[var(--border)] rounded-lg p-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
          onClick={() => onModeChange('new')}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="inviteMode"
              checked={mode === 'new'}
              onChange={() => onModeChange('new')}
              className="accent-[var(--accent)]"
            />
            <div className="flex-1">
              <h4 className="font-medium">Neuer Benutzer einladen</h4>
              <p className="text-sm text-muted">Manuelle Einladung mit Vor- und Nachname</p>
            </div>
          </div>
        </div>

        {/* WeClapp Benutzer */}
        <div
          className="border border-[var(--border)] rounded-lg p-3 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
          onClick={() => onModeChange('weclapp')}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="inviteMode"
              checked={mode === 'weclapp'}
              onChange={() => onModeChange('weclapp')}
              className="accent-[var(--accent)]"
            />
            <div className="flex-1">
              <h4 className="font-medium">WeClapp Benutzer einladen</h4>
              <p className="text-sm text-muted">Aus WeClapp auswählen und direkt verbinden</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
