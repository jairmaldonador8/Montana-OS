import { NextRequest, NextResponse } from 'next/server';
import { createServerAuth } from '@/lib/auth/server-auth';
import { getPipelineAnalytics } from '@/lib/pipeline/queries';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerAuth();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analytics = await getPipelineAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
