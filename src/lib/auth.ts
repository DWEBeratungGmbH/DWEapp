import { NextAuthOptions } from 'next-auth'
import MicrosoftProvider from 'next-auth/providers/azure-ad'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      department?: string
      weClappUserId?: string
      dbUserId?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    department?: string
    weClappUserId?: string
  }

  interface JWT {
    accessToken?: string
    idToken?: string
    dbUserId?: string
    userRole?: string
    userDepartment?: string
    weClappUserId?: string
  }
}

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
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@dwe.de" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Admin-Zugänge für lokale Entwicklung
        if (
          credentials?.email === "sebastian@dwe-beratung.de" ||
          credentials?.email === "admin@dwe.de"
        ) {
          if (credentials?.password === "admin123") {
            return {
              id: credentials.email === "sebastian@dwe-beratung.de" ? "1" : "2",
              name: credentials.email === "sebastian@dwe-beratung.de" ? "Sebastian DWE" : "Admin User",
              email: credentials.email,
              role: "ADMIN",
              department: "Management"
            }
          }
        }
        
        return null
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
      
      // Admin-Rechte für Sebastian erzwingen
      if (user?.email === 'sebastian@dwe-beratung.de' || token?.email === 'sebastian@dwe-beratung.de') {
        token.role = 'ADMIN'
        token.userRole = 'ADMIN'
      }

      // User in Datenbank suchen/erstellen
      if (user?.email) {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          // Wenn User nicht existiert, prüfen ob eine Einladung vorliegt
          if (!dbUser) {
            const invitation = await prisma.invitation.findFirst({
              where: { 
                email: user.email,
                isUsed: false,
                expiresAt: { gt: new Date() }
              },
              include: { invitedBy: true }
            })

            if (invitation) {
              // User aus Einladung erstellen (mit WeClapp-Daten)
              dbUser = await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name || user.email,
                  role: 'USER',
                  isActive: true
                }
              })

              // Einladung als verwendet markieren
              await prisma.invitation.update({
                where: { id: invitation.id },
                data: { isUsed: true }
              })

              console.log(`User ${user.email} aus Einladung erstellt`)
            } else {
              // Keine Einladung gefunden - Zugriff verweigern
              console.log(`Keine Einladung für ${user.email} gefunden`)
              throw new Error('Keine gültige Einladung gefunden')
            }
          }

          // User Matching mit WeClapp durchführen
          const matchingResponse = await fetch('http://127.0.0.1:3000/api/userMatching', {
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
              // WeClapp-Daten in Datenbank aktualisieren
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  weClappUserId: matchedUser.weClappUserId,
                  department: matchedUser.department,
                  role: matchedUser.role
                }
              })
              
              token.weClappUserId = matchedUser.weClappUserId
              token.role = matchedUser.role
              token.department = matchedUser.department
              console.log(`User ${user.email} gematched mit WeClapp User ${matchedUser.weClappUserId} als ${matchedUser.role}`)
            }
          }

          // User-Daten in Token speichern
          token.dbUserId = dbUser.id
          token.userRole = dbUser.role
          token.userDepartment = dbUser.department
          token.weClappUserId = dbUser.weClappUserId
          
        } catch (error) {
          console.error('User Database Error:', error)
          throw error
        }
      }
      
      return token
    },
    
    async session({ session, token }: any) {
      // Session mit Datenbank-Daten anreichern
      if (token) {
        session.user.id = token.sub!
        session.user.email = token.email!
        session.user.name = token.name!
        session.user.dbUserId = token.dbUserId
        session.user.role = token.userRole
        session.user.department = token.userDepartment
        session.user.weClappUserId = token.weClappUserId
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
