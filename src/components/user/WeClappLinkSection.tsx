// WeClapp Verknüpfungs-Sektion
// Zeigt den Status der WeClapp-Verknüpfung und ermöglicht Aktionen

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, Unlink, CheckCircle2, AlertCircle } from 'lucide-react'

interface WeClappLinkSectionProps {
  weClappUserId: string
  userEmail: string
  isSearching: boolean
  onSearch: () => void
  onUnlink: () => void
}

export function WeClappLinkSection({
  weClappUserId,
  userEmail,
  isSearching,
  onSearch,
  onUnlink
}: WeClappLinkSectionProps) {
  const isLinked = Boolean(weClappUserId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link className="h-5 w-5" />
          WeClapp Verknüpfung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLinked ? (
          <LinkedState 
            weClappUserId={weClappUserId} 
            onUnlink={onUnlink} 
          />
        ) : (
          <UnlinkedState 
            userEmail={userEmail}
            isSearching={isSearching}
            onSearch={onSearch}
          />
        )}
      </CardContent>
    </Card>
  )
}

// Verknüpfter Zustand
function LinkedState({ 
  weClappUserId, 
  onUnlink 
}: { 
  weClappUserId: string
  onUnlink: () => void 
}) {
  return (
    <div className="space-y-4">
      {/* Erfolgs-Banner */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
          <div>
            <p className="font-medium">Mit WeClapp verknüpft</p>
            <p className="text-sm text-secondary">WeClapp ID: {weClappUserId}</p>
            <p className="text-xs text-muted">Daten werden automatisch synchronisiert</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onUnlink}
          className="text-[var(--error)] border-[var(--error)] hover:bg-[rgba(220,38,38,0.1)]"
        >
          <Unlink className="h-4 w-4 mr-2" />
          Trennen
        </Button>
      </div>

      {/* Info-Banner */}
      <div className="p-3 rounded-lg bg-[var(--accent-muted)] border border-[var(--info)]">
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-[var(--info)]" />
          <p className="text-sm">
            <strong>Automatische Synchronisation:</strong> Änderungen an Name und E-Mail 
            werden automatisch an WeClapp übertragen.
          </p>
        </div>
      </div>
    </div>
  )
}

// Nicht verknüpfter Zustand
function UnlinkedState({ 
  userEmail, 
  isSearching, 
  onSearch 
}: { 
  userEmail: string
  isSearching: boolean
  onSearch: () => void 
}) {
  return (
    <div className="space-y-4">
      {/* Warnung */}
      <div className="flex items-center gap-2 p-4 rounded-lg bg-[rgba(208,96,64,0.1)] border border-[var(--warning)]">
        <AlertCircle className="h-5 w-5 text-[var(--warning)]" />
        <p className="text-sm">Nicht mit WeClapp verknüpft</p>
      </div>

      {/* Verknüpfungs-Aktion */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-[rgba(39,138,148,0.1)] border border-[var(--info)]">
        <div>
          <p className="font-medium">WeClapp Verknüpfung herstellen</p>
          <p className="text-sm text-secondary">
            Automatische Suche nach Benutzer mit E-Mail: {userEmail}
          </p>
        </div>
        <Button
          type="button"
          onClick={onSearch}
          disabled={isSearching}
          className="btn btn-primary"
        >
          {isSearching ? 'Suche...' : 'Mit WeClapp verbinden'}
        </Button>
      </div>
    </div>
  )
}
