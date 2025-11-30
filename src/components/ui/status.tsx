// Status Komponente - CASCADE konform
// Wiederverwendbare Status-Icons mit Tooltip

'use client'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'
import { 
  Check, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Pause, 
  Play,
  CheckCircle2,
  Circle,
  Timer
} from 'lucide-react'

// ===== STATUS TYPES =====
// TaskStatus: Interne Darstellung, wird von WeClapp-Werten gemappt
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked' | 'paused'
export type ProjectStatus = 'aktiv' | 'planung' | 'abgeschlossen' | 'pausiert'
// PriorityLevel: WeClapp hat nur LOW, MEDIUM, HIGH (kein URGENT/CRITICAL!)
export type PriorityLevel = 'low' | 'medium' | 'high'

// ===== STATUS CONFIG =====
const taskStatusConfig: Record<TaskStatus, { icon: React.ReactNode; color: string; tooltip: string }> = {
  'todo': {
    icon: <Circle className="h-4 w-4" />,
    color: 'text-[var(--muted)]',
    tooltip: 'Offen'
  },
  'in-progress': {
    icon: <Play className="h-4 w-4" />,
    color: 'text-[var(--accent)]',
    tooltip: 'In Arbeit'
  },
  'done': {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-[var(--success)]',
    tooltip: 'Erledigt'
  },
  'blocked': {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-[var(--error)]',
    tooltip: 'Blockiert'
  },
  'paused': {
    icon: <Pause className="h-4 w-4" />,
    color: 'text-[var(--warning)]',
    tooltip: 'Pausiert'
  },
}

const projectStatusConfig: Record<ProjectStatus, { icon: React.ReactNode; color: string; tooltip: string }> = {
  'aktiv': {
    icon: <Play className="h-4 w-4" />,
    color: 'text-[var(--success)]',
    tooltip: 'Projekt aktiv'
  },
  'planung': {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-[var(--warning)]',
    tooltip: 'In Planung'
  },
  'abgeschlossen': {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-[var(--muted)]',
    tooltip: 'Abgeschlossen'
  },
  'pausiert': {
    icon: <Pause className="h-4 w-4" />,
    color: 'text-[var(--info)]',
    tooltip: 'Pausiert'
  },
}

const priorityConfig: Record<PriorityLevel, { icon: React.ReactNode; color: string; tooltip: string }> = {
  'low': {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-[var(--muted)]',
    tooltip: 'Niedrige Priorität'
  },
  'medium': {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'text-[var(--warning)]',
    tooltip: 'Mittlere Priorität'
  },
  'high': {
    icon: <AlertCircle className="h-4 w-4 fill-current" />,
    color: 'text-[var(--error)]',
    tooltip: 'Hohe Priorität'
  },
}

// ===== TASK STATUS COMPONENT =====
interface TaskStatusProps {
  status: TaskStatus
  className?: string
  showText?: boolean // Neu: Text anzeigen oder nicht
}

export function TaskStatusIcon({ status, className, showText = false }: TaskStatusProps) {
  const config = taskStatusConfig[status]
  
  if (showText) {
    // Variante 1: Mit Text
    return (
      <div className={cn("flex items-center gap-2", config.color, className)}>
        {config.icon}
        <span className="text-sm font-medium">{config.tooltip}</span>
      </div>
    )
  }
  
  // Variante 2: Nur Icon mit Tooltip (für Tabellen)
  return (
    <Tooltip content={config.tooltip}>
      <div className={cn("flex items-center justify-center", config.color, className)}>
        {config.icon}
      </div>
    </Tooltip>
  )
}

// ===== PROJECT STATUS COMPONENT =====
interface ProjectStatusProps {
  status: ProjectStatus
  className?: string
  showText?: boolean // Neu: Text anzeigen oder nicht
}

export function ProjectStatusIcon({ status, className, showText = false }: ProjectStatusProps) {
  const config = projectStatusConfig[status]
  
  if (showText) {
    // Variante 1: Mit Text
    return (
      <div className={cn("flex items-center gap-2", config.color, className)}>
        {config.icon}
        <span className="text-sm font-medium">{config.tooltip}</span>
      </div>
    )
  }
  
  // Variante 2: Nur Icon mit Tooltip (für Tabellen)
  return (
    <Tooltip content={config.tooltip}>
      <div className={cn("flex items-center justify-center", config.color, className)}>
        {config.icon}
      </div>
    </Tooltip>
  )
}

// ===== PRIORITY COMPONENT =====
interface PriorityProps {
  priority: PriorityLevel
  className?: string
  showText?: boolean // Neu: Text anzeigen oder nicht
}

export function PriorityIcon({ priority, className, showText = false }: PriorityProps) {
  const config = priorityConfig[priority]
  
  if (showText) {
    // Variante 1: Mit Text
    return (
      <div className={cn("flex items-center gap-2", config.color, className)}>
        {config.icon}
        <span className="text-sm font-medium">{config.tooltip}</span>
      </div>
    )
  }
  
  // Variante 2: Nur Icon mit Tooltip (für Tabellen)
  return (
    <Tooltip content={config.tooltip}>
      <div className={cn("flex items-center justify-center", config.color, className)}>
        {config.icon}
      </div>
    </Tooltip>
  )
}

// ===== FILTER OPTIONS (für DataTable) =====
export const taskStatusFilterOptions = [
  { value: 'todo', label: 'Offen' },
  { value: 'in-progress', label: 'In Arbeit' },
  { value: 'done', label: 'Erledigt' },
  { value: 'blocked', label: 'Blockiert' },
  { value: 'paused', label: 'Pausiert' },
]

export const projectStatusFilterOptions = [
  { value: 'aktiv', label: 'Aktiv' },
  { value: 'planung', label: 'In Planung' },
  { value: 'abgeschlossen', label: 'Abgeschlossen' },
  { value: 'pausiert', label: 'Pausiert' },
]

export const priorityFilterOptions = [
  { value: 'low', label: 'Niedrig' },
  { value: 'medium', label: 'Mittel' },
  { value: 'high', label: 'Hoch' },
]
