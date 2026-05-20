import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Allow access to login and auth pages without session
  if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
    return response;
  }

  // Redirect to login if no session and trying to access protected routes
  if (
    !session &&
    (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/api/asesor') ||
      pathname.startsWith('/api/coordinador'))
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Get user role if session exists
  if (session) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = userData?.role;

    // Admin-only routes
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Asesor routes (asesor + admin)
    if (
      pathname.startsWith('/dashboard/asesor') &&
      !['asesor', 'admin'].includes(role!)
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Coordinador routes (coordinador + admin)
    if (
      pathname.startsWith('/dashboard/coordinador') &&
      !['coordinador', 'admin'].includes(role!)
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // API admin routes
    if (pathname.startsWith('/api/admin') && role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // API asesor routes
    if (
      pathname.startsWith('/api/asesor') &&
      !['asesor', 'admin'].includes(role!)
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // API coordinador routes
    if (
      pathname.startsWith('/api/coordinador') &&
      !['coordinador', 'admin'].includes(role!)
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/asesor/:path*',
    '/api/coordinador/:path*',
    '/login',
    '/auth/:path*',
  ],
};
