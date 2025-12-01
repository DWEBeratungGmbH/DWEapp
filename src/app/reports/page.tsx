'use client'

import { useSession } from 'next-auth/react'
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react'

export default function ReportsPage() {
  const { data: session } = useSession()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Controlling</h1>
          <p className="page-subtitle">Reports und Analysen</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Report exportieren
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="content-grid-4 mb-6">
        <div className="card card-kpi">
          <div className="kpi-value">€ 125.430</div>
          <div className="kpi-label">Umsatz (Monat)</div>
          <div className="kpi-trend positive">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            +12.5%
          </div>
        </div>
        <div className="card card-kpi">
          <div className="kpi-value">193</div>
          <div className="kpi-label">Aktive Aufträge</div>
          <div className="kpi-trend positive">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            +8
          </div>
        </div>
        <div className="card card-kpi">
          <div className="kpi-value">87%</div>
          <div className="kpi-label">Auslastung</div>
          <div className="kpi-trend neutral">
            ±0%
          </div>
        </div>
        <div className="card card-kpi">
          <div className="kpi-value">4.2 Tage</div>
          <div className="kpi-label">Ø Bearbeitungszeit</div>
          <div className="kpi-trend positive">
            <TrendingDown className="h-3 w-3 inline mr-1" />
            -0.5 Tage
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="content-grid-2 mb-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Umsatzentwicklung</h3>
          </div>
          <div className="card-content">
            <div className="text-center py-12 text-muted">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chart wird hier angezeigt</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Aufgaben nach Status</h3>
          </div>
          <div className="card-content">
            <div className="text-center py-12 text-muted">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chart wird hier angezeigt</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Verfügbare Reports</h3>
        </div>
        <div className="card-content">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-accent" />
                <span>Umsatzbericht</span>
              </div>
              <button className="btn btn-secondary btn-sm">
                <Download className="h-3 w-3 mr-1" />
                PDF
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent" />
                <span>Zeitauswertung</span>
              </div>
              <button className="btn btn-secondary btn-sm">
                <Download className="h-3 w-3 mr-1" />
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
