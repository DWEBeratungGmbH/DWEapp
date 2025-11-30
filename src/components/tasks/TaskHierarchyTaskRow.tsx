// TaskHierarchyTaskRow - Task-Zeile für hierarchische Aufgabenliste
// CASCADE-konform: <200 Zeilen, CSS-Variablen

'use client'

import { ChevronDown, ChevronRight, FileText, Check, Pause, MessageSquare, MoreHorizontal } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'

interface TaskRowProps {
  item: {
    id: string
    type: 'main-task' | 'sub-task'
    taskId?: string
    title: string
    subtitle?: string
    status?: string
    priority?: string
    dateTo?: string
    assignees?: any[]
    hasChildren: boolean
    isExpanded?: boolean
  }
  users: Record<string, any>
  onToggle: (id: string) => void
  onQuickAction: (action: string, taskId: string) => void
}

export function TaskHierarchyTaskRow({ item, users, onToggle, onQuickAction }: TaskRowProps) {
  // Hauptaufgabe
  if (item.type === 'main-task') {
    return (
      <div className="border-l-4 border-[var(--success)] bg-[var(--bg-secondary)] rounded-r-lg p-4 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {item.hasChildren && (
              <button
                onClick={() => onToggle(item.id)}
                className="w-5 h-5 flex items-center justify-center hover:bg-[var(--bg-tertiary)] rounded"
              >
                {item.isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-[var(--secondary)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--secondary)]" />
                )}
              </button>
            )}
            <FileText className="h-5 w-5 text-[var(--success)]" />
            <div className="flex-1">
              <h4 className="font-medium text-[var(--primary)]">{item.title}</h4>
              {item.subtitle && (
                <div className="text-sm text-[var(--muted)]">{item.subtitle}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {item.status && <StatusBadge status={item.status as any} />}
            {item.priority && <PriorityBadge priority={item.priority as any} />}
            
            {/* Fälligkeitsdatum */}
            {item.dateTo && (
              <div className={`text-sm px-2 py-1 rounded ${
                new Date(item.dateTo) < new Date() 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-[var(--bg-tertiary)] text-[var(--secondary)]'
              }`}>
                📅 {new Date(item.dateTo).toLocaleDateString('de-DE')}
              </div>
            )}

            {/* Assignees */}
            {item.assignees && Array.isArray(item.assignees) && item.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {item.assignees.slice(0, 3).map((assigneeId: any, idx) => {
                  const user = users[assigneeId.userId || assigneeId]
                  return (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-medium border-2 border-[var(--bg-secondary)]"
                      title={user?.fullName || 'Unbekannt'}
                    >
                      {(user?.fullName || user?.firstName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )
                })}
                {item.assignees.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-[var(--muted)] text-white flex items-center justify-center text-xs font-medium border-2 border-[var(--bg-secondary)]">
                    +{item.assignees.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onQuickAction('complete', item.taskId!)}
                className="p-1 hover:bg-green-100 rounded text-[var(--success)]"
                title="Erledigen"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => onQuickAction('pause', item.taskId!)}
                className="p-1 hover:bg-yellow-100 rounded text-[var(--warning)]"
                title="Pausieren"
              >
                <Pause className="h-4 w-4" />
              </button>
              <button
                onClick={() => onQuickAction('comment', item.taskId!)}
                className="p-1 hover:bg-blue-100 rounded text-[var(--info)]"
                title="Kommentieren"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <button
                className="p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--secondary)]"
                title="Mehr"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Unteraufgabe
  return (
    <div className="border-l-2 border-[var(--border)] bg-[var(--bg-tertiary)] rounded-r-lg p-3 ml-4 hover:bg-[var(--bg-secondary)] transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <FileText className="h-4 w-4 text-[var(--muted)]" />
          <div className="flex-1">
            <h5 className="text-sm font-medium text-[var(--primary)]">{item.title}</h5>
            {item.subtitle && (
              <div className="text-xs text-[var(--muted)]">{item.subtitle}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.status && <StatusBadge status={item.status as any} />}
          {item.priority && <PriorityBadge priority={item.priority as any} />}
          
          {/* Assignees */}
          {item.assignees && Array.isArray(item.assignees) && item.assignees.length > 0 && (
            <div className="flex -space-x-1">
              {item.assignees.slice(0, 2).map((assigneeId: any, idx) => {
                const user = users[assigneeId.userId || assigneeId]
                return (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full bg-[var(--secondary)] text-white flex items-center justify-center text-xs font-medium border border-[var(--bg-secondary)]"
                    title={user?.fullName || 'Unbekannt'}
                  >
                    {(user?.fullName || user?.firstName || 'U').charAt(0).toUpperCase()}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
