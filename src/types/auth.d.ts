import type { User } from 'better-auth/types'

declare module 'better-auth/types' {
  interface User {
    role?: string
    department?: string
    weClappUserId?: string
  }
}
