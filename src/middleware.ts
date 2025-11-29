import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
  // For now, skip auth check in middleware
  // We'll handle auth in the components
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Better Auth API routes)
     * - api/userMatching (User Matching API - für Entwicklung)
     * - api/users (Users API - für Entwicklung)
     * - api/users/list (Users List API - für Entwicklung)
     * - api/test-email (Test Email API - für Entwicklung)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - auth (authentication pages)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|api/userMatching|api/users|_next/static|_next/image|auth|favicon.ico).*)",
  ],
}
