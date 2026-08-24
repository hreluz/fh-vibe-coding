import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Database, UserRole } from '../types/database';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env.local.');
  console.error('To manage user roles via CLI, SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  const args = process.argv.slice(2);
  const emailOrId = args[0];
  const roleInput = (args[1] || 'admin').toLowerCase() as UserRole;

  if (!emailOrId) {
    console.log('📖 Usage: npm run db:set-admin <user-email-or-id> [admin|user]');
    console.log('\nListing current users in database:');
    const { data: users, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch users:', error.message);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.log('No user records found in user_roles table.');
    } else {
      console.table(
        users.map((u) => ({
          ID: u.id,
          'User ID': u.user_id,
          Email: u.email,
          Name: u.full_name,
          Role: u.role,
          Created: u.created_at,
        }))
      );
    }
    process.exit(0);
  }

  if (roleInput !== 'admin' && roleInput !== 'user') {
    console.error(`❌ Invalid role: "${roleInput}". Must be "admin" or "user".`);
    process.exit(1);
  }

  console.log(`🔍 Looking for user matching "${emailOrId}"...`);

  // First try finding in user_roles by email or user_id
  let isUserId = emailOrId.includes('-') && emailOrId.length > 20;
  let query = supabase.from('user_roles').select('*');
  if (isUserId) {
    query = query.or(`user_id.eq.${emailOrId},id.eq.${emailOrId},email.eq.${emailOrId}`);
  } else {
    query = query.eq('email', emailOrId);
  }

  const { data: matchedRecords, error: fetchErr } = await query;

  if (fetchErr) {
    console.error('❌ Error querying user_roles:', fetchErr.message);
    process.exit(1);
  }

  if (matchedRecords && matchedRecords.length > 0) {
    const userRole = matchedRecords[0];
    const { error: updateErr } = await supabase
      .from('user_roles')
      .update({ role: roleInput, updated_at: new Date().toISOString() })
      .eq('id', userRole.id);

    if (updateErr) {
      console.error('❌ Failed to update role:', updateErr.message);
      process.exit(1);
    }

    console.log(`✅ Success! Updated user ${userRole.email} (${userRole.user_id}) to role: "${roleInput}".`);
    process.exit(0);
  }

  // If not found in user_roles table, check auth.users directly
  console.log('User not in user_roles table, querying auth.users...');
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) {
    console.error('❌ Failed to query auth users:', authErr.message);
    process.exit(1);
  }

  const foundAuthUser = authData.users.find(
    (u) => u.email?.toLowerCase() === emailOrId.toLowerCase() || u.id === emailOrId
  );

  if (!foundAuthUser) {
    console.error(`❌ User "${emailOrId}" not found in auth.users or user_roles.`);
    process.exit(1);
  }

  // Insert into user_roles
  const email = foundAuthUser.email || '';
  const fullName =
    foundAuthUser.user_metadata?.full_name ||
    foundAuthUser.user_metadata?.name ||
    foundAuthUser.user_metadata?.user_name ||
    email.split('@')[0] ||
    'User';
  const avatarUrl =
    foundAuthUser.user_metadata?.avatar_url ||
    foundAuthUser.user_metadata?.picture ||
    foundAuthUser.user_metadata?.avatar ||
    null;

  const { error: insertErr } = await supabase.from('user_roles').upsert({
    user_id: foundAuthUser.id,
    email,
    full_name: fullName,
    avatar_url: avatarUrl,
    role: roleInput,
    updated_at: new Date().toISOString(),
  });

  if (insertErr) {
    console.error('❌ Failed to upsert user_role record:', insertErr.message);
    process.exit(1);
  }

  console.log(`✅ Success! Created user_role for ${email} with role "${roleInput}".`);
}

main().catch((err) => {
  console.error('Unhandled script error:', err);
  process.exit(1);
});
