'use client'

import { useSession } from 'next-auth/react'
import { Settings, RefreshCw, Database, Bell, Shield, Link2, Check, X } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Einstellungen</h1>
          <p className="page-subtitle">Systemkonfiguration und Integrationen</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* WeClapp Integration */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-accent" />
              <h3 className="card-title">WeClapp Integration</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary">
                <div>
                  <div className="font-medium">Verbindungsstatus</div>
                  <div className="text-sm text-muted">dwe.weclapp.com</div>
                </div>
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="h-4 w-4" />
                  Verbunden
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary">
                <div>
                  <div className="font-medium">Letzte Synchronisation</div>
                  <div className="text-sm text-muted">Vor 5 Minuten</div>
                </div>
                <button className="btn btn-secondary btn-sm">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Jetzt synchronisieren
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-accent" />
              <h3 className="card-title">Datenbank</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-bg-tertiary">
                <div className="text-2xl font-bold">1.000</div>
                <div className="text-sm text-muted">Aufgaben</div>
              </div>
              <div className="p-3 rounded-lg bg-bg-tertiary">
                <div className="text-2xl font-bold">1.000</div>
                <div className="text-sm text-muted">Zeiteinträge</div>
              </div>
              <div className="p-3 rounded-lg bg-bg-tertiary">
                <div className="text-2xl font-bold">193</div>
                <div className="text-sm text-muted">Aufträge</div>
              </div>
              <div className="p-3 rounded-lg bg-bg-tertiary">
                <div className="text-2xl font-bold">860</div>
                <div className="text-sm text-muted">Parties</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              <h3 className="card-title">Benachrichtigungen</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>E-Mail bei neuen Aufgaben</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>Erinnerung bei Fälligkeiten</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>Sync-Fehler melden</span>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <h3 className="card-title">Sicherheit</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary">
                <div>
                  <div className="font-medium">Azure AD</div>
                  <div className="text-sm text-muted">Single Sign-On aktiviert</div>
                </div>
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="h-4 w-4" />
                  Aktiv
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
