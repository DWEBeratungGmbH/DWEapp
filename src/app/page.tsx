'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

const APP_VERSION = 'v2.2'
const APP_BUILD_DATE = '01.12.2025'

function HomeContent() {
  const { data: session, status } = useSession()
  const [isRetrying, setIsRetrying] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (status === 'authenticated') {
      window.location.href = '/dashboard'
    }
  }, [status])

  useEffect(() => {
    if (error === 'OAuthCreateAccount' && !isRetrying) {
      setIsRetrying(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    }
  }, [error, isRetrying])

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  const handleMicrosoftSignIn = () => {
    signIn('azure-ad', { 
      callbackUrl: '/dashboard',
      redirect: true 
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="card max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">
          DWE App
        </h1>
        <p className="text-secondary mb-8">
          Bitte melden Sie sich mit Ihrem Microsoft-Konto an
        </p>

        {error === 'OAuthCreateAccount' && (
          <div className="badge-warning rounded-md p-4 mb-6 flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Erstanmeldung wird vorbereitet...</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        <Button
          onClick={handleMicrosoftSignIn}
          className="w-full"
          disabled={isRetrying}
        >
          <ShieldCheck className="h-4 w-4 mr-2" />
          {isRetrying ? 'Wird vorbereitet...' : 'Mit Microsoft anmelden'}
        </Button>

        <div className="mt-8 text-xs text-secondary">
          <p>DWE App {APP_VERSION}</p>
          <p>Build: {APP_BUILD_DATE}</p>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
