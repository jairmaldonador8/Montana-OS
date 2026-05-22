'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function useUserRole() {
  const [role, setRole] = useState<'admin' | 'asesor' | 'coordinador' | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getRole() {
      try {
        const supabase = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole(null);
          setUserId(null);
          setLoading(false);
          return;
        }

        setUserId(user.id);

        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single() as any;

        setRole((data?.role as 'admin' | 'asesor' | 'coordinador' | null) || null);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setRole(null);
        setLoading(false);
      }
    }

    getRole();
  }, []);

  return { role, userId, loading };
}
