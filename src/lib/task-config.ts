// Task-Konfiguration
// Status und Priorität Styling mit CSS-Variablen

import { Circle, PlayCircle, CheckCircle, Clock } from 'lucide-react'

// Status-Konfiguration
export const STATUS_CONFIG = {
  NOT_STARTED: { 
    label: 'Offen', 
    icon: Circle, 
    color: 'var(--muted)', 
    bgClass: 'bg-[var(--bg-tertiary)]'
  },
  IN_PROGRESS: { 
    label: 'In Bearbeitung', 
    icon: PlayCircle, 
    color: 'var(--info)', 
    bgClass: 'bg-[rgba(39,138,148,0.1)]'
  },
  COMPLETED: { 
    label: 'Abgeschlossen', 
    icon: CheckCircle, 
    color: 'var(--accent)', 
    bgClass: 'bg-[var(--accent-muted)]'
  },
  DEFERRED: { 
    label: 'Zurückgestellt', 
    icon: Clock, 
    color: 'var(--warning)', 
    bgClass: 'bg-[rgba(208,96,64,0.1)]'
  },
  WAITING_ON_OTHERS: { 
    label: 'Wartet', 
    icon: Clock, 
    color: 'var(--warning)', 
    bgClass: 'bg-[rgba(208,96,64,0.1)]'
  },
} as const

// Priorität-Konfiguration
export const PRIORITY_CONFIG = {
  HIGH: { 
    label: 'Hoch', 
    color: 'var(--error)', 
    bgClass: 'bg-[rgba(220,38,38,0.1)]',
    dotClass: 'bg-[var(--error)]'
  },
  MEDIUM: { 
    label: 'Mittel', 
    color: 'var(--warning)', 
    bgClass: 'bg-[rgba(208,96,64,0.1)]',
    dotClass: 'bg-[var(--warning)]'
  },
  LOW: { 
    label: 'Niedrig', 
    color: 'var(--accent)', 
    bgClass: 'bg-[var(--accent-muted)]',
    dotClass: 'bg-[var(--accent)]'
  },
} as const

// Helper Functions
export function formatDate(timestamp?: number): string {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatEffort(seconds?: number): string {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  return `${minutes}m`
}
