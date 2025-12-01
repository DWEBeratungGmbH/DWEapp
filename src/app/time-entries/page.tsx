'use client'

import { useSession } from 'next-auth/react'
import { Clock, Download, Filter, Users } from 'lucide-react'

export default function TimeEntriesPage() {
  const { data: session } = useSession()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Zeiterfassung</h1>
          <p className="page-subtitle">Team-Zeitbuchungen verwalten</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="content-grid-4 mb-6">
        <div className="card card-kpi">
          <div className="kpi-value">1.000</div>
          <div className="kpi-label">Zeiteinträge</div>
        </div>
        <div className="card card-kpi">
          <div className="kpi-value">2.450h</div>
          <div className="kpi-label">Gesamtstunden</div>
        </div>
        <div className="card card-kpi">
          <div className="kpi-value">19</div>
          <div className="kpi-label">Mitarbeiter</div>
        </div>
        <div className="card card-kpi">
          <div className="kpi-value">85%</div>
          <div className="kpi-label">Abrechenbar</div>
        </div>
      </div>

      {/* Time Entries List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Alle Zeiteinträge</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-12 text-muted">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Die Zeiteinträge des Teams werden hier angezeigt.</p>
            <p className="text-sm mt-2">Daten werden aus WeClapp synchronisiert.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
