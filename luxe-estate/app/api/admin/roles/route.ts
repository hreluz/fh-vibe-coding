import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUserRole, getPaginatedUserRoles, updateUserRole } from '@/lib/services/roles';
import { UserRole } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const query = searchParams.get('query') || undefined;
    const role = (searchParams.get('role') as 'all' | 'admin' | 'user') || 'all';

    const result = await getPaginatedUserRoles({
      page,
      pageSize,
      query,
      role,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, isAdmin } = await getCurrentUserRole();
    if (!isAdmin || !user) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { targetUserId, role } = body;

    if (!targetUserId || !role) {
      return NextResponse.json(
        { error: 'Missing targetUserId or role in request body' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json(
        { error: `Invalid role: "${role}". Must be "admin" or "user".` },
        { status: 400 }
      );
    }

    const result = await updateUserRole(targetUserId, role as UserRole, user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, targetUserId, role });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user role';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
