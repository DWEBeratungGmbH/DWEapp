// WeClapp Data Hook - CASCADE-konform (<200 Zeilen)

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Task, WeClappUser, WeClappParty, WeClappOrder } from '@/types'

interface UseWeClappDataOptions {
  page?: number
  limit?: number
  filters?: Record<string, any>
  autoFetch?: boolean
}

interface UseWeClappDataReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  refetch: () => Promise<void>
  fetchNext: () => Promise<void>
  fetchPrevious: () => Promise<void>
}

// Tasks Hook
export function useWeClappTasks(options: UseWeClappDataOptions = {}): UseWeClappDataReturn<Task> {
  const [data, setData] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    limit: options.limit || 50,
    total: 0,
    pages: 0
  })

  const fetchTasks = useCallback(async (page = pagination.page) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...options.filters
      })

      const response = await fetch(`/api/weclapp/tasks?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Abrufen der Tasks')
      }

      setData(result.data.tasks)
      setPagination(result.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, options.filters])

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchTasks()
    }
  }, [fetchTasks, options.autoFetch])

  return {
    data,
    loading,
    error,
    pagination,
    refetch: () => fetchTasks(),
    fetchNext: () => fetchTasks(pagination.page + 1),
    fetchPrevious: () => fetchTasks(pagination.page - 1)
  }
}

// Users Hook
export function useWeClappUsers(options: UseWeClappDataOptions = {}): UseWeClappDataReturn<WeClappUser> {
  const [data, setData] = useState<WeClappUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    limit: options.limit || 50,
    total: 0,
    pages: 0
  })

  const fetchUsers = useCallback(async (page = pagination.page) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...options.filters
      })

      const response = await fetch(`/api/weclapp/users?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Abrufen der Benutzer')
      }

      setData(result.users)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, options.filters])

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchUsers()
    }
  }, [fetchUsers, options.autoFetch])

  return {
    data,
    loading,
    error,
    pagination,
    refetch: () => fetchUsers(),
    fetchNext: () => fetchUsers(pagination.page + 1),
    fetchPrevious: () => fetchUsers(pagination.page - 1)
  }
}

// Parties Hook
export function useWeClappParties(options: UseWeClappDataOptions = {}): UseWeClappDataReturn<WeClappParty> {
  const [data, setData] = useState<WeClappParty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    limit: options.limit || 50,
    total: 0,
    pages: 0
  })

  const fetchParties = useCallback(async (page = pagination.page) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...options.filters
      })

      const response = await fetch(`/api/weclapp/parties?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Abrufen der Parties')
      }

      setData(result.data.parties)
      setPagination(result.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, options.filters])

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchParties()
    }
  }, [fetchParties, options.autoFetch])

  return {
    data,
    loading,
    error,
    pagination,
    refetch: () => fetchParties(),
    fetchNext: () => fetchParties(pagination.page + 1),
    fetchPrevious: () => fetchParties(pagination.page - 1)
  }
}

// Orders Hook
export function useWeClappOrders(options: UseWeClappDataOptions = {}): UseWeClappDataReturn<WeClappOrder> {
  const [data, setData] = useState<WeClappOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    limit: options.limit || 50,
    total: 0,
    pages: 0
  })

  const fetchOrders = useCallback(async (page = pagination.page) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...options.filters
      })

      const response = await fetch(`/api/weclapp/orders?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Abrufen der Orders')
      }

      setData(result.data.orders)
      setPagination(result.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, options.filters])

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchOrders()
    }
  }, [fetchOrders, options.autoFetch])

  return {
    data,
    loading,
    error,
    pagination,
    refetch: () => fetchOrders(),
    fetchNext: () => fetchOrders(pagination.page + 1),
    fetchPrevious: () => fetchOrders(pagination.page - 1)
  }
}
