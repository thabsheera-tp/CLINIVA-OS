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

// Protected route prefixes — require authentication
const PROTECTED_PREFIXES = [
  '/doctor', '/front-desk', '/nursing', '/pharmacy',
  '/lab', '/billing', '/admin', '/canteen', '/portal',
]

// Public routes — never redirect
const PUBLIC_ROUTES = ['/login', '/onboarding', '/_next', '/api', '/favicon']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Refresh the session (keeps it alive, syncs cookies)
  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data?.session ?? null
  } catch {
    // Supabase offline / placeholder
  }

  const demoRole = request.cookies.get('cliniva_demo_role')?.value
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
    // If logged-in user hits /login without explicit switch request, redirect to their dashboard
    if (pathname === '/login' && session && !request.nextUrl.searchParams.has('switch')) {
      const role = session.user.user_metadata?.role as string | undefined
      const dest = role ? (ROLE_ROUTES[role] ?? '/login') : '/login'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return response
  }

  // Demo mode: only auto-grant access when NEXT_PUBLIC_DEMO_MODE=true
  // NEVER allow this bypass in production — gate it with the env flag
  const isDemoModeEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const targetEntry = Object.entries(ROLE_ROUTES).find(([_, path]) => pathname.startsWith(path))
  if (isDemoModeEnabled && !session && targetEntry) {
    const [targetRole] = targetEntry
    if (demoRole !== targetRole) {
      response.cookies.set('cliniva_demo_role', targetRole, { path: '/', maxAge: 86400 })
    }
    return response
  }

  // Require authentication for other protected routes if any
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control — prevent cross-role access for authenticated users
  if (session && isProtected) {
    const role = session.user.user_metadata?.role as string | undefined
    const allowedPrefix = role ? ROLE_ROUTES[role] : null

    if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url))
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
