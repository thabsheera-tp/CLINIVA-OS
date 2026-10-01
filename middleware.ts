import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Role → route mapping for redirects after login
const ROLE_ROUTES: Record<string, string> = {
  doctor: '/doctor',
  front_desk: '/front-desk',
  nurse: '/nursing',
  pharmacist: '/pharmacy',
  lab_tech: '/lab',
  cashier: '/billing',
  admin: '/admin',
  canteen: '/canteen',
  patient: '/portal',
}

// Protected route prefixes — require authentication and role authorization
const PROTECTED_PREFIXES = [
  '/doctor', '/front-desk', '/nursing', '/pharmacy',
  '/lab', '/billing', '/admin', '/canteen',
]

// Public routes — never redirect
const PUBLIC_ROUTES = ['/login', '/onboarding', '/_next', '/api', '/favicon', '/portal/qr']

// Demo users map for offline/demo RBAC verification
const DEMO_USERS: Record<string, { role: string; roles: string[]; email: string }> = {
  doctor: { role: 'doctor', roles: ['doctor'], email: 'doctor@cliniva.os' },
  front_desk: { role: 'front_desk', roles: ['front_desk'], email: 'reception@cliniva.os' },
  nurse: { role: 'nurse', roles: ['nurse'], email: 'nurse@cliniva.os' },
  pharmacist: { role: 'pharmacist', roles: ['pharmacist'], email: 'pharmacy@cliniva.os' },
  lab_tech: { role: 'lab_tech', roles: ['lab_tech'], email: 'lab@cliniva.os' },
  cashier: { role: 'cashier', roles: ['cashier'], email: 'billing@cliniva.os' },
  admin: { role: 'admin', roles: ['admin', 'doctor'], email: 'admin@cliniva.os' },
  canteen: { role: 'canteen', roles: ['canteen'], email: 'canteen@cliniva.os' },
  patient: { role: 'patient', roles: ['patient'], email: 'patient@cliniva.os' },
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh the Supabase session
  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data?.session ?? null
  } catch {
    // Supabase offline / placeholder
  }

  const { pathname } = request.nextUrl
  const isDemoModeEnabled = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'
  const authUserKey = request.cookies.get('cliniva_auth_user')?.value
  const demoRoleCookie = request.cookies.get('cliniva_demo_role')?.value

  // Determine authentication status and assigned roles
  const assignedRoles: string[] = []
  let isAuthenticated = false

  if (session?.user) {
    isAuthenticated = true
    const meta = session.user.user_metadata || {}
    if (Array.isArray(meta.roles)) {
      assignedRoles.push(...meta.roles)
    }
    if (meta.role && !assignedRoles.includes(meta.role)) {
      assignedRoles.push(meta.role)
    }
  } else if (isDemoModeEnabled && (authUserKey || demoRoleCookie)) {
    // Authenticated demo user
    const key = authUserKey || demoRoleCookie
    const demoUser = key ? DEMO_USERS[key] : null
    if (demoUser) {
      isAuthenticated = true
      assignedRoles.push(...demoUser.roles)
    }
  }

  // Fallback if authenticated but no role defined
  if (isAuthenticated && assignedRoles.length === 0) {
    assignedRoles.push('doctor')
  }

  // 1. Handle Public Routes
  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
    // If logged-in user visits /login, redirect directly to their primary authorized dashboard.
    // (Role Selection Screen is hidden from authenticated users).
    if (pathname === '/login' && isAuthenticated) {
      const primaryRole = assignedRoles[0]
      const dest = primaryRole ? (ROLE_ROUTES[primaryRole] ?? '/doctor') : '/doctor'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return response
  }

  // 2. Handle Protected Workspace Routes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected) {
    // A. Unauthenticated users cannot access protected clinical workspaces
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // B. Authenticated users: enforce RBAC strictly
    const targetEntry = Object.entries(ROLE_ROUTES).find(([_, path]) => pathname.startsWith(path))
    if (targetEntry) {
      const [requiredRole] = targetEntry
      const hasPermission = assignedRoles.includes(requiredRole)

      if (!hasPermission) {
        // Block unauthorized workspace access and redirect to authorized primary dashboard
        const primaryRole = assignedRoles[0]
        const safeDest = primaryRole ? (ROLE_ROUTES[primaryRole] ?? '/doctor') : '/login'
        return NextResponse.redirect(new URL(safeDest, request.url))
      }

      // If authorized multi-role user switches, keep demo role cookie in sync with active workspace
      if (isDemoModeEnabled && demoRoleCookie !== requiredRole) {
        response.cookies.set('cliniva_demo_role', requiredRole, { path: '/', maxAge: 86400, sameSite: 'lax' })
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|stitch-exports|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
