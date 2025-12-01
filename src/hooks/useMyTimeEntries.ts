// Hook für "Meine Zeitbuchungen"
import { useState, useEffect, useCallback } from 'react'
import type { WeClappTimeEntry } from '@/types'

interface MyTimeEntriesStats {
  total: number
  todaySeconds: number
  weekSeconds: number
  monthSeconds: number
}

interface MyTimeEntriesFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
}

interface UseMyTimeEntriesResult {
  entries: WeClappTimeEntry[]
  stats: MyTimeEntriesStats
  loading: boolean
  error: string | null
  filters: MyTimeEntriesFilters
  setFilters: (filters: MyTimeEntriesFilters) => void
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

// Sekunden zu Stunden:Minuten formatieren
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`
}

export function useMyTimeEntries(): UseMyTimeEntriesResult {
  const [entries, setEntries] = useState<WeClappTimeEntry[]>([])
  const [stats, setStats] = useState<MyTimeEntriesStats>({
    total: 0, todaySeconds: 0, weekSeconds: 0, monthSeconds: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<MyTimeEntriesFilters>({})
  const [pagination, setPagination] = useState({
    page: 1, limit: 50, total: 0, pages: 0
  })

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      
      if (filters.search) params.set('search', filters.search)
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.set('dateTo', filters.dateTo)

      const response = await fetch(`/api/my-time-entries?${params}`)
      const result = await response.json()

      if (result.success) {
        setEntries(result.data.entries)
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
  }, [pagination.page, pagination.limit, filters])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

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
    entries,
    stats,
    loading,
    error,
    filters,
    setFilters: (newFilters) => {
      setFilters(newFilters)
      setPagination(prev => ({ ...prev, page: 1 }))
    },
    pagination,
    refetch: fetchEntries,
    nextPage,
    prevPage
  }
}
