"use client"

import { useState } from 'react'
import { User, Bell, Shield, Database } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Benachrichtigungen', icon: Bell },
    { id: 'security', name: 'Sicherheit', icon: Shield },
    { id: 'data', name: 'Daten & API', icon: Database },
  ]

  return (
    <div className="space-y-6 p-6">
      <h1 className="page-title">Einstellungen</h1>

      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted hover:text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>

      <div className="card">
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="card-title">Profil-Einstellungen</h2>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input type="text" className="input mt-1" defaultValue="Max Mustermann" />
            </div>
            <div>
              <label className="text-sm font-medium">E-Mail</label>
              <input type="email" className="input mt-1" defaultValue="max@mustermann.de" />
            </div>
            <button className="btn btn-primary">Speichern</button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="card-title">Benachrichtigungen</h2>
            <p className="text-sm text-muted">
              Legen Sie fest, welche Benachrichtigungen Sie erhalten möchten.
            </p>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="text-sm">E-Mail-Benachrichtigungen für neue Aufträge</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox" defaultChecked />
                <span className="text-sm">Wöchentlicher Bericht</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-sm">Browser-Push-Benachrichtigungen</span>
              </label>
            </div>
            <button className="btn btn-primary">Speichern</button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h2 className="card-title">Sicherheit</h2>
            <div>
              <label className="text-sm font-medium">Aktuelles Passwort</label>
              <input type="password" className="input mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Neues Passwort</label>
              <input type="password" className="input mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Passwort bestätigen</label>
              <input type="password" className="input mt-1" />
            </div>
            <button className="btn btn-primary">Passwort ändern</button>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            <h2 className="card-title">Daten & API</h2>
            <div>
              <label className="text-sm font-medium">WeClapp API-Schlüssel</label>
              <input type="password" className="input mt-1" defaultValue="sk-1234567890abcdef" />
              <p className="mt-1 text-xs text-muted">
                Ihr API-Schlüssel wird sicher gespeichert und niemals geteilt.
              </p>
            </div>
            <button className="btn btn-primary">API-Schlüssel speichern</button>
          </div>
        )}
      </div>
    </div>
  )
}
