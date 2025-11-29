import NextAuth, { DefaultSession } from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }
  
  interface User {
    role: string
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  callbacks: {
    session: async ({ session, token }: { session: any; token: any }) => {
      if (session?.user && token?.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub }
          })
          
          if (dbUser) {
            session.user.id = dbUser.id
            session.user.role = dbUser.role // Rolle aus Datenbank verwenden
          }
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }
      return session
    },
    jwt: async ({ token, user }: { token: any; user: any }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    signIn: async ({ user, account, profile }: { user: any; account: any; profile?: any }) => {
      if (account?.provider === 'azure-ad' && user?.email) {
        try {
          // Prüfen ob Account bereits existiert
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId
              }
            }
          })

          if (existingAccount) {
            console.log('✅ Azure AD Account existiert bereits')
            return true
          }

          // Prüfen ob Benutzer bereits existiert
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (existingUser) {
            // Account mit existierendem Benutzer verknüpfen
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
            
            console.log('✅ Azure AD Account mit existierendem Benutzer verknüpft')
            return true
          }
        } catch (error) {
          console.error('❌ Fehler beim Verknüpfen des Accounts:', error)
          return false
        }
      }
      return true
    },
  },
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/',
  },
}

export default NextAuth(authOptions)
