import { createAdminClient, createServerClient } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase/ssr';
import { UserRole, UserRoleRow } from '@/types/database';
import { getSupabaseEnv } from '@/lib/supabase/env';

export interface CurrentUserRoleResult {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
  role: UserRole | null;
  isAdmin: boolean;
}

export interface AdminDashboardStats {
  totalProperties: number;
  forSaleCount: number;
  forRentCount: number;
  featuredCount: number;
  averagePrice: number;
  totalUsers: number;
  adminCount: number;
  userCount: number;
}

/**
 * Gets the current authenticated user and their assigned role.
 */
export async function getCurrentUserRole(): Promise<CurrentUserRoleResult> {
  const env = getSupabaseEnv();
  if (!env.isConfigured) {
    return { user: null, role: null, isAdmin: false };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, role: null, isAdmin: false };
    }

    const email = user.email || '';

    // Fetch user_roles row directly from database
    const { data: roleRow, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError) {
      console.error('Error fetching user_roles row:', roleError.message);
    }

    const resolvedRole: UserRole = roleRow?.role || 'user';

    const fullName =
      roleRow?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      email.split('@')[0] ||
      'User';

    const avatarUrl =
      roleRow?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;

    return {
      user: {
        id: user.id,
        email,
        fullName,
        avatarUrl,
      },
      role: resolvedRole,
      isAdmin: resolvedRole === 'admin',
    };
  } catch (err) {
    console.error('getCurrentUserRole exception:', err);
    return { user: null, role: null, isAdmin: false };
  }
}

export interface GetPaginatedUserRolesOptions {
  page?: number;
  pageSize?: number;
  query?: string;
  role?: 'all' | 'admin' | 'user';
}

export interface PaginatedUsersResult {
  users: UserRoleRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

/**
 * Lists registered users with server-side pagination, search, and role filtering.
 * Requires admin privileges.
 */
export async function getPaginatedUserRoles({
  page = 1,
  pageSize = 10,
  query = '',
  role = 'all',
}: GetPaginatedUserRolesOptions = {}): Promise<PaginatedUsersResult> {
  const currentPage = Math.max(1, page);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const adminClient = createAdminClient();
    const client = adminClient || (await createServerSupabaseClient());

    let dbQuery = client.from('user_roles').select('*', { count: 'exact' });

    if (role && role !== 'all') {
      dbQuery = dbQuery.eq('role', role);
    }

    if (query && query.trim() !== '') {
      const term = query.trim();
      dbQuery = dbQuery.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
    }

    dbQuery = dbQuery.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await dbQuery;

    if (error) {
      console.error('getPaginatedUserRoles error:', error.message);
      return {
        users: [],
        total: 0,
        page: currentPage,
        pageSize,
        totalPages: 0,
        hasPrevPage: false,
        hasNextPage: false,
      };
    }

    const users = data || [];
    const total = count || users.length;
    const totalPages = Math.ceil(total / pageSize);

    return {
      users,
      total,
      page: currentPage,
      pageSize,
      totalPages,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  } catch (err) {
    console.error('getPaginatedUserRoles exception:', err);
    return {
      users: [],
      total: 0,
      page: currentPage,
      pageSize,
      totalPages: 0,
      hasPrevPage: false,
      hasNextPage: false,
    };
  }
}

/**
 * Lists all registered users and their roles for the Admin panel.
 * Requires admin privileges.
 */
export async function getAllUserRoles(): Promise<UserRoleRow[]> {
  try {
    const adminClient = createAdminClient();
    if (adminClient) {
      const { data, error } = await adminClient
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('getAllUserRoles error via admin client:', error.message);
        return [];
      }
      return data || [];
    }

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAllUserRoles error:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('getAllUserRoles exception:', err);
    return [];
  }
}

/**
 * Updates a target user's role.
 * Includes safeguard to prevent an admin from demoting themselves.
 */
export async function updateUserRole(
  targetUserId: string,
  newRole: UserRole,
  requestingUserId: string
): Promise<{ success: boolean; error?: string }> {
  if (targetUserId === requestingUserId && newRole !== 'admin') {
    return {
      success: false,
      error: 'Self-demotion is not allowed. Another administrator must change your role to prevent accidental lockout.',
    };
  }

  try {
    const adminClient = createAdminClient();
    const client = adminClient || (await createServerSupabaseClient());

    const { error } = await client
      .from('user_roles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUserId);

    if (error) {
      console.error('updateUserRole error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user role';
    return { success: false, error: message };
  }
}

/**
 * Toggles a property's featured status.
 */
export async function togglePropertyFeatured(
  propertyId: string,
  isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminClient = createAdminClient();
    const client = adminClient || (await createServerSupabaseClient());

    const { error } = await client
      .from('properties')
      .update({
        is_featured: isFeatured,
      })
      .eq('id', propertyId);

    if (error) {
      console.error('togglePropertyFeatured error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to toggle featured status';
    return { success: false, error: message };
  }
}

/**
 * Calculates aggregate statistics for the Admin Dashboard overview.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const defaultStats: AdminDashboardStats = {
    totalProperties: 0,
    forSaleCount: 0,
    forRentCount: 0,
    featuredCount: 0,
    averagePrice: 0,
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
  };

  try {
    const client = createServerClient();
    const adminClient = createAdminClient() || client;

    // Fetch properties stats
    const { data: properties, error: propError } = await client
      .from('properties')
      .select('id, price, listing_type, is_featured');

    if (!propError && properties) {
      defaultStats.totalProperties = properties.length;
      defaultStats.forSaleCount = properties.filter((p) => p.listing_type === 'for_sale').length;
      defaultStats.forRentCount = properties.filter((p) => p.listing_type === 'for_rent').length;
      defaultStats.featuredCount = properties.filter((p) => p.is_featured).length;
      
      if (properties.length > 0) {
        const sum = properties.reduce((acc, p) => acc + (Number(p.price) || 0), 0);
        defaultStats.averagePrice = Math.round(sum / properties.length);
      }
    }

    // Fetch users stats
    const { data: users, error: userError } = await adminClient
      .from('user_roles')
      .select('id, role');

    if (!userError && users) {
      defaultStats.totalUsers = users.length;
      defaultStats.adminCount = users.filter((u) => u.role === 'admin').length;
      defaultStats.userCount = users.filter((u) => u.role === 'user').length;
    }

    return defaultStats;
  } catch (err) {
    console.error('getAdminDashboardStats exception:', err);
    return defaultStats;
  }
}
