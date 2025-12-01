'use client'

import { useSession } from 'next-auth/react'
import { FileStack, Plus, Copy, Edit, Trash2 } from 'lucide-react'

export default function TemplatesPage() {
  const { data: session } = useSession()

  const templateCategories = [
    { title: 'Aufgaben-Vorlagen', count: 0 },
    { title: 'Projekt-Vorlagen', count: 0 },
    { title: 'E-Mail-Vorlagen', count: 0 },
    { title: 'Checklisten', count: 0 },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Vorlagen</h1>
          <p className="page-subtitle">Wiederverwendbare Vorlagen verwalten</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Neue Vorlage
          </button>
        </div>
      </div>

      {/* Template Categories */}
      <div className="content-grid-2 mb-6">
        {templateCategories.map((category) => (
          <div key={category.title} className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileStack className="h-5 w-5 text-accent" />
                  <span className="font-medium">{category.title}</span>
                </div>
                <span className="text-xl font-bold">{category.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Templates List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Alle Vorlagen</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-12 text-muted">
            <FileStack className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Vorlagen erstellt.</p>
            <button className="btn btn-primary mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Erste Vorlage erstellen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
