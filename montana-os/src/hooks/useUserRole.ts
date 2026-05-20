'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUserRole() {
  const [role, setRole] = useState<'admin' | 'asesor' | 'coordinador' | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getRole() {
      const supabase = createClient();
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

      setRole(data?.role as any || null);
      setLoading(false);
    }

    getRole();
  }, []);

  return { role, userId, loading };
}
