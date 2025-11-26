"use client"

import React, { useEffect, useState } from 'react'
import { ArrowLeft, Save, RefreshCw, Calendar, Clock, User, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TaskDetail {
  id: string
  projectId: string
  name: string
  description?: string
  status: string
  priority: string
  estimatedHours?: number
  actualHours?: number
  assignedUserId?: string
  dueDate?: number
  createdAt: number
  updatedAt: number
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<TaskDetail>>({})

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/tasks/${id}`)
        
        if (!response.ok) {
          throw new Error('Aufgabe konnte nicht geladen werden')
        }
        
        const data = await response.json()
        setTask(data.result)
        setFormData({
          name: data.result.name,
          description: data.result.description || '',
          status: data.result.status,
          priority: data.result.priority,
          actualHours: data.result.actualHours || 0,
        })
      } catch (err: any) {
        console.error('Fehler beim Laden der Aufgabe:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [id])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          actualHours: formData.actualHours,
        }),
      })

      if (!response.ok) {
        throw new Error('Speichern fehlgeschlagen')
      }

      const updatedTask = await response.json()
      setTask(updatedTask.result)
      alert('Aufgabe erfolgreich aktualisiert!')
    } catch (err: any) {
      console.error('Fehler beim Speichern:', err)
      alert('Fehler beim Speichern: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'OPEN': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'text-red-600'
      case 'MEDIUM': return 'text-yellow-600'
      case 'LOW': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
        <span>Lade Aufgabendetails...</span>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="p-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800 mb-4">
          <strong>Fehler:</strong> {error || 'Aufgabe nicht gefunden'}
        </div>
        <Link href="/tasks" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/tasks" className="btn btn-ghost">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Aufgabendetails</h1>
            <div className="text-sm text-muted-foreground">
              ID: {task.id}
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary flex items-center"
        >
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Speichern
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
            Allgemeine Informationen
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titel</label>
              <input
                type="text"
                className="input w-full"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Beschreibung</label>
              <textarea
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beschreibung eingeben..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="input w-full"
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="OPEN">Offen</option>
                  <option value="IN_PROGRESS">In Bearbeitung</option>
                  <option value="COMPLETED">Erledigt</option>
                  <option value="CANCELLED">Storniert</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priorität</label>
                <select
                  className="input w-full"
                  value={formData.priority || ''}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Niedrig</option>
                  <option value="MEDIUM">Mittel</option>
                  <option value="HIGH">Hoch</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
            Zeiterfassung & Termine
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fälligkeitsdatum</label>
              <div className="flex items-center h-10 px-3 rounded-md border bg-muted/20">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('de-DE') : '-'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tatsächliche Stunden</label>
              <input
                type="number"
                step="0.25"
                className="input w-full"
                value={formData.actualHours || 0}
                onChange={(e) => setFormData({ ...formData, actualHours: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
