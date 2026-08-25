import { NextResponse } from 'next/server';
import { getCurrentUserRole, getAdminDashboardStats } from '@/lib/services/roles';

export async function GET() {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const stats = await getAdminDashboardStats();
    return NextResponse.json({ stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
