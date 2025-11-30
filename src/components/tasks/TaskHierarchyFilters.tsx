// TaskHierarchyFilters - Filter Bar für hierarchische Aufgabenliste
// CASCADE-konform: <200 Zeilen, CSS-Variablen

'use client'

interface TaskFiltersState {
  status: string
  priority: string
  search: string
  assignee: string
  dueSoon: boolean
  myTasks: boolean
}

interface TaskHierarchyFiltersProps {
  filters: TaskFiltersState
  onFiltersChange: (filters: TaskFiltersState) => void
}

export function TaskHierarchyFilters({ filters, onFiltersChange }: TaskHierarchyFiltersProps) {
  const updateFilter = <K extends keyof TaskFiltersState>(key: K, value: TaskFiltersState[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
      <div className="flex flex-wrap gap-3">
        {/* Suche */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="🔍 Aufgaben suchen..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
          />
        </div>
        
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--primary)]"
        >
          <option value="">Alle Status</option>
          <option value="NOT_STARTED">🔴 Offen</option>
          <option value="IN_PROGRESS">🟡 In Bearbeitung</option>
          <option value="COMPLETED">✅ Erledigt</option>
        </select>

        {/* Priorität Filter */}
        <select
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
          className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--primary)]"
        >
          <option value="">Alle Prioritäten</option>
          <option value="HIGH">🔴 Hoch</option>
          <option value="MEDIUM">🟡 Mittel</option>
          <option value="LOW">🟢 Niedrig</option>
        </select>

        {/* Fällig bald Toggle */}
        <button
          onClick={() => updateFilter('dueSoon', !filters.dueSoon)}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            filters.dueSoon 
              ? 'bg-orange-100 border-orange-300 text-orange-700' 
              : 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--primary)]'
          }`}
        >
          📅 Fällig bald
        </button>

        {/* Meine Aufgaben Toggle */}
        <button
          onClick={() => updateFilter('myTasks', !filters.myTasks)}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            filters.myTasks 
              ? 'bg-blue-100 border-blue-300 text-blue-700' 
              : 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--primary)]'
          }`}
        >
          👤 Meine Aufgaben
        </button>
      </div>
    </div>
  )
}

export type { TaskFiltersState }
