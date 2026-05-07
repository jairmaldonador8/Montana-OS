'use client';

import { useEffect, useState } from 'react';
import { PipelineAnalytics } from '@/types/pipeline';

export function usePipelineAnalytics() {
  const [analytics, setAnalytics] = useState<PipelineAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/pipeline/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    // Refresh every 5 minutes as per spec
    const interval = setInterval(fetchAnalytics, 300000);

    return () => clearInterval(interval);
  }, []);

  return { analytics, loading, error };
}
