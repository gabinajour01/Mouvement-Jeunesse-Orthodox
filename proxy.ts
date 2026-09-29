import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')

  if (user) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // The session refresh response owns cookie updates in updateSession.
          },
        },
      }
    )

    const { data: allowedUser } = await supabase
      .from('allowed_users')
      .select('id')
      .eq('email', user.email ?? '')
      .maybeSingle()

    if (!allowedUser) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'This account is not authorized to use the application.')
      const redirectResponse = NextResponse.redirect(url)

      for (const cookie of request.cookies.getAll()) {
        if (cookie.name.startsWith('sb-')) redirectResponse.cookies.delete(cookie.name)
      }

      return redirectResponse
    }
  }
  
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check role
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // ignore
          },
        },
      }
    )
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        
      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

  if (user || isLoginPage) {
    supabaseResponse.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
