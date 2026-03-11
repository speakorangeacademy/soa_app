import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const session = !!user

    const url = new URL(request.url)
    const path = url.pathname
    console.log(`[MIDDLEWARE] Request for: ${path}`)

    // Public routes that don't require authentication
    const publicPaths = [
        '/login', 
        '/signup', 
        '/register', 
        '/forgot-password', 
        '/auth/callback', 
        '/api/courses/public',
        '/api/register'
    ]
    const isPublicPath = path === '/' || publicPaths.some(p => path.startsWith(p))

    if (isPublicPath) {
        if (session && user) {
            // Use the unified 'users' table - much faster
            const { data: appUser } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (appUser) {
                const rawRole = appUser.role || ''
                const role = rawRole.toLowerCase().replace(/\s+/g, '_')
                const dest = role === 'super_admin' ? '/super-admin/dashboard' : 
                             role === 'admin' ? '/admin/dashboard' : 
                             role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'
                
                // ONLY redirect if we are NOT already going to the destination or its sub-pages
                if (!path.startsWith(dest)) {
                    return NextResponse.redirect(new URL(dest, request.url))
                }
            }
        }
        return response
    }

    if (!session || !user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('error', 'session_expired')
        return NextResponse.redirect(redirectUrl)
    }

    // Resolve Role from unified users table
    const { data: appUser, error: roleError } = await supabase
        .from('users')
        .select('role, status')
        .eq('id', user.id)
        .single()

    if (roleError || !appUser || appUser.status !== 'Active') {
        console.log(`[MIDDLEWARE] Unauthorized access attempt for ${user.id}. Role error: ${roleError?.message}`)
        return unauthorizedRedirect(request, 'account_not_found')
    }

    const rawRole = appUser.role || ''
    const role = rawRole.toLowerCase().replace(/\s+/g, '_')

    // Role-based route protection
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
