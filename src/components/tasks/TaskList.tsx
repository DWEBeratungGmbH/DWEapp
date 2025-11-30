// Task-Liste Komponente
// Zeigt alle Aufgaben als Liste

'use client'

import { Loader2 } from 'lucide-react'
import { TaskRow } from './TaskRow'
import type { Task } from '@/types/task'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  error: string | null
}

export function TaskList({ tasks, loading, error }: TaskListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Lade Aufgaben...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-[var(--error)] bg-[rgba(220,38,38,0.1)]">
        <p style={{ color: 'var(--error)' }}>
          <strong>Fehler:</strong> {error}
        </p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
        <p className="text-muted">Keine Aufgaben gefunden</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  )
}
