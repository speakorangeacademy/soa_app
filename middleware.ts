import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Normalize app_metadata role (e.g. "Super Admin" → "super_admin")
function normalizeRole(appRole: string | undefined): string {
    return (appRole || '').toLowerCase().replace(/\s+/g, '_')
}

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
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

    // getSession reads JWT from cookie — zero network calls, no Supabase auth server round-trip
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user ?? null

    const url = new URL(request.url)
    const path = url.pathname

    // Public routes that don't require authentication
    const publicPaths = [
        '/login',
        '/signup',
        '/register',
        '/forgot-password',
        '/auth/callback',
        '/api/courses/public',
        '/api/batches/public',
        '/api/register'
    ]
    const isPublicPath = path === '/' || publicPaths.some(p => path.startsWith(p))

    if (isPublicPath) {
        // Redirect logged-in users to their dashboard using JWT app_metadata (no DB query)
        if (user) {
            const role = normalizeRole(user.app_metadata?.app_role)
            const dest = role === 'super_admin' ? '/super-admin/dashboard' :
                         role === 'admin' ? '/admin/dashboard' :
                         role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'

            if (!path.startsWith(dest)) {
                return NextResponse.redirect(new URL(dest, request.url))
            }
        }
        return response
    }

    if (!user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('error', 'session_expired')
        return NextResponse.redirect(redirectUrl)
    }

    // Role-based route protection using JWT app_metadata — no DB query needed
    const role = normalizeRole(user.app_metadata?.app_role)

    if (path.startsWith('/admin') && role !== 'admin' && role !== 'super_admin') {
        return unauthorizedRedirect(request)
    }
    if (path.startsWith('/super-admin') && role !== 'super_admin') {
        return unauthorizedRedirect(request)
    }
    if (path.startsWith('/teacher') && role !== 'teacher') {
        return unauthorizedRedirect(request)
    }
    if (path.startsWith('/student') && role !== 'student') {
        return unauthorizedRedirect(request)
    }

    return response
}

function unauthorizedRedirect(request: NextRequest, errorType: string = 'unauthorized') {
    const url = new URL('/login', request.url)
    url.searchParams.set('error', errorType)
    return NextResponse.redirect(url)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/auth/callback|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
    ],
}
