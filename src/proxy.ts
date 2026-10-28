import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt' 

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request })
    const url = request.nextUrl
    const pathname = url.pathname

    // Define which paths are authentication pages
    const isAuthPage = 
        pathname.startsWith('/sign-in') ||
        pathname.startsWith('/sign-up') ||
        pathname.startsWith('/verify') ||
        pathname === '/' // Exact match for root page

    // 1. If user IS logged in and tries to visit sign-in, sign-up, or root ('/'), redirect them to your main app page
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // 2. If user is NOT logged in and tries to visit a protected route (like dashboard), redirect to sign-in
    const isProtectedRoute = pathname.startsWith('/dashboard')
    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // 3. Otherwise, let the user proceed normally (fixes the loop/lockout issue)
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/',
        '/sign-in',
        '/sign-up',
        '/dashboard/:path*',
        '/verify/:path*'
    ]
}