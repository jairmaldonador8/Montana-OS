'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Lead } from '@/types/pipeline';

export function usePipelineLeads(filters?: {
  status?: string;
  assigned_to?: string;
}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from API endpoint
        const params = new URLSearchParams();
        if (filters?.status) {
          params.append('status', filters.status);
        }
        if (filters?.assigned_to) {
          params.append('assigned_to', filters.assigned_to);
        }

        const response = await fetch(`/api/pipeline/leads?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch leads: ${response.statusText}`);
        }

        const data = await response.json();
        setLeads(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('pipeline-leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          // Prepend new lead to the beginning of the list
          setLeads((prev) => [payload.new as Lead, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          // Replace the updated lead in the list
          setLeads((prev) =>
            prev.map((l) => (l.id === payload.new.id ? (payload.new as Lead) : l))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          // Remove the deleted lead from the list
          setLeads((prev) => prev.filter((l) => l.id !== payload.old.id));
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [filters?.status, filters?.assigned_to]);

  const updateStatus = useCallback(
    async (leadId: string, newStatus: string, notes?: string) => {
      try {
        const response = await fetch(`/api/pipeline/leads/${leadId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, notes }),
        });

        if (!response.ok) {
          throw new Error('Failed to update status');
        }

        const updated = await response.json();
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? updated : l))
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Update failed';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  return { leads, loading, error, updateStatus };
}
