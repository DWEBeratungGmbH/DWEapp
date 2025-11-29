'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'valid' | 'error' | 'success'>('loading')
  const [invitation, setInvitation] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    checkToken()
  }, [])

  const checkToken = async () => {
    try {
      const response = await fetch(`/api/invite?token=${params.token}`)
      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        toast.error(data.error || 'Ungültige Einladung')
        return
      }

      setInvitation(data.result)
      setStatus('valid')
    } catch (error) {
      setStatus('error')
      toast.error('Fehler beim Laden der Einladung')
    }
  }

  const handleAcceptAndLogin = async () => {
    if (!invitation?.email) {
      toast.error('Einladung nicht gefunden')
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/invite', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: params.token,
          email: invitation.email,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Akzeptieren')
      }

      toast.success('Einladung akzeptiert! Weiterleitung zu Microsoft...')
      
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)

    } catch (error: any) {
      toast.error(error.message)
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-secondary">Einladung wird geprüft...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="card max-w-md w-full text-center">
          <div className="badge-error p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Einladung ungültig</h1>
          <p className="text-secondary mb-6">
            Diese Einladung ist entweder abgelaufen oder existiert nicht mehr.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-outline"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Startseite
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="card max-w-md w-full">
        <div className="text-center">
          <div className="badge-info p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-2 text-2xl font-bold">
            Herzlich Willkommen!
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Du wurdest eingeladen als <span className="font-medium">{invitation?.email || 'Unbekannt'}</span>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="badge-info rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">
              Microsoft Login
            </h3>
            <p className="text-sm">
              Bitte melde dich mit deinem Microsoft 365 Konto an, um die Einladung anzunehmen.
            </p>
          </div>

          <button
            onClick={handleAcceptAndLogin}
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.5 0L0 0V10.5H10.5V0Z" fill="#F25022"/>
                  <path d="M21 0L10.5 0V10.5H21V0Z" fill="#7FBA00"/>
                  <path d="M10.5 10.5L0 10.5V21H10.5V10.5Z" fill="#00A4EF"/>
                  <path d="M21 10.5L10.5 10.5V21H21V10.5Z" fill="#FFB900"/>
                </svg>
                Mit Microsoft anmelden
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
