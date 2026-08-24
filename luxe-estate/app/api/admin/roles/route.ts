import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUserRole, getAllUserRoles, updateUserRole } from '@/lib/services/roles';
import { UserRole } from '@/types/database';

export async function GET() {
  try {
    const { isAdmin } = await getCurrentUserRole();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const users = await getAllUserRoles();
    return NextResponse.json({ users });
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
