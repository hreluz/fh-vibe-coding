import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUserRole } from '@/lib/services/roles';
import { getPropertyById } from '@/lib/services/properties';
import { PropertyForm } from '@/components/admin/PropertyForm';

export const metadata = {
  title: 'Edit Property | Luxe Estate Admin',
  description: 'Update existing luxury real estate listing.',
};

export const dynamic = 'force-dynamic';

interface EditPropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPropertyPage(props: EditPropertyPageProps) {
  const { isAdmin } = await getCurrentUserRole();

  if (!isAdmin) {
    redirect('/unauthorized');
  }

  const { id } = await props.params;
  const property = await getPropertyById(id, { includeInactive: true });

  if (!property) {
    notFound();
  }

  return (
    <div className="w-full">
      <PropertyForm mode="edit" initialProperty={property} />
    </div>
  );
}
