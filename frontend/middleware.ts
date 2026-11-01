import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const pathname = request.nextUrl.pathname

  // Public routes that don't need auth
  const publicRoutes = ['/auth/login', '/auth/register', '/first-admin']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Admin routes - only super_admin
  const isAdminRoute = pathname.startsWith('/admin')

  // Dashboard routes - customer or super_admin
  const isDashboardRoute = pathname.startsWith('/dashboard')

  // If no token and trying to access protected routes, redirect to login
  if (!token && !isPublicRoute && !pathname.startsWith('/auth/') && pathname !== '/' && !pathname.startsWith('/f/')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If token exists and trying to access first-admin, redirect to admin or login
  if (token && pathname === '/first-admin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // If token exists and trying to access auth pages, redirect based on role
  // We can't check role in middleware without decoding JWT, so let client handle it

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/first-admin', '/auth/login', '/auth/register', '/'],
}
