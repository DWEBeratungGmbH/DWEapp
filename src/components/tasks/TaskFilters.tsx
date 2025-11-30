// Task-Filter Komponente
// Zeigt Status, Priorität und Assignee Filter

'use client'

import { Filter, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { WeClappUser } from '@/types/task'

interface TaskFiltersProps {
  searchInput: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  priorityFilter: string
  onPriorityChange: (value: string) => void
  assigneeFilter: string
  onAssigneeChange: (value: string) => void
  orderFilter: string
  onOrderChange: (value: string) => void
  dueDateFrom: string
  onDueDateFromChange: (value: string) => void
  dueDateTo: string
  onDueDateToChange: (value: string) => void
  users: WeClappUser[]
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function TaskFilters({
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  orderFilter,
  onOrderChange,
  dueDateFrom,
  onDueDateFromChange,
  dueDateTo,
  onDueDateToChange,
  users,
  onClearFilters,
  hasActiveFilters
}: TaskFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Suche */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Aufgaben suchen..."
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="NOT_STARTED">Offen</SelectItem>
              <SelectItem value="IN_PROGRESS">In Bearbeitung</SelectItem>
              <SelectItem value="COMPLETED">Abgeschlossen</SelectItem>
              <SelectItem value="DEFERRED">Zurückgestellt</SelectItem>
              <SelectItem value="WAITING_ON_OTHERS">Wartet</SelectItem>
            </SelectContent>
          </Select>

          {/* Priorität Filter */}
          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priorität" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="HIGH">Hoch</SelectItem>
              <SelectItem value="MEDIUM">Mittel</SelectItem>
              <SelectItem value="LOW">Niedrig</SelectItem>
            </SelectContent>
          </Select>

          {/* Assignee Filter */}
          <Select value={assigneeFilter} onValueChange={onAssigneeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Zugewiesen an" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Benutzer</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auftrag Filter */}
          <div className="flex-1 min-w-[150px]">
            <Input
              placeholder="Auftrag suchen..."
              value={orderFilter}
              onChange={(e) => onOrderChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Datum Filter */}
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="Von"
              value={dueDateFrom}
              onChange={(e) => onDueDateFromChange(e.target.value)}
              className="w-[140px]"
            />
            <Input
              type="date"
              placeholder="Bis"
              value={dueDateTo}
              onChange={(e) => onDueDateToChange(e.target.value)}
              className="w-[140px]"
            />
          </div>

          {/* Filter löschen */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="btn btn-ghost text-sm"
            >
              <X className="w-4 h-4 mr-1" />
              Filter löschen
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
