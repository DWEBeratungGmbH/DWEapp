// Task-Gruppierung Komponente
// CASCADE-konforme Gruppierungs-Logik

'use client'

import { Layers, Filter, Users, FolderOpen, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface TaskGroupingProps {
  grouping: string
  onGroupingChange: (value: string) => void
}

export function TaskGrouping({ grouping, onGroupingChange }: TaskGroupingProps) {
  const groupingOptions = [
    { value: 'none', label: 'Keine Gruppierung', icon: <X className="h-4 w-4" /> },
    { value: 'taskStatus', label: 'Nach Status', icon: <Layers className="h-4 w-4" /> },
    { value: 'taskPriority', label: 'Nach Priorität', icon: <Filter className="h-4 w-4" /> },
    { value: 'assigneeName', label: 'Nach Zuständig', icon: <Users className="h-4 w-4" /> },
    { value: 'orderNumber', label: 'Nach Auftrag', icon: <FolderOpen className="h-4 w-4" /> },
  ]

  return (
    <Select value={grouping} onValueChange={onGroupingChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Gruppierung" />
      </SelectTrigger>
      <SelectContent>
        {groupingOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.icon}
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
