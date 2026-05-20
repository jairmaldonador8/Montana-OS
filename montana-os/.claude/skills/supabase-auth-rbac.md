---
name: supabase-auth-rbac
description: Use when setting up role-based authentication in Supabase with custom roles (admin, asesor, coordinador) and row-level security policies
---

# Supabase Auth + RBAC Setup

## Overview
Implement role-based access control in Supabase by configuring custom user roles in JWT claims and RLS policies that enforce data isolation by role.

## When to Use
- Setting up user authentication with multiple role types
- Protecting data so users can only access their own records
- Assigning roles (admin, asesor, coordinador) to users

## Core Patterns

### 1. Extend Supabase Auth with Custom Roles

In Supabase, create a `public.users` table that extends the auth system:

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'asesor', 'coordinador')),
  nombre TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger: auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'asesor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Add Role to JWT Token

Supabase doesn't include custom fields in JWT by default. Use a Postgres function + RLS to pass role in custom claims:

```sql
-- Create a function that returns role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = user_id
$$ LANGUAGE sql STABLE;
```

In your client code, fetch role from `users` table after login:

```typescript
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user!.id)
  .single();

// Store in context/state
setUserRole(profile?.role);
```

### 3. Implement RLS Policies by Role

**For leads table (asesor can only see their own):**

```sql
CREATE POLICY "Asesor can view own leads"
ON public.leads
FOR SELECT
USING (
  auth.uid() = asesor_id 
  OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Asesor can update own leads"
ON public.leads
FOR UPDATE
USING (
  auth.uid() = asesor_id 
  OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
```

**For users table (admin can see all, asesor only self):**

```sql
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
USING (
  auth.uid() = id 
  OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
```

### 4. React Hook to Get Current User Role

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useUserRole() {
  const [role, setRole] = useState<'admin' | 'asesor' | 'coordinador' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(data?.role || null);
      setLoading(false);
    }

    getRole();
  }, []);

  return { role, loading };
}
```

## Common Mistakes

**Mistake 1:** Storing role only in JWT without RLS
- Problem: Frontend can fake a role in the JWT token
- Fix: Always enforce RLS policies at database level; JWT role is only for UI logic

**Mistake 2:** Forgetting to enable RLS
- Problem: Without `ALTER TABLE leads ENABLE ROW LEVEL SECURITY`, policies don't apply
- Fix: Enable RLS explicitly for every table with sensitive data

**Mistake 3:** Circular dependencies in RLS (role check inside role check)
- Problem: Performance issues, potential for infinite loops
- Fix: Use simple equality checks; cache role in a separate lookup table if needed

**Mistake 4:** Not testing RLS from client
- Problem: Policies work in SQL editor but not from app
- Fix: Test with `supabase-js` client, not raw SQL. RLS only applies to client connections, not service role.

## Implementation Checklist

- [ ] Create `public.users` table with `role` column
- [ ] Create trigger to auto-create user record on signup
- [ ] Enable RLS on all sensitive tables (leads, offers, tasks)
- [ ] Write RLS policies for each role + table combination
- [ ] Create `useUserRole()` hook in React app
- [ ] Test RLS: asesor can't see other asesor's leads
- [ ] Test RLS: admin can see all leads
