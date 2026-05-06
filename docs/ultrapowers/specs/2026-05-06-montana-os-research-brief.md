# Research Brief: RBAC System Implementation with Next.js & Supabase

**Date:** 2026-05-06  
**Topic:** Role-Based Access Control, Authentication, and Authorization  
**Scope:** Montana OS - Real Estate CRM with agents, admins, and publishers

---

## Executive Summary

Building a secure, production-grade RBAC system requires a layered approach:
1. **Database layer** (Supabase RLS) - Default-deny, always enabled
2. **API layer** (Next.js middleware + route handlers) - Permission validation
3. **Application layer** (TypeScript types + frontend guards) - UX and type safety
4. **Audit layer** (Transactional logging) - Compliance and debugging

Current best practices (2026) emphasize **security at the data layer** over middleware. RLS is non-negotiable; everything else is belt-and-suspenders.

---

## 1. Supabase Row Level Security (RLS) - Best Practices

### Key Findings

**1.1 Default-Deny Model**
- When RLS is enabled on a table with no policies → zero rows returned
- This is the correct default. Explicitly allow, never deny implicitly.
- Source: [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)

**1.2 Policy Structure**
```sql
-- SELECT and DELETE use USING clause
CREATE POLICY "agent_view_own" ON propiedades
  FOR SELECT USING (user_id = auth.uid());

-- INSERT uses WITH CHECK only
CREATE POLICY "agent_create" ON propiedades
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- UPDATE needs BOTH USING and WITH CHECK
CREATE POLICY "agent_update" ON propiedades
  FOR UPDATE
  USING (user_id = auth.uid())           -- Can only update own records
  WITH CHECK (user_id = auth.uid());     -- Updated values must maintain ownership
```
Source: [Supabase RLS Best Practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices)

**1.3 Performance Critical: Index Your Policy Columns**
- Missing indexes on columns used in RLS policies cause **severe performance degradation**
- For Montana OS: Index on `user_id`, `estado`, `creado_por_nombre`
- This is the #1 performance killer in production RLS setups
- Source: [Supabase Production Patterns](https://designrevision.com/blog/supabase-row-level-security)

**1.4 JWT Security - Don't Trust user_metadata**
- ❌ Never base RLS policies on `auth.jwt() -> 'user_metadata'`
- Users can modify metadata; it's not secure for authorization
- ✅ Use `auth.jwt() -> 'role'` only if set via Custom Access Token Hook
- ✅ Better: Join with your `usuarios` table for the source of truth
- Source: [Token Security](https://supabase.com/docs/guides/auth/oauth-server/token-security)

**1.5 Testing RLS Policies**
- ❌ Don't test in SQL Editor - RLS is bypassed there
- ✅ Test via client SDK or use `impersonation` feature in Supabase Studio
- ✅ Automate with `supabase test db` using pgTap
- Source: [RLS Debugging Guide](https://dev.to/whoffagents/supabase-row-level-security-in-production-patterns-that-actually-work-2l78)

### Montana OS Recommendation

**Implement RLS at two levels:**

1. **Role-based access** (readable, auditable)
   ```sql
   CREATE POLICY "admin_see_all" ON propiedades
     FOR SELECT USING (
       (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
     );
   ```

2. **Row-level ownership** (fallback for agents)
   ```sql
   CREATE POLICY "agent_see_own" ON propiedades
     FOR SELECT USING (user_id = auth.uid());
   ```

**Gotchas:**
- Policies are OR'd together (all matching policies allow access)
- UPDATE needs `USING` (can update?) and `WITH CHECK` (result valid?)
- Don't over-optimize; focus on correctness first, then profile with slow query log

---

## 2. Next.js Middleware & Authorization

### Key Findings

**2.1 Middleware Role (2026 Best Practice)**
Middleware is for **routing and authentication checks only**, NOT authorization.

```
Middleware: ✅ "Is this request authenticated?"
            ❌ "Does user X have permission to see resource Y?"
```

Authorization decisions must happen where data is accessed (RLS, API handlers).
Source: [Next.js Middleware Guide](https://nextjs.im/docs/14/app/building-your-application/routing/middleware/)

**2.2 Middleware Pattern for Montana OS**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const publicRoutes = ['/login', '/'];
const protectedRoutes = ['/propiedades', '/api/propiedades'];

export async function middleware(request: NextRequest) {
  // 1. Check authentication (fast, routing decision)
  const session = await getSession(request);
  
  if (!session && protectedRoutes.some(r => request.nextUrl.pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Route based on role (optimization, not security)
  if (session?.user?.role === 'agent' && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/propiedades', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

**2.3 Real Authorization: In Route Handlers**
```typescript
// app/api/propiedades/[id]/route.ts
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Check permission (RLS does this, but verify in code too)
  const { data: property } = await supabase
    .from('propiedades')
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (property.user_id !== user.id && !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Proceed (RLS already prevents unauthorized updates)
  // ...
}
```

Source: [Next.js Auth Best Practices](https://nextjs.org/docs/app/guides/authentication)

**2.4 Key Security Principle**
- Middleware can optimize UX (redirect admins away from agent dashboards)
- But middleware cannot prevent a determined attacker
- RLS + API validation are your actual security

---

## 3. Type-Safe Permissions in TypeScript

### Key Findings

**3.1 Permission Schema Pattern**
```typescript
// lib/auth/permissions.ts
export type Role = 'agent' | 'admin' | 'publisher';

export const PERMISSIONS: Record<Role, Set<string>> = {
  agent: new Set([
    'propiedades:create',
    'propiedades:read:own',
    'propiedades:update:own',
    'propiedades:request_removal',
  ]),
  admin: new Set([
    'propiedades:read:all',
    'propiedades:update:all',
    'propiedades:approve',
    'propiedades:reject',
    'propiedades:authorize_removal',
    'usuarios:create',
    'usuarios:read',
    'audit_log:read',
  ]),
  publisher: new Set([
    'propiedades:read:approved',
    'propiedades:publish',
  ]),
};

export function hasPermission(role: Role, permission: string): boolean {
  return PERMISSIONS[role]?.has(permission) ?? false;
}

// Usage in route handlers:
if (!hasPermission(userRole, 'propiedades:approve')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

Source: [TypeScript RBAC Patterns](https://mingyang-li.medium.com/role-based-access-control-simplified-using-the-power-of-typescript-de09e94353af)

**3.2 Decorator Pattern (if using NestJS-style validation)**
```typescript
// lib/auth/decorators.ts
export function RequirePermission(permission: string) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = async function(...args: any[]) {
      const user = args[0].user; // from middleware
      if (!hasPermission(user.role, permission)) {
        throw new Error('Forbidden');
      }
      return original.apply(this, args);
    };
    return descriptor;
  };
}
```

Source: [NestJS RBAC](https://medium.com/@nwonahr/building-robust-role-based-access-control-rbac-in-typescript-with-nestjs-f96bd01f89ad)

**3.3 Montana OS Approach (Recommended)**
Skip decorators. Use simple utility functions in route handlers. It's clearer and easier to audit.

---

## 4. Audit Logging - Before/After State Capture

### Key Findings

**4.1 Essential Data for Audit Logs**
```typescript
// types/audit.ts
export interface AuditLog {
  id: string;
  user_id: string;           // WHO
  action: string;            // WHAT (create, approve, reject, publish)
  tabla_afectada: string;    // WHICH TABLE
  registro_id: string;       // WHICH RECORD
  cambios: {
    antes: Record<string, any>;    // FULL state before
    despues: Record<string, any>;  // FULL state after
    diff?: string[];               // Optional: fields that changed
  };
  timestamp: Date;           // WHEN
}
```

Source: [Audit Logging Guide](https://dev.to/dangtony98/guide-to-building-great-audit-logs-for-application-software-49fh)

**4.2 Implementation Strategy for Montana OS**
Use **database triggers** for automatic capture:

```sql
-- Function to log changes
CREATE OR REPLACE FUNCTION audit_propiedades()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, accion, tabla_afectada, registro_id, cambios, timestamp)
  VALUES (
    auth.uid(),
    TG_ARGV[0]::text,        -- 'crear', 'editar', 'aprobar', etc
    'propiedades',
    NEW.id,
    jsonb_build_object(
      'antes', to_jsonb(OLD.*),
      'despues', to_jsonb(NEW.*)
    ),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT
CREATE TRIGGER propiedades_insert_audit
AFTER INSERT ON propiedades
FOR EACH ROW
EXECUTE FUNCTION audit_propiedades('crear');

-- Trigger on UPDATE
CREATE TRIGGER propiedades_update_audit
AFTER UPDATE ON propiedades
FOR EACH ROW
WHEN (OLD IS DISTINCT FROM NEW)
EXECUTE FUNCTION audit_propiedades('editar');
```

**Advantages:**
- ✅ Automatic, can't be bypassed
- ✅ Captures all changes (database, API, admin tools)
- ✅ Lightweight (trigger runs after statement)

Source: [Event Sourcing Patterns](https://medium.com/sundaytech/event-sourcing-audit-logs-and-event-logs-deb8f3c54663)

**4.3 Gotchas**
- Triggers fire AFTER the statement; they see the committed state
- For large tables, triggers can impact write performance (profile first)
- Storing full JSONB state in audit_log grows the table quickly; consider archiving old logs

---

## 5. Supabase Realtime for Notifications

### Key Findings

**5.1 WebSocket Subscription Pattern**
```typescript
// lib/notifications.ts
import { RealtimeChannel } from '@supabase/realtime-js';

export function subscribeToNotifications(userId: string, onNotification: (notification: any) => void) {
  const channel: RealtimeChannel = supabase
    .channel(`notifications:user_id=eq.${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `usuario_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
```

Source: [Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)

**5.2 Implementation Decision for Montana OS**
**Start without Realtime. Use React Query polling instead.**

```typescript
// hooks/useNotifications.ts
import { useQuery } from '@tanstack/react-query';

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', userId)
        .order('creado_en', { ascending: false })
        .limit(10);
      return data;
    },
    refetchInterval: 10_000, // Poll every 10 seconds
  });
}
```

**Why?**
- ✅ Simpler to debug and maintain
- ✅ Works reliably (no WebSocket issues)
- ✅ 10-second delay is acceptable for property approvals
- ✅ Scales better (Realtime adds connection overhead)

**If you need true real-time later:**
- Realtime is production-ready in Supabase
- Enable it on notifications table via dashboard
- Switch polling code to `.on()` subscription
- Keep RLS policies the same

Source: [Real-time Notification System](https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs)

---

## 6. User Management & Email Invitations

### Key Findings

**6.1 Supabase Auth Admin API**
Use the Admin API to create users (not available to frontend):

```typescript
// app/api/usuarios/route.ts (admin only)
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Server-side only
);

export async function POST(req: NextRequest) {
  const { email, nombre, rol } = await req.json();

  // 1. Create auth user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password: generateTemporaryPassword(),
    email_confirm: true,
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  // 2. Create record in usuarios table
  const { error: dbError } = await admin
    .from('usuarios')
    .insert({
      id: authUser.user.id,
      email,
      nombre,
      rol,
      activo: true,
    });

  if (dbError) {
    // Cleanup: delete auth user if DB insert fails
    await admin.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json({ error: dbError.message }, { status: 400 });
  }

  // 3. Send invitation email
  await sendInvitationEmail(email, nombre);

  return NextResponse.json({ user: authUser.user });
}
```

Source: [User Management](https://supabase.com/docs/guides/auth/managing-user-data), [Create User API](https://supabase.com/docs/reference/javascript/auth-admin-createuser)

**6.2 Gotcha: Transactional Cleanup**
If user creation succeeds but email fails, you'll have orphaned auth records. Implement retry logic or manual cleanup.

---

## 7. Summary of Recommended Patterns for Montana OS

| Layer | Pattern | Why |
|-------|---------|-----|
| **Database** | RLS with JOIN to usuarios table | Secure, auditable, no JWT trust issues |
| **API Routes** | Check `hasPermission()` utility | Defense in depth, catches RLS bypasses |
| **Middleware** | Route by role, redirect mismatched roles | UX optimization, not security |
| **Audit Log** | Database triggers, store before/after JSONB | Automatic, comprehensive, secure |
| **Notifications** | React Query polling every 10s | Simple, reliable, scale-friendly |
| **User Mgmt** | Admin API only, transactional | Safe, prevents orphaned accounts |

---

## 8. Implementation Gotchas & Warnings

### 🚨 Critical

1. **RLS Indexes** - Missing indexes will cause 100x slowdowns
   - Action: Immediately after table creation, index `user_id`, `estado`, `creado_por_nombre`

2. **RLS Bypassed in SQL Editor** - You can't test RLS in Studio
   - Action: Use impersonation feature or test via client SDK

3. **JWT Metadata Not Secure** - `auth.jwt() -> 'user_metadata'` can be modified by users
   - Action: Use Custom Access Token Hook or join with database

### ⚠️ Important

4. **UPDATE needs BOTH USING and WITH CHECK** - Missing WITH CHECK allows invalid data
   - Example: Agent updates own property but changes user_id to different agent

5. **RLS Policies are OR'd** - If agent matches "user_id = auth.uid()" OR "admin", agent can't edit
   - Action: Be specific with role checks; test thoroughly

6. **Audit Log Growth** - Storing full JSONB state grows logs rapidly
   - Action: Archive logs older than 90 days to a separate table

### ℹ️ Nice-to-Know

7. **Supabase Realtime costs money** - More connections = more bills
   - Action: Start with polling; move to Realtime only if necessary

8. **Soft Deletes vs Hard Deletes** - For audit compliance, consider soft deletes
   - Montana OS spec uses `archived` status; that's correct for SaaS

---

## 9. Sources & References

### Supabase Official Docs
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [RLS Best Practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices)
- [User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- [Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)

### Next.js & TypeScript
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Next.js Middleware](https://nextjs.im/docs/14/app/building-your-application/routing/middleware/)
- [TypeScript RBAC Patterns](https://mingyang-li.medium.com/role-based-access-control-simplified-using-the-power-of-typescript-de09e94353af)
- [NestJS RBAC with TypeScript](https://medium.com/@nwonahr/building-robust-role-based-access-control-rbac-in-typescript-with-nestjs-f96bd01f89ad)

### Audit & Logging
- [Audit Logging Best Practices](https://dev.to/dangtony98/guide-to-building-great-audit-logs-for-application-software-49fh)
- [Event Sourcing & Audit Logs](https://medium.com/sundaytech/event-sourcing-audit-logs-and-event-logs-deb8f3c54663)

### Community Guides
- [RLS Production Patterns](https://dev.to/whoffagents/supabase-row-level-security-in-production-patterns-that-actually-work-2l78)
- [Real-time Notifications](https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs)
- [API Route Authorization](https://blog.tericcabrel.com/protect-your-api-routes-in-next-js-with-middleware/)

---

**End of Research Brief**

**Next Step:** Invoke skills-audit to identify missing competencies and determine which supporting skills to create.
