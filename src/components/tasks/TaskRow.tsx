// Task-Zeile Komponente
// Zeigt eine einzelne Aufgabe mit Unteraufgaben-Support

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Calendar, User, ListTree, Package } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { formatDate } from '@/lib/task-config'
import type { Task } from '@/types/task'

interface TaskRowProps {
  task: Task
  level?: number
}

export function TaskRow({ task, level = 0 }: TaskRowProps) {
  const [expanded, setExpanded] = useState(level === 0)
  const isOverdue = task.dateTo && task.dateTo < Date.now() && task.taskStatus !== 'COMPLETED'
  const hasSubTasks = task.subTasks && task.subTasks.length > 0

  return (
    <>
      <div
        className={`
          flex items-center gap-4 p-4 rounded-lg border transition-all
          hover:border-[var(--accent)] hover:bg-[var(--accent-muted)]
          ${isOverdue 
            ? 'border-[var(--error)] bg-[rgba(220,38,38,0.05)]' 
            : 'border-[var(--border)] bg-[var(--bg-secondary)]'
          }
          ${level > 0 ? 'ml-8 border-l-4 border-l-[var(--muted)]' : ''}
        `}
      >
        {/* Expand Button für Unteraufgaben */}
        <div className="w-6 flex-shrink-0">
          {hasSubTasks ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-[var(--bg-tertiary)] rounded"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted" />
              )}
            </button>
          ) : level > 0 ? (
            <ListTree className="w-4 h-4 text-muted ml-1" />
          ) : null}
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          <StatusBadge status={task.taskStatus} />
        </div>

        {/* Haupt-Inhalt */}
        <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0 cursor-pointer">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">
              {task.subject}
            </h3>
            {hasSubTasks && (
              <span className="text-xs text-muted bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">
                {task.subTasks!.length} Unteraufgaben
              </span>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-1 text-sm text-muted">
            {task.identifier && (
              <span className="font-mono text-xs">{task.identifier}</span>
            )}
            {task.dateTo && (
              <span 
                className="flex items-center gap-1"
                style={{ color: isOverdue ? 'var(--error)' : undefined, fontWeight: isOverdue ? 500 : undefined }}
              >
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(task.dateTo)}
              </span>
            )}
            {task.assignees.length > 0 && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {task.assignees.map(a => a.fullName || a.firstName || a.userId).join(', ')}
              </span>
            )}
            {task.orderItemId && (
              <span className="flex items-center gap-1" style={{ color: 'var(--info)' }}>
                <Package className="w-3.5 h-3.5" />
                Auftrag
              </span>
            )}
          </div>
        </Link>

        {/* Priority Badge */}
        <div className="flex-shrink-0">
          <PriorityBadge priority={task.taskPriority} />
        </div>

        {/* Arrow */}
        <Link href={`/tasks/${task.id}`}>
          <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
        </Link>
      </div>

      {/* Unteraufgaben */}
      {expanded && hasSubTasks && (
        <div className="space-y-2 mt-2">
          {task.subTasks!.map((subTask) => (
            <TaskRow key={subTask.id} task={subTask} level={level + 1} />
          ))}
        </div>
      )}
    </>
  )
}
