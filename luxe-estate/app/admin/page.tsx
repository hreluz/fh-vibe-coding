import React from 'react';
import { getCurrentUserRole, getPaginatedUserRoles, getAdminDashboardStats } from '@/lib/services/roles';
import { getPaginatedProperties } from '@/lib/services/properties';
import { AdminDashboardClient, TabType } from '@/components/admin/AdminDashboardClient';
import { CategoryFilterType, ListingFilterType } from '@/types/property';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface AdminPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    pageSize?: string;
    query?: string;
    category?: string;
    listingType?: string;
    featured?: string;
    status?: string;
    role?: string;
  }>;
}

export default async function AdminPage(props: AdminPageProps) {
  const { user, isAdmin } = await getCurrentUserRole();

  if (!isAdmin) {
    redirect('/unauthorized');
  }

  const searchParams = await props.searchParams;
  const tab: TabType = searchParams.tab === 'users' ? 'users' : 'properties';
  const page = parseInt(searchParams.page || '1', 10) || 1;
  const pageSize = parseInt(searchParams.pageSize || '10', 10) || 10;
  const query = searchParams.query || '';
  const category = (searchParams.category || 'all') as CategoryFilterType;
  const listingType = (searchParams.listingType || 'all') as ListingFilterType;
  const featured = searchParams.featured || 'all';
  const status = (searchParams.status || 'all') as 'all' | 'active' | 'inactive';
  const role = (searchParams.role || 'all') as 'all' | 'admin' | 'user';

  const isFeatured =
    featured === 'featured_only'
      ? true
      : featured === 'standard_only'
      ? false
      : undefined;

  // Fetch initial data in parallel
  const [propertiesResult, usersResult, stats] = await Promise.all([
    getPaginatedProperties({
      page: tab === 'properties' ? page : 1,
      pageSize,
      query: tab === 'properties' ? query : '',
      category: tab === 'properties' ? category : 'all',
      listingType: tab === 'properties' ? listingType : 'all',
      status: tab === 'properties' ? status : 'all',
      isFeatured: tab === 'properties' ? isFeatured : undefined,
    }),
    getPaginatedUserRoles({
      page: tab === 'users' ? page : 1,
      pageSize,
      query: tab === 'users' ? query : '',
      role: tab === 'users' ? role : 'all',
    }),
    getAdminDashboardStats(),
  ]);

  return (
    <AdminDashboardClient
      propertiesResult={propertiesResult}
      usersResult={usersResult}
      initialStats={stats}
      currentUserId={user?.id || null}
      initialTab={tab}
      initialPropertyFilters={{
        page: tab === 'properties' ? page : 1,
        pageSize,
        query: tab === 'properties' ? query : '',
        category,
        listingType,
        featured,
        status,
      }}
      initialUserFilters={{
        page: tab === 'users' ? page : 1,
        pageSize,
        query: tab === 'users' ? query : '',
        role,
      }}
    />
  );
}

