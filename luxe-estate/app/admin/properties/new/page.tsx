import React from 'react';
import { getCurrentUserRole } from '@/lib/services/roles';
import { redirect } from 'next/navigation';
import { PropertyForm } from '@/components/admin/PropertyForm';

export const metadata = {
  title: 'Add New Property | Luxe Estate Admin',
  description: 'Create a new luxury real estate listing.',
};

export const dynamic = 'force-dynamic';

export default async function NewPropertyPage() {
  const { isAdmin } = await getCurrentUserRole();

  if (!isAdmin) {
    redirect('/unauthorized');
  }

  return (
    <div className="w-full">
      <PropertyForm mode="create" />
    </div>
  );
}
