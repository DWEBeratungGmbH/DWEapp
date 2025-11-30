// Status-Badge Komponente

import { STATUS_CONFIG } from '@/lib/task-config'
import type { TaskStatus } from '@/types/task'

interface StatusBadgeProps {
  status: TaskStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED
  const Icon = config.icon

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgClass}`}
      style={{ color: config.color }}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}
