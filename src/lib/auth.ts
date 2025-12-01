// Auth Configuration - Microsoft Azure AD Login
// Types are defined in src/types/auth.d.ts

import NextAuth from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { logLogin, updateUserLogin } from '@/lib/audit'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID || process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID!,
    }),
  ],
  callbacks: {
    // JWT: Store user data in token (only on login, not every request)
    // Note: weClappUserId is NOT stored here - it's loaded when needed for data queries
    jwt: async ({ token, user, trigger }: { token: any; user?: any; trigger?: string }) => {
      // On login: Store user data in token
      if (user) {
        token.id = user.id
        token.role = user.role || 'USER'
        token.department = user.department || null
        console.log('[Auth] JWT token created for:', user.email)
      }
      
      // On explicit update trigger: Refresh user data from DB
      if (trigger === 'update' && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, department: true }
          })
          if (dbUser) {
            token.role = dbUser.role
            token.department = dbUser.department
            console.log('[Auth] JWT token updated for user:', token.id)
          }
        } catch (error) {
          console.error('[Auth] JWT update error:', error)
        }
      }
      
      return token
    },
    
    // Session: Read from JWT only (NO database query!)
    // Note: weClappUserId is loaded separately when needed for WeClapp data
    session: async ({ session, token }: { session: any; token: any }) => {
      if (session?.user && token) {
        session.user.id = token.id || token.sub
        session.user.role = token.role || 'USER'
        session.user.department = token.department || null
      }
      return session
    },
    
    // SignIn: Link Azure AD account to existing user if needed
    signIn: async ({ user, account }: { user: any; account: any }) => {
      if (!account || account.provider !== 'azure-ad' || !user?.email) {
        return true
      }

      try {
        // Check if account already exists
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          }
        })

        if (existingAccount) {
          console.log('[Auth] Azure AD account exists, login OK')
          return true
        }

        // Check if user with this email exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })

        if (existingUser) {
          // Link account to existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state
            }
          })
          console.log('[Auth] Azure AD account linked to existing user:', user.email)
          return true
        }
        
        // New user - PrismaAdapter will create it
        console.log('[Auth] New user will be created:', user.email)
        return true
        
      } catch (error) {
        console.error('[Auth] SignIn error:', error)
        
        // Log failed login
        await logLogin({
          email: user?.email || 'unknown',
          action: 'LOGIN_FAILED',
          provider: account?.provider,
          errorReason: error instanceof Error ? error.message : 'Unknown error'
        })
        
        return false
      }
    },
  },
  events: {
    // Nach erfolgreichem Login
    async signIn({ user, account }: { user: any; account: any }) {
      if (user?.id && user?.email) {
        // Login protokollieren
        await logLogin({
          userId: user.id,
          email: user.email,
          action: 'LOGIN_SUCCESS',
          provider: account?.provider
        })
        
        // User-Statistiken aktualisieren
        await updateUserLogin(user.id)
      }
    },
    // Bei Logout
    async signOut({ token }: { token: any }) {
      if (token?.email) {
        await logLogin({
          userId: token.id as string,
          email: token.email as string,
          action: 'LOGOUT'
        })
      }
    }
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/',
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)
