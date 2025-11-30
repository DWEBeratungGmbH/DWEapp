'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  useEffect(() => {
    if (session) {
      router.push(callbackUrl)
    }
  }, [session, router, callbackUrl])

  const handleMicrosoftSignIn = () => {
    setIsLoading(true)
    setError(null)
    
    signIn('azure-ad', { 
      callbackUrl,
      redirect: true 
    }).catch((error) => {
      setError('Anmeldung fehlgeschlagen')
      setIsLoading(false)
    })
  }

  if (session) {
    return (
      <div className="page-centered">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="page-centered">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">
            Anmelden bei DWE App
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Melde dich mit deinem Microsoft-Konto an
          </p>
        </div>

        {error && (
          <div className="badge-error rounded-md p-4 mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleMicrosoftSignIn}
          disabled={isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Mit Microsoft anmelden
        </button>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="page-centered">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
