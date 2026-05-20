'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export function useUserRole() {
  const [role, setRole] = useState<'admin' | 'asesor' | 'coordinador' | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getRole() {
      try {
        const supabase = createClientComponentClient<Database>();
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
          .single();

        setRole((data?.role as 'admin' | 'asesor' | 'coordinador') || null);
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
