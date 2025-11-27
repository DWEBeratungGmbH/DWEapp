import { DefaultSession } from 'next-auth'

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
    } & DefaultSession['user']
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
