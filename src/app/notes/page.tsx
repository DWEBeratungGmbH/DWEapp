'use client'

import { useSession } from 'next-auth/react'
import { StickyNote, Plus, Search } from 'lucide-react'

export default function NotesPage() {
  const { data: session } = useSession()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Notizen</h1>
          <p className="page-subtitle">Ihre persönlichen Notizen und Memos</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Neue Notiz
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="card-content py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <input 
              type="text" 
              placeholder="Notizen durchsuchen..." 
              className="input pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Alle Notizen</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-12 text-muted">
            <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sie haben noch keine Notizen erstellt.</p>
            <button className="btn btn-primary mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Erste Notiz erstellen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
