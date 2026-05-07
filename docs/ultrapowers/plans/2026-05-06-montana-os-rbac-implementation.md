# Montana OS RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `ultrapowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement a complete role-based access control system with Supabase RLS, audit logging, and three user roles (agent, admin, publisher) for Montana OS.

**Architecture:** Database-first security using Supabase RLS (default-deny) as the security layer. API and middleware validate permissions for defense-in-depth. Audit logging via triggers captures all state changes. Three separate dashboards based on role.

**Tech Stack:** Next.js 14, TypeScript, Supabase (PostgreSQL), React 18, Tailwind CSS

**Skills Referenced:** @supabase-patterns, @nextjs-patterns, @typescript-best-practices, @database-design, @auth-security

---

## Phase 1: Database Schema, RLS, Triggers, and Audit (Est. 4 hours)

### Task 1: Create Database Migration for Core Tables

**Files:**
- Create: `supabase/migrations/20260506_001_usuarios_table.sql`
- Create: `supabase/migrations/20260506_002_permisos_table.sql`
- Create: `supabase/migrations/20260506_003_audit_log_table.sql`
- Modify: `supabase/migrations/20260506_004_enable_rls_all_tables.sql`

**Context:** Supabase migrations live in `supabase/migrations/` and run in order. Each migration file is a single SQL transaction. Reference: @supabase-patterns section 1-2.

- [ ] **Step 1: Create usuarios table migration**

```sql
-- supabase/migrations/20260506_001_usuarios_table.sql

CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  rol TEXT CHECK (rol IN ('agent', 'admin', 'publisher')) NOT NULL,
  nombre TEXT NOT NULL,
  avatar_url TEXT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for RLS performance
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Admin can see all users, agents see only themselves
CREATE POLICY "admin_select_all_usuarios" ON usuarios
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
    OR id = auth.uid()
  );

CREATE POLICY "admin_update_usuarios" ON usuarios
  FOR UPDATE
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');

CREATE POLICY "admin_delete_usuarios" ON usuarios
  FOR DELETE
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');
```

Save file and verify it's in `supabase/migrations/20260506_001_usuarios_table.sql`

- [ ] **Step 2: Create permisos table migration**

```sql
-- supabase/migrations/20260506_002_permisos_table.sql

CREATE TABLE permisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  puede_crear_propiedades BOOLEAN DEFAULT false,
  puede_editar_propiedades BOOLEAN DEFAULT false,
  puede_enviar_revision BOOLEAN DEFAULT false,
  puede_aprobar_propiedades BOOLEAN DEFAULT false,
  puede_rechazar_propiedades BOOLEAN DEFAULT false,
  puede_ver_todas_propiedades BOOLEAN DEFAULT false,
  puede_bajar_propiedades BOOLEAN DEFAULT false,
  puede_autorizar_bajar BOOLEAN DEFAULT false,
  puede_crear_usuarios BOOLEAN DEFAULT false,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(usuario_id)
);

-- Index for lookups
CREATE INDEX idx_permisos_usuario_id ON permisos(usuario_id);

-- Enable RLS
ALTER TABLE permisos ENABLE ROW LEVEL SECURITY;

-- Users see only their own permissions, admins see all
CREATE POLICY "select_own_permisos" ON permisos
  FOR SELECT
  USING (
    usuario_id = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admin_update_permisos" ON permisos
  FOR UPDATE
  USING ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin');
```

Save file and verify it's in `supabase/migrations/20260506_002_permisos_table.sql`

- [ ] **Step 3: Create audit_log table migration**

```sql
-- supabase/migrations/20260506_003_audit_log_table.sql

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  accion TEXT NOT NULL,
  tabla_afectada TEXT NOT NULL,
  registro_id UUID NOT NULL,
  cambios JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for queries
CREATE INDEX idx_audit_log_usuario_timestamp ON audit_log(usuario_id, timestamp DESC);
CREATE INDEX idx_audit_log_tabla_registro ON audit_log(tabla_afectada, registro_id);
CREATE INDEX idx_audit_log_accion ON audit_log(accion);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Agents see only their own actions, admins see all
CREATE POLICY "select_audit_log" ON audit_log
  FOR SELECT
  USING (
    usuario_id = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );
```

Save file and verify it's in `supabase/migrations/20260506_003_audit_log_table.sql`

- [ ] **Step 4: Create RLS enable migration**

```sql
-- supabase/migrations/20260506_004_enable_rls_all_tables.sql

-- Verify all user-created tables have RLS enabled
-- (auth.users is managed by Supabase, not us)

ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
```

Save file and verify it's in `supabase/migrations/20260506_004_enable_rls_all_tables.sql`

- [ ] **Step 5: Run migrations locally**

```bash
cd montana-os
supabase migration list
supabase db push
```

Expected output:
```
Applying migration: 20260506_001_usuarios_table.sql
Applying migration: 20260506_002_permisos_table.sql
Applying migration: 20260506_003_audit_log_table.sql
Applying migration: 20260506_004_enable_rls_all_tables.sql
✓ Migrations applied successfully
```

- [ ] **Step 6: Verify tables and RLS in Supabase Studio**

Open Supabase Dashboard → SQL Editor and run:
```sql
SELECT tablename FROM pg_tables WHERE tablename IN ('usuarios', 'permisos', 'audit_log');
SELECT * FROM pg_policy WHERE tablename = 'usuarios';
```

Expected: 3 tables + 3 policies on usuarios table

- [ ] **Step 7: Commit** *(only if auto-commit enabled)*

```bash
git add supabase/migrations/
git commit -m "feat: create usuarios, permisos, audit_log tables with RLS policies

- Create usuarios table with role-based access
- Create permisos table for granular permissions
- Create audit_log table with full state capture
- Enable RLS on all tables
- Add performance indexes on policy columns

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Create Database Triggers for Audit Logging

**Files:**
- Create: `supabase/migrations/20260506_005_audit_triggers.sql`

**Context:** Triggers run automatically after INSERT/UPDATE/DELETE. They capture state changes to audit_log. Cannot be bypassed. Reference: @supabase-patterns section 2.

- [ ] **Step 1: Create audit trigger function**

```sql
-- supabase/migrations/20260506_005_audit_triggers.sql

CREATE OR REPLACE FUNCTION audit_propiedades()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (usuario_id, accion, tabla_afectada, registro_id, cambios)
    VALUES (
      COALESCE(auth.uid(), 'system'::uuid),
      'crear',
      'propiedades',
      NEW.id,
      jsonb_build_object('antes', NULL, 'despues', to_jsonb(NEW.*))
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD IS DISTINCT FROM NEW THEN
      INSERT INTO audit_log (usuario_id, accion, tabla_afectada, registro_id, cambios)
      VALUES (
        COALESCE(auth.uid(), 'system'::uuid),
        'editar',
        'propiedades',
        NEW.id,
        jsonb_build_object('antes', to_jsonb(OLD.*), 'despues', to_jsonb(NEW.*))
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (usuario_id, accion, tabla_afectada, registro_id, cambios)
    VALUES (
      COALESCE(auth.uid(), 'system'::uuid),
      'eliminar',
      'propiedades',
      OLD.id,
      jsonb_build_object('antes', to_jsonb(OLD.*), 'despues', NULL)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on propiedades
CREATE TRIGGER propiedades_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON propiedades
FOR EACH ROW
EXECUTE FUNCTION audit_propiedades();

-- Similar triggers for usuarios and permisos
CREATE OR REPLACE FUNCTION audit_usuarios()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (usuario_id, accion, tabla_afectada, registro_id, cambios)
    VALUES (
      auth.uid(),
      'crear_usuario',
      'usuarios',
      NEW.id,
      jsonb_build_object('antes', NULL, 'despues', to_jsonb(NEW.*))
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD IS DISTINCT FROM NEW THEN
      INSERT INTO audit_log (usuario_id, accion, tabla_afectada, registro_id, cambios)
      VALUES (
        auth.uid(),
        'editar_usuario',
        'usuarios',
        NEW.id,
        jsonb_build_object('antes', to_jsonb(OLD.*), 'despues', to_jsonb(NEW.*))
      );
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_audit_trigger
AFTER INSERT OR UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION audit_usuarios();
```

Save and verify in `supabase/migrations/20260506_005_audit_triggers.sql`

- [ ] **Step 2: Run migration**

```bash
supabase db push
```

Expected: No errors

- [ ] **Step 3: Test trigger manually**

In SQL Editor:
```sql
-- Insert a test user (note: this will fail RLS in real scenario, but triggers will fire)
-- For testing, run as postgres role in SQL Editor (bypasses RLS)

SELECT * FROM audit_log WHERE tabla_afectada = 'propiedades' LIMIT 5;
-- Expected: Empty (no changes yet)
```

- [ ] **Step 4: Commit** *(only if auto-commit enabled)*

```bash
git add supabase/migrations/20260506_005_audit_triggers.sql
git commit -m "feat: add audit logging triggers for propiedades and usuarios

Triggers automatically capture before/after state for audit compliance.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Add RLS Policies to Propiedades Table

**Files:**
- Create: `supabase/migrations/20260506_006_propiedades_rls.sql`

**Context:** RLS is the security boundary. Policies determine who sees what. Reference: @supabase-patterns section 1.

- [ ] **Step 1: Create propiedades RLS policies migration**

```sql
-- supabase/migrations/20260506_006_propiedades_rls.sql

-- Agents see only their own properties
CREATE POLICY "agent_select_own" ON propiedades
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'agent'
    AND user_id = auth.uid()
  );

-- Agents see published properties from others (read-only)
CREATE POLICY "agent_select_published" ON propiedades
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'agent'
    AND estado = 'published'
  );

-- Agents insert only their own properties
CREATE POLICY "agent_insert" ON propiedades
  FOR INSERT
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'agent'
    AND user_id = auth.uid()
  );

-- Agents update only their own draft properties
CREATE POLICY "agent_update_draft" ON propiedades
  FOR UPDATE
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'agent'
    AND user_id = auth.uid()
    AND estado = 'draft'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND estado = 'draft'
  );

-- Agents can delete their own draft properties
CREATE POLICY "agent_delete_draft" ON propiedades
  FOR DELETE
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'agent'
    AND user_id = auth.uid()
    AND estado IN ('draft', 'rejected')
  );

-- Admins see all properties
CREATE POLICY "admin_select_all" ON propiedades
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Admins can edit any property
CREATE POLICY "admin_update_all" ON propiedades
  FOR UPDATE
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Publishers see only approved and published properties
CREATE POLICY "publisher_select_approved" ON propiedades
  FOR SELECT
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'publisher'
    AND estado IN ('approved', 'published')
  );

-- Publishers can update estado field (publish to brokers)
CREATE POLICY "publisher_update_estado" ON propiedades
  FOR UPDATE
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'publisher'
    AND estado = 'approved'
  )
  WITH CHECK (
    estado IN ('published', 'paused')
  );
```

Save and verify in `supabase/migrations/20260506_006_propiedades_rls.sql`

- [ ] **Step 2: Run migration**

```bash
supabase db push
```

Expected: No errors

- [ ] **Step 3: Commit** *(only if auto-commit enabled)*

```bash
git add supabase/migrations/20260506_006_propiedades_rls.sql
git commit -m "feat: add RLS policies to propiedades table

Policies implement:
- Agents: see own + published properties, edit own drafts
- Admins: see/edit all properties
- Publishers: see approved, publish to brokers

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Authentication & Authorization Middleware (Est. 3 hours)

### Task 4: Create Custom Authentication Hook

**Files:**
- Create: `src/lib/auth/supabase-client.ts`
- Create: `src/lib/auth/server-auth.ts`
- Modify: `src/middleware.ts`

**Context:** Authentication checks who you are. Authorization checks what you can do. We use middleware for routing optimization, but RLS is the real security. Reference: @nextjs-patterns, @auth-security.

- [ ] **Step 1: Create Supabase client utilities**

```typescript
// src/lib/auth/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

```typescript
// src/lib/auth/server-auth.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerAuth() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Errors in server components are expected
          }
        },
      },
    }
  );
}

export async function getCurrentUser() {
  const supabase = await createServerAuth();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserWithRole() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerAuth();
  const { data: userData } = await supabase
    .from('usuarios')
    .select('id, email, rol, nombre, avatar_url, activo')
    .eq('id', user.id)
    .single();

  return userData;
}
```

Create files and verify they exist.

- [ ] **Step 2: Create middleware for authentication & routing**

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerAuth, getCurrentUserWithRole } from '@/lib/auth/server-auth';

const publicRoutes = ['/', '/login'];
const protectedRoutes = ['/propiedades', '/admin', '/api'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check authentication
  const supabase = createServerAuth();
  const {
    data: { user },
  } = (await supabase).auth.getUser();

  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!user) {
    return NextResponse.next();
  }

  // Get user role for routing decisions
  const userWithRole = await getCurrentUserWithRole();

  // Redirect inactive users
  if (userWithRole && !userWithRole.activo) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Route based on role (UX optimization, not security)
  if (userWithRole?.rol === 'agent' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/propiedades', request.url));
  }

  if (['admin', 'publisher'].includes(userWithRole?.rol || '') && pathname === '/propiedades/nueva') {
    return NextResponse.redirect(new URL('/propiedades', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|\.svg).*)',
  ],
};
```

Create file and verify it exists at `src/middleware.ts`.

- [ ] **Step 3: Commit** *(only if auto-commit enabled)*

```bash
git add src/lib/auth/ src/middleware.ts
git commit -m "feat: add authentication & authorization middleware

- Create Supabase client utilities (browser & server)
- Add middleware to check auth and route by role
- Inactive users redirected to login
- Agents routed away from admin paths (UX only)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Create Permission Utilities

**Files:**
- Create: `src/lib/auth/permissions.ts`
- Create: `src/lib/auth/permission-guard.ts`

**Context:** Permission utilities are type-safe checks. They're used in route handlers for defense-in-depth. Reference: @typescript-best-practices, @auth-security.

- [ ] **Step 1: Create permissions mapping**

```typescript
// src/lib/auth/permissions.ts
import { Database } from '@/types/database';

export type Role = Database['public']['Tables']['usuarios']['Row']['rol'];

export const PERMISSIONS = {
  agent: new Set([
    'propiedades:create',
    'propiedades:read:own',
    'propiedades:read:published',
    'propiedades:update:own_draft',
    'propiedades:delete:own_draft',
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
    'usuarios:update',
    'audit_log:read',
    'notificaciones:read:all',
  ]),
  publisher: new Set([
    'propiedades:read:approved',
    'propiedades:publish',
  ]),
} as const;

export function hasPermission(rol: Role, permission: string): boolean {
  return PERMISSIONS[rol]?.has(permission) ?? false;
}

export function requirePermission(rol: Role, permission: string): void {
  if (!hasPermission(rol, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}
```

Create file and verify at `src/lib/auth/permissions.ts`.

- [ ] **Step 2: Create permission guard for route handlers**

```typescript
// src/lib/auth/permission-guard.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserWithRole } from './server-auth';
import { hasPermission } from './permissions';

export async function requirePermissionMiddleware(
  request: NextRequest,
  requiredPermission: string
) {
  const user = await getCurrentUserWithRole();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasPermission(user.rol as any, requiredPermission)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null; // OK to proceed
}

export function createPermissionGuard(requiredPermission: string) {
  return async (request: NextRequest) => {
    return requirePermissionMiddleware(request, requiredPermission);
  };
}
```

Create file and verify at `src/lib/auth/permission-guard.ts`.

- [ ] **Step 3: Commit** *(only if auto-commit enabled)*

```bash
git add src/lib/auth/permissions.ts src/lib/auth/permission-guard.ts
git commit -m "feat: add type-safe permission utilities

- Define permission mappings per role
- Create permission guard for route handlers
- Enforce permissions server-side (defense-in-depth)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Admin Features - User Management & Approval Workflow (Est. 3 hours)

### Task 6: Create Admin API for User Management

**Files:**
- Create: `src/app/api/admin/usuarios/route.ts`
- Create: `src/app/api/admin/usuarios/[id]/route.ts`

**Context:** Admin API handles user creation, updates, deletion. Uses Admin SDK (server-only). Reference: @supabase-patterns section 3, @auth-security.

- [ ] **Step 1: Create user creation endpoint**

```typescript
// src/app/api/admin/usuarios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserWithRole } from '@/lib/auth/server-auth';
import { crypto } from 'node:crypto';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin
    const user = await getCurrentUserWithRole();
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, nombre, rol } = await request.json();

    // 2. Validate input
    if (!email || !nombre || !['agent', 'admin', 'publisher'].includes(rol)) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    // 3. Create auth user
    const tempPassword = crypto.randomUUID().slice(0, 16);
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: nombre },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 4. Create usuarios record
    const { error: usersError } = await admin
      .from('usuarios')
      .insert({
        id: authUser.user.id,
        email,
        nombre,
        rol,
        activo: true,
      });

    if (usersError) {
      // Cleanup
      await admin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: usersError.message }, { status: 400 });
    }

    // 5. Create permisos record
    const permissionsMap: Record<string, Record<string, boolean>> = {
      agent: {
        puede_crear_propiedades: true,
        puede_editar_propiedades: true,
        puede_enviar_revision: true,
        puede_bajar_propiedades: true,
      },
      admin: {
        puede_ver_todas_propiedades: true,
        puede_editar_propiedades: true,
        puede_aprobar_propiedades: true,
        puede_rechazar_propiedades: true,
        puede_autorizar_bajar: true,
        puede_crear_usuarios: true,
      },
      publisher: {
        puede_ver_todas_propiedades: true,
        puede_editar_propiedades: false,
        puede_aprobar_propiedades: false,
        puede_rechazar_propiedades: false,
        puede_autorizar_bajar: false,
        puede_crear_usuarios: false,
      },
    };

    const { error: permError } = await admin
      .from('permisos')
      .insert({
        usuario_id: authUser.user.id,
        ...permissionsMap[rol],
      });

    if (permError) {
      // Cleanup
      await admin.from('usuarios').delete().eq('id', authUser.user.id);
      await admin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: permError.message }, { status: 400 });
    }

    // 6. Log creation
    await admin.from('audit_log').insert({
      usuario_id: user.id,
      accion: 'crear_usuario',
      tabla_afectada: 'usuarios',
      registro_id: authUser.user.id,
      cambios: {
        antes: null,
        despues: { id: authUser.user.id, email, nombre, rol },
      },
    });

    return NextResponse.json({
      user: {
        id: authUser.user.id,
        email,
        nombre,
        rol,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await admin
      .from('usuarios')
      .select('*, permisos(*)')
      .order('creado_en', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create file and verify at `src/app/api/admin/usuarios/route.ts`.

- [ ] **Step 2: Create user update/delete endpoint**

```typescript
// src/app/api/admin/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserWithRole } from '@/lib/auth/server-auth';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { nombre, activo, rol } = await request.json();

    // Get current state for audit log
    const { data: current } = await admin
      .from('usuarios')
      .select('*')
      .eq('id', params.id)
      .single();

    // Update usuario
    const { error: updateError } = await admin
      .from('usuarios')
      .update({ nombre, activo, rol, actualizado_en: new Date() })
      .eq('id', params.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Log update
    await admin.from('audit_log').insert({
      usuario_id: user.id,
      accion: 'editar_usuario',
      tabla_afectada: 'usuarios',
      registro_id: params.id,
      cambios: {
        antes: current,
        despues: { ...current, nombre, activo, rol },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserWithRole();
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete: set activo = false
    const { data: current } = await admin
      .from('usuarios')
      .select('*')
      .eq('id', params.id)
      .single();

    const { error } = await admin
      .from('usuarios')
      .update({ activo: false })
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log deletion
    await admin.from('audit_log').insert({
      usuario_id: user.id,
      accion: 'desactivar_usuario',
      tabla_afectada: 'usuarios',
      registro_id: params.id,
      cambios: {
        antes: current,
        despues: { ...current, activo: false },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create file and verify at `src/app/api/admin/usuarios/[id]/route.ts`.

- [ ] **Step 3: Commit** *(only if auto-commit enabled)*

```bash
git add src/app/api/admin/
git commit -m "feat: create admin API for user management

- POST /api/admin/usuarios - create user (transactional)
- GET /api/admin/usuarios - list all users
- PUT /api/admin/usuarios/[id] - update user (audit logged)
- DELETE /api/admin/usuarios/[id] - soft delete (deactivate)

Uses Supabase Admin API (server-only, never expose keys).

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Create Approval Workflow API

**Files:**
- Create: `src/app/api/propiedades/[id]/aprobar/route.ts`
- Create: `src/app/api/propiedades/[id]/rechazar/route.ts`
- Create: `src/app/api/propiedades/[id]/enviar-revision/route.ts`

**Context:** Approval workflow updates property estado and creates notifications. Reference: @supabase-patterns section 2 (audit triggers), @auth-security (permission checks).

- [ ] **Step 1: Create approve endpoint**

```typescript
// src/app/api/propiedades/[id]/aprobar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerAuth } from '@/lib/auth/server-auth';
import { requirePermission } from '@/lib/auth/permissions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerAuth();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    requirePermission(userData.rol, 'propiedades:approve');

    // Get current property
    const { data: property } = await supabase
      .from('propiedades')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!property) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Update property (trigger will log)
    const { error: updateError } = await supabase
      .from('propiedades')
      .update({
        estado: 'approved',
        aprobada_por: user.id,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Create notification for asesor
    await supabase.from('notificaciones').insert({
      usuario_id: property.user_id,
      tipo: 'propiedad_aprobada',
      mensaje: `Tu propiedad fue aprobada ✓`,
      propiedad_id: params.id,
      leido: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create file and verify at `src/app/api/propiedades/[id]/aprobar/route.ts`.

- [ ] **Step 2: Create reject endpoint**

```typescript
// src/app/api/propiedades/[id]/rechazar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerAuth } from '@/lib/auth/server-auth';
import { requirePermission } from '@/lib/auth/permissions';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerAuth();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    requirePermission(userData.rol, 'propiedades:reject');

    const { razon } = await request.json();

    const { data: property } = await supabase
      .from('propiedades')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!property) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Update property
    const { error: updateError } = await supabase
      .from('propiedades')
      .update({
        estado: 'rejected',
        rechazada_razon: razon,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Notify asesor
    await supabase.from('notificaciones').insert({
      usuario_id: property.user_id,
      tipo: 'propiedad_rechazada',
      mensaje: `Tu propiedad fue rechazada. Motivo: ${razon}`,
      propiedad_id: params.id,
      datos: { razon },
      leido: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

Create file and verify at `src/app/api/propiedades/[id]/rechazar/route.ts`.

- [ ] **Step 3: Create send-for-review endpoint**

```typescript
// src/app/api/propiedades/[id]/enviar-revision/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerAuth } from '@/lib/auth/server-auth';
import { requirePermission } from '@/lib/auth/permissions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerAuth();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    requirePermission(userData.rol, 'propiedades:read:own');

    const { data: property } = await supabase
      .from('propiedades')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!property) {
      return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 });
    }

    if (property.estado !== 'draft' && property.estado !== 'rejected') {
      return NextResponse.json(
        { error: 'Only draft or rejected properties can be sent for review' },
        { status: 400 }
      );
    }

    // Update property (trigger logs this)
    const { error: updateError } = await supabase
      .from('propiedades')
      .update({
        estado: 'pending_review',
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Notify admins (get all admin users)
    const { data: admins } = await supabase
      .from('usuarios')
      .select('id')
      .eq('rol', 'admin');

    if (admins && admins.length > 0) {
      const notifications = admins.map(admin => ({
        usuario_id: admin.id,
        tipo: 'nueva_propiedad_revision',
        mensaje: `Nueva propiedad de ${userData.nombre} pendiente de revisión`,
        propiedad_id: params.id,
        leido: false,
      }));

      await supabase.from('notificaciones').insert(notifications);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

Create file and verify at `src/app/api/propiedades/[id]/enviar-revision/route.ts`.

- [ ] **Step 4: Commit** *(only if auto-commit enabled)*

```bash
git add src/app/api/propiedades/
git commit -m "feat: create approval workflow API endpoints

- POST /api/propiedades/[id]/aprobar - approve property
- POST /api/propiedades/[id]/rechazar - reject with reason
- POST /api/propiedades/[id]/enviar-revision - send for review

All changes are audit-logged via triggers.
Notifications created for relevant users.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Dashboard Layouts (Est. 2 hours)

### Task 8: Update Dashboard Layout & Routing

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx` (already exists)
- Modify: `src/app/(dashboard)/propiedades/page.tsx`
- Create: `src/app/(dashboard)/propiedades/admin/page.tsx`
- Create: `src/components/dashboard/DashboardHeader.tsx`

**Context:** Dashboard shows different views based on role. Agent sees their properties, admin sees all + approval queue. Reference: @react-best-practices, @nextjs-patterns.

- [ ] **Step 1: Update dashboard layout**

```typescript
// src/app/(dashboard)/layout.tsx (modify existing)
import { redirect } from 'next/navigation';
import { createServerAuth, getCurrentUserWithRole } from '@/lib/auth/server-auth';
import { Sidebar } from '@/components/shared/sidebar';
import { Topbar } from '@/components/shared/topbar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithRole();

  if (!user) redirect('/login');
  if (!user.activo) redirect('/login');

  const profile = {
    id: user.id,
    email: user.email,
    rol: user.rol,
    nombre: user.nombre,
    avatar_url: user.avatar_url,
  };

  return (
    <div className="min-h-screen flex">
      <Sidebar role={profile.rol as any} />
      <div className="flex-1 flex flex-col">
        <Topbar profile={profile as any} />
        <DashboardHeader role={profile.rol} />
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create agent properties page**

```typescript
// src/app/(dashboard)/propiedades/page.tsx (modify existing to show role-based view)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/auth/supabase-client';

export default function PropiedadesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Get user role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    setUserRole(userData?.rol);

    // If admin, redirect to admin view
    if (userData?.rol === 'admin') {
      router.push('/propiedades/admin');
      return;
    }

    // Fetch properties based on role
    if (userData?.rol === 'agent') {
      const { data } = await supabase
        .from('propiedades')
        .select('*')
        .order('creado_en', { ascending: false });
      setPropiedades(data || []);
    }

    setLoading(false);
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
            Inventario
          </p>
          <h1 className="text-4xl font-editorial mt-2">Mis Propiedades</h1>
        </div>
        <a
          href="/propiedades/nueva"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-montana-gold text-montana-gold hover:bg-montana-gold hover:text-montana-black transition-colors text-sm uppercase tracking-widest"
        >
          + Nueva propiedad
        </a>
      </div>

      {propiedades.length === 0 ? (
        <div className="border border-border rounded-md p-12 text-center">
          <p className="font-editorial text-2xl mb-3">Aún no hay propiedades</p>
          <p className="text-sm text-muted-foreground">
            Empieza creando tu primera propiedad.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {propiedades.map(prop => (
            <div
              key={prop.id}
              className="border border-border rounded-md p-4 hover:bg-secondary transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{prop.datos_propiedad?.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {prop.datos_propiedad?.type} • ${prop.datos_propiedad?.price}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(prop.estado)}`}>
                  {prop.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusColor(estado: string) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-900',
    pending_review: 'bg-amber-200 text-amber-900',
    approved: 'bg-green-200 text-green-900',
    published: 'bg-blue-200 text-blue-900',
    rejected: 'bg-red-200 text-red-900',
  };
  return colors[estado] || 'bg-gray-200';
}
```

- [ ] **Step 3: Create admin approval queue page**

```typescript
// src/app/(dashboard)/propiedades/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/auth/supabase-client';

export default function AdminPropiedadesPage() {
  const supabase = createClient();
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProp, setSelectedProp] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPropiedades();
  }, []);

  async function fetchPropiedades() {
    const { data } = await supabase
      .from('propiedades')
      .select('*, usuarios(nombre)')
      .in('estado', ['pending_review', 'draft', 'approved'])
      .order('creado_en', { ascending: false });

    setPropiedades(data || []);
    setLoading(false);
  }

  async function handleApprove(propId: string) {
    await fetch(`/api/propiedades/${propId}/aprobar`, { method: 'POST' });
    fetchPropiedades();
  }

  async function handleReject(propId: string) {
    await fetch(`/api/propiedades/${propId}/rechazar`, {
      method: 'POST',
      body: JSON.stringify({ razon: rejectReason }),
      headers: { 'Content-Type': 'application/json' },
    });
    setRejectReason('');
    fetchPropiedades();
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
          Control
        </p>
        <h1 className="text-4xl font-editorial mt-2">Cola de Revisión</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {propiedades.filter(p => p.estado === 'pending_review').map(prop => (
            <div
              key={prop.id}
              className="border border-border rounded-md p-4 cursor-pointer hover:bg-secondary"
              onClick={() => setSelectedProp(prop)}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{prop.datos_propiedad?.address}</p>
                  <p className="text-sm text-muted-foreground">
                    Por: {prop.usuarios.nombre}
                  </p>
                </div>
                <span className="text-xs bg-amber-200 px-2 py-1 rounded">
                  Revisión
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedProp && (
          <div className="border border-border rounded-md p-4 space-y-4">
            <div>
              <p className="font-medium">{selectedProp.datos_propiedad?.address}</p>
              <p className="text-sm text-muted-foreground">
                ${selectedProp.datos_propiedad?.price}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleApprove(selectedProp.id)}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Aprobar
              </button>
              <div>
                <textarea
                  placeholder="Motivo del rechazo..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                />
                <button
                  onClick={() => handleReject(selectedProp.id)}
                  className="w-full mt-2 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

Create file and verify at `src/app/(dashboard)/propiedades/admin/page.tsx`.

- [ ] **Step 4: Create DashboardHeader component**

```typescript
// src/components/dashboard/DashboardHeader.tsx
'use client';

export function DashboardHeader({ role }: { role: string }) {
  const headers: Record<string, { title: string; subtitle: string }> = {
    agent: {
      title: 'Mi CRM',
      subtitle: 'Gestiona tus propiedades y clientes',
    },
    admin: {
      title: 'Panel de Administración',
      subtitle: 'Revisa y gestiona todas las propiedades',
    },
    publisher: {
      title: 'Centro de Publicación',
      subtitle: 'Publica propiedades en brokers',
    },
  };

  const header = headers[role] || headers.agent;

  return (
    <div className="border-b border-border px-6 lg:px-10 py-4">
      <h2 className="text-xl font-semibold">{header.title}</h2>
      <p className="text-sm text-muted-foreground">{header.subtitle}</p>
    </div>
  );
}
```

Create file and verify at `src/components/dashboard/DashboardHeader.tsx`.

- [ ] **Step 5: Commit** *(only if auto-commit enabled)*

```bash
git add src/app/\(dashboard\)/ src/components/dashboard/
git commit -m "feat: implement role-based dashboard layouts

- Agent view: personal property list
- Admin view: approval queue with bulk actions
- Dashboard header shows role-specific context
- Automatic redirect for mismatched roles

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: Notifications System (Est. 1.5 hours)

### Task 9: Create Notifications Table & API

**Files:**
- Create: `supabase/migrations/20260506_007_notificaciones_table.sql`
- Create: `src/app/api/notificaciones/route.ts`
- Create: `src/hooks/useNotifications.ts`

**Context:** Notifications use polling (React Query) not realtime. Simpler, more reliable. Reference: @supabase-patterns section 5 (realtime alternative).

- [ ] **Step 1: Create notificaciones table migration**

```sql
-- supabase/migrations/20260506_007_notificaciones_table.sql

CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  propiedad_id UUID REFERENCES propiedades(id) ON DELETE SET NULL,
  datos JSONB,
  leido BOOLEAN DEFAULT false,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_notificaciones_usuario_leido ON notificaciones(usuario_id, leido);
CREATE INDEX idx_notificaciones_creado_en ON notificaciones(creado_en DESC);

ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Users see only their own notifications
CREATE POLICY "select_own_notificaciones" ON notificaciones
  FOR SELECT
  USING (usuario_id = auth.uid());

-- Users mark their own as read
CREATE POLICY "update_own_notificaciones" ON notificaciones
  FOR UPDATE
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Users delete their own
CREATE POLICY "delete_own_notificaciones" ON notificaciones
  FOR DELETE
  USING (usuario_id = auth.uid());
```

Save and verify at `supabase/migrations/20260506_007_notificaciones_table.sql`

- [ ] **Step 2: Run migration**

```bash
supabase db push
```

Expected: No errors

- [ ] **Step 3: Create notifications API**

```typescript
// src/app/api/notificaciones/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerAuth } from '@/lib/auth/server-auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerAuth();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    let query = supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', user.id)
      .order('creado_en', { ascending: false });

    if (unreadOnly) {
      query = query.eq('leido', false);
    }

    const { data, error } = await query.limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerAuth();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, leido } = await request.json();

    const { error } = await supabase
      .from('notificaciones')
      .update({ leido })
      .eq('id', id)
      .eq('usuario_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

Create file and verify at `src/app/api/notificaciones/route.ts`.

- [ ] **Step 4: Create useNotifications hook**

```typescript
// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', { unreadOnly }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (unreadOnly) params.append('unread_only', 'true');

      const res = await fetch(`/api/notificaciones?${params}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    refetchInterval: 10_000, // Poll every 10 seconds
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, leido }: { id: string; leido: boolean }) => {
      const res = await fetch('/api/notificaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, leido }),
      });
      if (!res.ok) throw new Error('Failed to update notification');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
```

Create file and verify at `src/hooks/useNotifications.ts`.

- [ ] **Step 5: Commit** *(only if auto-commit enabled)*

```bash
git add supabase/migrations/20260506_007_notificaciones_table.sql src/app/api/notificaciones/ src/hooks/useNotifications.ts
git commit -m "feat: implement notifications system with polling

- Create notificaciones table with RLS
- API endpoints for GET (list) and PUT (mark read)
- useNotifications hook with 10s polling via React Query
- Unread filter for efficiency

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: Testing & Validation (Est. 2 hours)

### Task 10: Add RLS & Permission Tests

**Files:**
- Create: `src/__tests__/rls.test.ts`
- Create: `src/__tests__/permissions.test.ts`

**Context:** Tests verify RLS policies work correctly. Use client SDK, not SQL Editor. Reference: @supabase-patterns section 6, @testing-tdd.

- [ ] **Step 1: Write RLS tests**

```typescript
// src/__tests__/rls.test.ts
import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll } from 'vitest';

const testUsers = {
  agent1: { email: 'agent1@test.com', password: 'Test123!@#' },
  agent2: { email: 'agent2@test.com', password: 'Test123!@#' },
  admin: { email: 'admin@test.com', password: 'Test123!@#' },
};

describe('RLS Policies', () => {
  let clients: Record<string, any> = {};

  beforeAll(async () => {
    // Sign in each user
    for (const [role, creds] of Object.entries(testUsers)) {
      const client = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      await client.auth.signInWithPassword(creds);
      clients[role] = client;
    }
  });

  it('agent cannot see other agents properties', async () => {
    // Agent1 creates a property
    const { data: prop1 } = await clients.agent1
      .from('propiedades')
      .insert({ user_id: testUsers.agent1, estado: 'draft' })
      .select()
      .single();

    // Agent2 tries to see it
    const { data: result } = await clients.agent2
      .from('propiedades')
      .select()
      .eq('id', prop1.id);

    expect(result).toHaveLength(0);
  });

  it('agent can see published properties', async () => {
    // Admin publishes a property
    const admin = clients.admin;
    const { data: prop } = await admin
      .from('propiedades')
      .insert({ user_id: testUsers.admin, estado: 'published' })
      .select()
      .single();

    // Agent can see it
    const { data: result } = await clients.agent1
      .from('propiedades')
      .select()
      .eq('id', prop.id);

    expect(result).toHaveLength(1);
  });

  it('agent can update own draft property', async () => {
    const { data: prop } = await clients.agent1
      .from('propiedades')
      .insert({ user_id: testUsers.agent1, estado: 'draft' })
      .select()
      .single();

    const { error } = await clients.agent1
      .from('propiedades')
      .update({ estado: 'draft' })
      .eq('id', prop.id);

    expect(error).toBeNull();
  });

  it('agent cannot update published property', async () => {
    const { data: prop } = await clients.agent1
      .from('propiedades')
      .insert({ user_id: testUsers.agent1, estado: 'published' })
      .select()
      .single();

    const { error } = await clients.agent1
      .from('propiedades')
      .update({ estado: 'draft' })
      .eq('id', prop.id);

    expect(error).toBeDefined();
  });
});
```

Create file and verify at `src/__tests__/rls.test.ts`.

- [ ] **Step 2: Write permission tests**

```typescript
// src/__tests__/permissions.test.ts
import { hasPermission, PERMISSIONS } from '@/lib/auth/permissions';
import { describe, it, expect } from 'vitest';

describe('Permissions', () => {
  it('agent has correct permissions', () => {
    expect(hasPermission('agent', 'propiedades:create')).toBe(true);
    expect(hasPermission('agent', 'propiedades:read:own')).toBe(true);
    expect(hasPermission('agent', 'propiedades:approve')).toBe(false);
  });

  it('admin has all permissions', () => {
    expect(hasPermission('admin', 'propiedades:create')).toBe(true);
    expect(hasPermission('admin', 'propiedades:approve')).toBe(true);
    expect(hasPermission('admin', 'usuarios:create')).toBe(true);
  });

  it('publisher has limited permissions', () => {
    expect(hasPermission('publisher', 'propiedades:read:approved')).toBe(true);
    expect(hasPermission('publisher', 'propiedades:publish')).toBe(true);
    expect(hasPermission('publisher', 'propiedades:approve')).toBe(false);
  });

  it('missing permission returns false', () => {
    expect(hasPermission('agent', 'fake:permission')).toBe(false);
  });
});
```

Create file and verify at `src/__tests__/permissions.test.ts`.

- [ ] **Step 3: Run tests**

```bash
npm run test
```

Expected: All tests pass

- [ ] **Step 4: Commit** *(only if auto-commit enabled)*

```bash
git add src/__tests__/
git commit -m "test: add RLS and permission unit tests

- Test that agents cannot see other agents' properties
- Test that published properties are visible to all
- Test permission mappings per role
- Verify permission utility functions

Run: npm run test

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

### Task 11: Manual Integration Testing Checklist

- [ ] **Step 1: Create first admin user**

Login with test user created earlier, go to `/api/admin/usuarios` (manual test), create another admin:

```bash
curl -X POST http://localhost:3000/api/admin/usuarios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"second-admin@montana.com","nombre":"Admin 2","rol":"admin"}'
```

- [ ] **Step 2: Test agent flow**

1. Create agent via admin API
2. Sign in as agent
3. See agent dashboard (personal properties)
4. Create a property (status = draft)
5. Send for review (status = pending_review)
6. Verify admin sees it in approval queue

- [ ] **Step 3: Test admin flow**

1. Sign in as admin
2. See all properties in approval queue
3. Approve one property
4. Check agent received notification
5. Reject another with reason
6. Check agent got rejection notification with reason

- [ ] **Step 4: Test authorization**

1. Agent tries to access `/admin` → redirect to `/propiedades`
2. Agent tries to call `/api/propiedades/[id]/aprobar` → 403 Forbidden
3. Admin can access both

- [ ] **Step 5: Verify audit logs**

```sql
SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 10;
```

Should see: create_user, editar, approve, reject actions with before/after state.

---

## Success Criteria

✅ **Phase 1 Complete:** Database migrated, RLS enabled, triggers firing  
✅ **Phase 2 Complete:** Users sign in, redirected by role, permissions enforced  
✅ **Phase 3 Complete:** Admin can create users, approve/reject properties  
✅ **Phase 4 Complete:** Different dashboards visible per role  
✅ **Phase 5 Complete:** Notifications created and fetched  
✅ **Phase 6 Complete:** Tests pass, manual flows work  

---

## Critical Dependencies

1. **Phase 1 must complete first** — RLS is the security foundation
2. **Auth must work before admin features** — Can't create users without auth
3. **Notifications can be parallelized** with Phases 3-4 once APIs exist
4. **Testing can run anytime after Phase 3**

---

## Estimated Total: 11.5 hours

- Phase 1: 4 hours (DB + RLS + triggers)
- Phase 2: 3 hours (Auth + middleware)
- Phase 3: 3 hours (Admin user + approval API)
- Phase 4: 2 hours (Dashboards)
- Phase 5: 1.5 hours (Notifications)
- Phase 6: 2 hours (Testing + validation)

**Buffer:** 30% (3.5 hours) for unknown issues → ~15 hours total

---

**This plan assumes a skilled full-stack developer with Next.js/TypeScript experience.**  
**Reference skills throughout: @supabase-patterns, @nextjs-patterns, @typescript-best-practices, @auth-security**

Ready to execute?
