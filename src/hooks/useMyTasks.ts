// Hook für "Meine Aufgaben"
import { useState, useEffect, useCallback } from 'react'
import type { Task } from '@/types'

interface MyTasksStats {
  total: number
  open: number
  inProgress: number
  completed: number
  dueToday: number
  dueThisWeek: number
}

interface MyTasksFilters {
  status?: string[]
  priority?: string
  search?: string
  showAll?: boolean
}

interface UseMyTasksResult {
  tasks: Task[]
  stats: MyTasksStats
  loading: boolean
  error: string | null
  filters: MyTasksFilters
  setFilters: (filters: MyTasksFilters) => void
  showAll: boolean
  setShowAll: (showAll: boolean) => void
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  refetch: () => Promise<void>
  nextPage: () => void
  prevPage: () => void
}

export function useMyTasks(): UseMyTasksResult {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<MyTasksStats>({
    total: 0, open: 0, inProgress: 0, completed: 0, dueToday: 0, dueThisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MyTasksFilters>({ 
    status: ['NOT_STARTED', 'IN_PROGRESS', 'WAITING_ON_OTHERS', 'DEFERRED'] // Default ohne Erledigt
  })
  const [showAll, setShowAll] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1, limit: 50, total: 0, pages: 0
  })

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      
      if (filters.priority) params.set('priority', filters.priority)
      if (filters.search) params.set('search', filters.search)
      if (showAll) params.set('showAll', 'true')
      
      // Multi-Status als Array senden
      if (filters.status && filters.status.length > 0) {
        params.set('status', filters.status.join(','))
      }

      const response = await fetch(`/api/my-tasks?${params}`)
      const result = await response.json()

      if (result.success) {
        setTasks(result.data.tasks)
        setStats(result.data.stats)
        setPagination(prev => ({ ...prev, ...result.data.pagination }))
      } else {
        setError(result.error || 'Fehler beim Laden')
      }
    } catch (err) {
      setError('Netzwerkfehler')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters, showAll])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const nextPage = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

  return {
    tasks,
    stats,
    loading,
    error,
    filters,
    setFilters: (newFilters) => {
      setFilters(newFilters)
      setPagination(prev => ({ ...prev, page: 1 }))
    },
    showAll,
    setShowAll: (value) => {
      setShowAll(value)
      setPagination(prev => ({ ...prev, page: 1 }))
    },
    pagination,
    refetch: fetchTasks,
    nextPage,
    prevPage
  }
}
