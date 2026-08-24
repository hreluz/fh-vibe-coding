import React from 'react';
import { getCurrentUserRole, getAllUserRoles, getAdminDashboardStats } from '@/lib/services/roles';
import { getPaginatedProperties } from '@/lib/services/properties';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { user, isAdmin } = await getCurrentUserRole();

  if (!isAdmin) {
    redirect('/unauthorized');
  }

  // Fetch initial data in parallel
  const [propertiesResult, users, stats] = await Promise.all([
    getPaginatedProperties({ pageSize: 100 }),
    getAllUserRoles(),
    getAdminDashboardStats(),
  ]);

  return (
    <AdminDashboardClient
      initialProperties={propertiesResult.properties}
      initialUsers={users}
      initialStats={stats}
      currentUserId={user?.id || null}
    />
  );
}
