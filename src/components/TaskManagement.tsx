// Task Management Component
"use client"

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Clock, User, Calendar, CheckCircle } from 'lucide-react'

interface Task {
  id: string
  name: string
  status: string
  priority: string
  dueDate?: number
  assignedUser?: string
  assignedUserId?: string
  description?: string
  estimatedHours?: number
  actualHours?: number
  createdDate?: number
  orderId: string
}

interface TaskManagementProps {
  tasks: Task[]
  orderId: string
  onTasksUpdate: (tasks: Task[]) => void
  userRole: string
  userId: string
}

export default function TaskManagement({ tasks, orderId, onTasksUpdate, userRole, userId }: TaskManagementProps) {
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<Partial<Task>>({
    name: '',
    description: '',
    status: 'OPEN',
    priority: 'MEDIUM',
    estimatedHours: 0,
    dueDate: undefined
  })

  const canEditTasks = userRole === 'admin' || userRole === 'manager' || userRole === 'project_manager'

  const handleAddTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orderId,
          status: 'OPEN',
          createdDate: Date.now()
        })
      })

      if (response.ok) {
        const newTask = await response.json()
        onTasksUpdate([...tasks, newTask])
        setShowAddTask(false)
        setFormData({ name: '', description: '', status: 'OPEN', priority: 'MEDIUM', estimatedHours: 0 })
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Aufgabe:', error)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedTask = await response.json()
        onTasksUpdate(tasks.map(t => t.id === taskId ? updatedTask : t))
        setEditingTask(null)
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Aufgabe:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Möchten Sie diese Aufgabe wirklich löschen?')) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onTasksUpdate(tasks.filter(t => t.id !== taskId))
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Aufgabe:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'OPEN': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-orange-100 text-orange-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Task Button */}
      {canEditTasks && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Aufgaben-Management</h3>
          <button
            onClick={() => setShowAddTask(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aufgabe hinzufügen
          </button>
        </div>
      )}

      {/* Add Task Form */}
      {showAddTask && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <h4 className="font-medium mb-3">Neue Aufgabe erstellen</h4>
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Aufgabenname"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2"
            />
            <textarea
              placeholder="Beschreibung"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 min-h-[80px]"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="LOW">Niedrig</option>
                <option value="MEDIUM">Mittel</option>
                <option value="HIGH">Hoch</option>
              </select>
              <input
                type="number"
                placeholder="Geschätzte Stunden"
                value={formData.estimatedHours || ''}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                className="rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div className="flex space-x-2">
              <button onClick={handleAddTask} className="btn btn-primary">
                Erstellen
              </button>
              <button onClick={() => setShowAddTask(false)} className="btn btn-ghost">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List with Actions */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/50">
            {editingTask?.id === task.id ? (
              // Edit Mode
              <div className="space-y-3">
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 w-full"
                />
                <textarea
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="rounded-md border border-input bg-background px-3 py-2 w-full min-h-[80px]"
                />
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                    className="rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="OPEN">Offen</option>
                    <option value="IN_PROGRESS">In Arbeit</option>
                    <option value="COMPLETED">Erledigt</option>
                  </select>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="LOW">Niedrig</option>
                    <option value="MEDIUM">Mittel</option>
                    <option value="HIGH">Hoch</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Stunden"
                    value={editingTask.estimatedHours || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedHours: parseFloat(e.target.value) || 0 })}
                    className="rounded-md border border-input bg-background px-3 py-2"
                  />
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleUpdateTask(task.id, editingTask)} className="btn btn-primary">
                    Speichern
                  </button>
                  <button onClick={() => setEditingTask(null)} className="btn btn-ghost">
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{task.name}</h4>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {task.assignedUser && (
                        <div className="flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          {task.assignedUser}
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString('de-DE')}
                        </div>
                      )}
                      {task.estimatedHours && (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {task.estimatedHours}h geschätzt
                        </div>
                      )}
                    </div>
                  </div>
                  {canEditTasks && (
                    <div className="flex space-x-1 ml-4">
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1 hover:bg-muted rounded"
                        title="Bearbeiten"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 hover:bg-muted rounded text-red-600"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
