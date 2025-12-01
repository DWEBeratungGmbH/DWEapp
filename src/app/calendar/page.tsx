'use client'

import { useSession } from 'next-auth/react'
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export default function CalendarPage() {
  const { data: session } = useSession()
  const today = new Date()
  const monthName = today.toLocaleString('de-DE', { month: 'long', year: 'numeric' })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Kalender</h1>
          <p className="page-subtitle">Termine und Fälligkeiten im Überblick</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Neuer Termin
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="card mb-6">
        <div className="card-content py-3">
          <div className="flex items-center justify-between">
            <button className="btn btn-secondary">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-lg capitalize">{monthName}</span>
            <button className="btn btn-secondary">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Placeholder */}
      <div className="card">
        <div className="card-content">
          <div className="text-center py-12 text-muted">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Der Kalender wird hier angezeigt.</p>
            <p className="text-sm mt-2">Termine aus WeClapp werden automatisch synchronisiert.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
