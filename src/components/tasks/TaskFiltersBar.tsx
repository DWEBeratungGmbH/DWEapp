// Smart Filters - CASCADE konform (< 100 Zeilen)

'use client'

interface TaskFiltersBarProps {
  filters: {
    status: string
    priority: string
    search: string
    assignee: string
    hideCompleted: boolean
    hideNoOrder: boolean
  }
  onFiltersChange: (filters: any) => void
  users: Record<string, any>
}

export function TaskFiltersBar({ filters, onFiltersChange, users }: TaskFiltersBarProps) {
  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="🔍 Aufgaben suchen..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] bg-[var(--bg-primary)] text-[var(--primary)]"
          />
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--primary)]"
        >
          <option value="">Alle Status</option>
          <option value="NOT_STARTED">🔴 Offen</option>
          <option value="IN_PROGRESS">🟡 In Bearbeitung</option>
          <option value="COMPLETED">✅ Erledigt</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
          className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--primary)]"
        >
          <option value="">Alle Prioritäten</option>
          <option value="HIGH">🔴 Hoch</option>
          <option value="MEDIUM">🟡 Mittel</option>
          <option value="LOW">🟢 Niedrig</option>
        </select>

        <select
          value={filters.assignee}
          onChange={(e) => onFiltersChange({ ...filters, assignee: e.target.value })}
          className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--primary)]"
        >
          <option value="">Alle Mitarbeiter</option>
          {Object.values(users).map((user: any) => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </select>

        <button
          onClick={() => onFiltersChange({ ...filters, hideCompleted: !filters.hideCompleted })}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            filters.hideCompleted 
              ? 'bg-red-100 border-red-300 text-red-700' 
              : 'bg-[var(--bg-primary)] border-[var(--border)]'
          }`}
        >
          {filters.hideCompleted ? '✅' : '⭕'} Erledigt
        </button>

        <button
          onClick={() => onFiltersChange({ ...filters, hideNoOrder: !filters.hideNoOrder })}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            filters.hideNoOrder 
              ? 'bg-orange-100 border-orange-300 text-orange-700' 
              : 'bg-[var(--bg-primary)] border-[var(--border)]'
          }`}
        >
          {filters.hideNoOrder ? '📦' : '📄'} Mit Auftrag
        </button>
      </div>
    </div>
  )
}
