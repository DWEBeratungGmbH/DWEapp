import { NextAuthOptions } from 'next-auth'
import MicrosoftProvider from 'next-auth/providers/azure-ad'

export const authOptions: NextAuthOptions = {
  providers: [
    MicrosoftProvider({
      clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: 'openid profile email User.Read'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user }: any) {
      // Microsoft AD Token speichern
      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
      }
      
      // User Matching durchführen
      if (user?.email) {
        try {
          // User Matching API aufrufen
          const matchingResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/userMatching`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (matchingResponse.ok) {
            const matchingData = await matchingResponse.json()
            const matchedUser = matchingData.users.find((u: any) => 
              u.email.toLowerCase() === user.email?.toLowerCase()
            )
            
            if (matchedUser) {
              token.weClappUserId = matchedUser.weClappUserId
              token.role = matchedUser.role
              token.department = matchedUser.department
              console.log(`User ${user.email} gematched mit WeClapp User ${matchedUser.weClappUserId} als ${matchedUser.role}`)
            }
          }
        } catch (error) {
          console.error('User Matching Error:', error)
        }
      }
      
      return token
    },
    
    async session({ session, token }: any) {
      // Session mit WeClapp Daten anreichern
      if (token) {
        session.user.id = token.sub!
        session.user.email = token.email!
        session.user.name = token.name!
        session.user.weClappUserId = token.weClappUserId as string
        session.user.role = token.role as string
        session.user.department = token.department as string
      }
      
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}
