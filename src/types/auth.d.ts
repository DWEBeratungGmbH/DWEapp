// NextAuth Type Declarations
// WeClapp is NOT part of auth - it's only for data linking

import 'next-auth'
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      department?: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    department?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    department?: string | null
  }
}
