// Admin API-Einstellungen Tab
// Zeigt API-Konfiguration

'use client'

import { Database, Key, Copy, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'

export function AdminApiTab() {
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('sk-dweapp_2024_abc123def456')
    toast.success('API-Schlüssel kopiert')
  }

  const handleTestConnection = () => {
    toast.success('API-Verbindung erfolgreich')
  }

  const handleGenerateNewKey = () => {
    if (confirm('Möchtest du wirklich einen neuen API-Schlüssel generieren? Der alte Schlüssel wird ungültig.')) {
      toast.success('Neuer API-Schlüssel generiert')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          API-Einstellungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* WeClapp API */}
        <div className="p-4 border rounded-lg border-[var(--border)]">
          <h3 className="font-medium mb-2">WeClapp API</h3>
          <p className="text-sm text-muted mb-3">
            Konfiguration der WeClapp-API-Verbindung
          </p>
          <div className="space-y-3">
            <div>
              <Label>API Endpunkt</Label>
              <Input 
                placeholder="https://demo.weclapp.com/webapp/api/v1/" 
                defaultValue={process.env.NEXT_PUBLIC_WECLAPP_API_URL || ''}
              />
            </div>
            <div>
              <Label>API Token</Label>
              <Input 
                type="password" 
                placeholder="••••••••••••••••" 
              />
            </div>
            <button 
              onClick={handleTestConnection}
              className="btn btn-primary"
            >
              <Key className="h-4 w-4 mr-2" />
              API-Verbindung testen
            </button>
          </div>
        </div>

        {/* Interner API-Schlüssel */}
        <div className="p-4 border rounded-lg border-[var(--border)]">
          <h3 className="font-medium mb-2">Interner API-Schlüssel</h3>
          <p className="text-sm text-muted mb-3">
            Für externe Integrationen und Webhooks
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input 
                value="sk-dweapp_2024_abc123def456" 
                readOnly 
                className="font-mono text-sm"
              />
              <button 
                onClick={handleCopyApiKey}
                className="btn btn-outline"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted">
              Erstellt am: 01.01.2024 | Läuft ab: 01.01.2025
            </p>
            <button 
              onClick={handleGenerateNewKey}
              className="btn btn-secondary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Neuen Schlüssel generieren
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
