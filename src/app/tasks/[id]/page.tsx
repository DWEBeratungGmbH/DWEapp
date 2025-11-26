"use client"

import React, { useEffect, useState } from 'react'
import { ArrowLeft, Save, RefreshCw, Calendar, Clock, User, FileText, AlertCircle, CheckCircle, Trash2, Edit3 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface TaskDetail {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  assignedUser?: string
  assignedUserName?: string
  assignedUserId?: string
  orderId?: string
  orderNumber?: string
  createdDate?: string
  estimatedHours?: number
  actualHours?: number
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
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
        setTask(data.task)
        setFormData({
          title: data.task.title,
          description: data.task.description || '',
          status: data.task.status,
          priority: data.task.priority,
          estimatedHours: data.task.estimatedHours || 0,
          actualHours: data.task.actualHours || 0,
          dueDate: data.task.dueDate ? new Date(data.task.dueDate).toISOString().split('T')[0] : '',
          assignedUserId: data.task.assignedUserId || ''
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
          name: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          estimatedHours: formData.estimatedHours,
          actualHours: formData.actualHours,
          dueDate: formData.dueDate,
          assignedUserId: formData.assignedUserId
        }),
      })

      if (!response.ok) {
        throw new Error('Speichern fehlgeschlagen')
      }

      const updatedTask = await response.json()
      setTask(updatedTask.task)
      setIsEditing(false)
      setError(null)
      console.log('Aufgabe erfolgreich aktualisiert')
    } catch (err: any) {
      console.error('Fehler beim Speichern:', err)
      setError('Fehler beim Speichern: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Löschen fehlgeschlagen')
      }
      
      console.log('Aufgabe erfolgreich gelöscht')
      router.push('/tasks')
    } catch (err: any) {
      console.error('Fehler beim Löschen:', err)
      setError('Fehler beim Löschen: ' + err.message)
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

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'Erledigt'
      case 'IN_PROGRESS': return 'In Arbeit'
      case 'OPEN': return 'Offen'
      case 'OVERDUE': return 'Überfällig'
      default: return status || 'Offen'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'Hoch'
      case 'MEDIUM': return 'Mittel'
      case 'LOW': return 'Niedrig'
      default: return priority || 'Mittel'
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/tasks" className="inline-flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zu den Aufgaben
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hauptinhalt */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Aufgabendetails</CardTitle>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} disabled={saving} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Speichern...' : 'Speichern'}
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                        Abbrechen
                      </Button>
                    </>
                  )}
                  <Button onClick={handleDelete} variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Löschen
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Titel */}
              <div>
                <label className="block text-sm font-medium mb-2">Titel</label>
                {isEditing ? (
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Aufgabentitel"
                  />
                ) : (
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                )}
              </div>

              {/* Beschreibung */}
              <div>
                <label className="block text-sm font-medium mb-2">Beschreibung</label>
                {isEditing ? (
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Aufgabenbeschreibung"
                    rows={4}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {task.description || 'Keine Beschreibung vorhanden'}
                  </p>
                )}
              </div>

              {/* Status und Priorität */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  {isEditing ? (
                    <Select value={formData.status || ''} onValueChange={(value: string) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Offen</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Arbeit</SelectItem>
                        <SelectItem value="COMPLETED">Erledigt</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priorität</label>
                  {isEditing ? (
                    <Select value={formData.priority || ''} onValueChange={(value: string) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priorität wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Niedrig</SelectItem>
                        <SelectItem value="MEDIUM">Mittel</SelectItem>
                        <SelectItem value="HIGH">Hoch</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getPriorityColor(task.priority)}>
                      {getPriorityText(task.priority)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Geschätzte und tatsächliche Stunden */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Geschätzte Stunden</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.estimatedHours || ''}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                      placeholder="Geschätzte Stunden"
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {task.estimatedHours ? `${task.estimatedHours} Stunden` : 'Nicht angegeben'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tatsächliche Stunden</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.25"
                      min="0"
                      value={formData.actualHours || ''}
                      onChange={(e) => setFormData({ ...formData, actualHours: parseFloat(e.target.value) })}
                      placeholder="Tatsächliche Stunden"
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {task.actualHours ? `${task.actualHours} Stunden` : 'Nicht angegeben'}
                    </p>
                  )}
                </div>
              </div>

              {/* Fälligkeitsdatum */}
              <div>
                <label className="block text-sm font-medium mb-2">Fälligkeitsdatum</label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('de-DE') : 'Kein Fälligkeitsdatum'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seitenleiste */}
        <div className="space-y-6">
          {/* Metadaten */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Aufgaben-ID</label>
                <p className="text-sm text-muted-foreground">{task.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Erstellt am</label>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {task.createdDate ? new Date(task.createdDate).toLocaleDateString('de-DE') : 'Unbekannt'}
                </div>
              </div>

              {task.orderNumber && (
                <div>
                  <label className="block text-sm font-medium mb-1">Auftrag</label>
                  <p className="text-sm text-muted-foreground">#{task.orderNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zugewiesen an */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zugewiesen an</CardTitle>
            </CardHeader>
            <CardContent>
              {task.assignedUserName ? (
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{task.assignedUserName}</span>
                </div>
              ) : (
                <p className="text-muted-foreground">Nicht zugewiesen</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
