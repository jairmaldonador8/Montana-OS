---
name: rbac-authorization-middleware
description: Use when protecting Next.js routes by role and conditionally rendering dashboards for admin, asesor, and coordinador
---

# RBAC Authorization Middleware

## Overview
Protect API routes and redirect unauthorized users using Next.js middleware. Render different dashboards based on user role (Admin, Asesor, Coordinador).

## When to Use
- Protecting routes that should only be accessible to certain roles
- Redirecting users to their role-specific dashboard
- Conditionally rendering UI based on role

## Core Patterns

### 1. Next.js Middleware (Route Protection)

```typescript
// middleware.ts (at root of src/)
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const { data: { session } } = await supabase.auth.getSession();

  // No session: redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Get user role
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const role = user?.role;

  // Route-based access control
  const pathname = request.nextUrl.pathname;

  // Admin-only routes
  if (pathname.startsWith('/dashboard/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Asesor-only routes
  if (pathname.startsWith('/dashboard/asesor')) {
    if (role !== 'asesor' && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Coordinador-only routes
  if (pathname.startsWith('/dashboard/coordinador')) {
    if (role !== 'coordinador' && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
};
```

### 2. Protect API Routes

```typescript
// src/pages/api/admin/team-stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check role
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }

  // Admin-level query
  const { data: stats } = await supabase
    .from('leads')
    .select('asesor_id, etapa')
    .not('asesor_id', 'is', null);

  res.json(stats);
}
```

### 3. Role-Based Dashboard Routes

```typescript
// src/app/dashboard/page.tsx (redirect to role-specific dashboard)
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';

export default function DashboardRedirect() {
  const router = useRouter();
  const { role, loading } = useUserRole();

  useEffect(() => {
    if (!loading && role) {
      // Redirect to role-specific dashboard
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'asesor') {
        router.push('/dashboard/asesor');
      } else if (role === 'coordinador') {
        router.push('/dashboard/coordinador');
      }
    }
  }, [role, loading, router]);

  if (loading) return <div>Loading...</div>;
  return null;
}
```

### 4. Conditional Rendering by Role

```typescript
// src/components/dashboard/DashboardNav.tsx
'use client';

import { useUserRole } from '@/hooks/useUserRole';
import AdminNav from './AdminNav';
import AsesorNav from './AsesorNav';
import CoordinadorNav from './CoordinadorNav';

export function DashboardNav() {
  const { role } = useUserRole();

  // Render different nav per role
  if (role === 'admin') return <AdminNav />;
  if (role === 'asesor') return <AsesorNav />;
  if (role === 'coordinador') return <CoordinadorNav />;

  return null;
}
```

### 5. Create Admin-Only Components

```typescript
// src/components/admin/TeamPerformance.tsx
import { useUserRole } from '@/hooks/useUserRole';

export function TeamPerformance() {
  const { role } = useUserRole();

  if (role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div>
      {/* Admin-only content */}
    </div>
  );
}
```

## Common Mistakes

**Mistake 1:** Only checking role on frontend
- Problem: User can change JWT/localStorage role, bypass UI checks
- Fix: Always verify role on backend (middleware + API routes)

**Mistake 2:** Forgetting to set role on signup
- Problem: New users created without role, can't access anything
- Fix: Trigger auto-assigns 'asesor' role by default (see supabase-auth-rbac skill)

**Mistake 3:** Not caching role in state
- Problem: Fetching role on every page load (slow)
- Fix: Use useUserRole hook with context/state management to cache role

**Mistake 4:** Missing /unauthorized page
- Problem: Users see error page when redirected
- Fix: Create friendly /unauthorized page explaining why access denied

## Implementation Checklist

- [ ] Create middleware.ts with role checks
- [ ] Protect admin API routes
- [ ] Create 3 dashboard routes (/dashboard/admin, /asesor, /coordinador)
- [ ] Create useUserRole hook
- [ ] Create DashboardRedirect page
- [ ] Create role-specific Nav components
- [ ] Create /unauthorized error page
- [ ] Test: asesor can't access /dashboard/admin (redirect to /unauthorized)
- [ ] Test: admin can access all dashboards
