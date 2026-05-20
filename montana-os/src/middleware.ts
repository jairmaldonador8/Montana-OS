import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;

  // Allow login and auth routes without session
  if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
    return response;
  }

  // Allow /api/leads/create without session (public endpoint)
  if (pathname === '/api/leads/create') {
    return response;
  }

  // Redirect to login if no session
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Get user role for protected routes
  if (session && (pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/asesor') || pathname.startsWith('/api/coordinador'))) {
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error || !user) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    const role = user.role;

    // Admin-only routes
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Asesor routes (asesor + admin)
    if (pathname.startsWith('/dashboard/asesor') && !['asesor', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Coordinador routes (coordinador + admin)
    if (pathname.startsWith('/dashboard/coordinador') && !['coordinador', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // API admin routes
    if (pathname.startsWith('/api/admin') && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // API asesor routes
    if (pathname.startsWith('/api/asesor') && !['asesor', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // API coordinador routes
    if (pathname.startsWith('/api/coordinador') && !['coordinador', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/login', '/auth/:path*'],
};
