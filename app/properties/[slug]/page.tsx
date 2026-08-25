import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout';
import {
  PropertyGallery,
  PropertySidebar,
  PropertyFeatures,
} from '@/components/property-detail';
import { getPropertyBySlug, getAllPropertySlugs } from '@/lib/services/properties';
import { getCurrentUserRole } from '@/lib/services/roles';
import { COOKIE_NAME, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { getTranslation, Locale } from '@/lib/i18n';

interface PropertyDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

/**
 * Dynamic SEO metadata generation based on the property details.
 */
export async function generateMetadata(
  props: PropertyDetailPageProps
): Promise<Metadata> {
  const params = await props.params;
  const property = await getPropertyBySlug(params.slug, { includeInactive: true });

  if (!property) {
    return {
      title: 'Property Not Found | LuxeEstate',
      description: 'The requested luxury property listing could not be found.',
    };
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price);

  const priceSuffix = property.listingType === 'for_rent' ? '/mo' : '';
  const isDeactivated = property.isActive === false;
  const pageTitle = `${isDeactivated ? '[Deactivated] ' : ''}${property.title} - ${formattedPrice}${priceSuffix} | LuxeEstate`;
  const pageDescription =
    property.description?.slice(0, 160) ||
    `Explore ${property.title} in ${property.location.formatted}. Featuring ${property.specs.bedrooms} beds, ${property.specs.bathrooms} baths, and ${property.specs.areaSqMeters} m² of living space.`;

  return {
    title: pageTitle,
    description: pageDescription,
    robots: isDeactivated ? { index: false, follow: false } : undefined,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: property.images[0] || '',
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: 'website',
    },
  };
}

/**
 * Generate static params for fast static generation of known slugs.
 */
export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PropertyDetailPage(props: PropertyDetailPageProps) {
  const params = await props.params;
  const { isAdmin } = await getCurrentUserRole();
  const property = await getPropertyBySlug(params.slug, { includeInactive: isAdmin });

  if (!property) {
    notFound();
  }

  if (property.isActive === false && !isAdmin) {
    notFound();
  }

  const cookieStore = await cookies();
  const locale = (cookieStore.get(COOKIE_NAME)?.value || DEFAULT_LOCALE) as Locale;
  const t = (key: string, tParams?: Record<string, string | number>) =>
    getTranslation(locale, key, tParams);

  // Schema.org JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: property.images,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'USD',
      availability: property.isActive === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location.address,
      addressLocality: property.location.city,
      addressRegion: property.location.state,
      addressCountry: property.location.country,
    },
    numberOfBedrooms: property.specs.bedrooms,
    numberOfBathroomsTotal: property.specs.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.specs.areaSqMeters,
      unitCode: 'MTK',
    },
    ...(property.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: property.coordinates.lat,
        longitude: property.coordinates.lng,
      },
    }),
  };

  const activeNavTab = property.listingType === 'for_rent' ? 'Rent' : 'Buy';

  return (
    <div className="min-h-screen bg-[#EEF6F6] dark:bg-[#0f231f] text-[#19322F] dark:text-white flex flex-col font-sans transition-colors duration-200">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar with brand logo linking to home */}
      <Navbar activeTab={activeNavTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Deactivated Listing Admin Preview Banner */}
        {property.isActive === false && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
                <span className="material-icons text-xl">visibility_off</span>
              </div>
              <div>
                <p className="text-sm font-bold">Administrator Preview: Listing Deactivated</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  This property is deactivated and hidden from public search, category filters, and featured showcases.
                </p>
              </div>
            </div>
            <Link
              href={`/admin/properties/${property.id}/edit`}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto shrink-0"
            >
              <span className="material-icons text-sm">edit</span>
              <span>Edit in Admin</span>
            </Link>
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-[#5C706D] dark:text-gray-400 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide"
        >
          <Link
            href="/"
            className="hover:text-[#006655] dark:hover:text-[#06f9d0] transition-colors flex items-center gap-1"
          >
            <span className="material-icons text-sm">home</span>
            <span>{t('propertyDetail.home')}</span>
          </Link>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <Link
            href={property.listingType === 'for_rent' ? '/?type=for_rent' : '/?type=for_sale'}
            className="hover:text-[#006655] dark:hover:text-[#06f9d0] transition-colors"
          >
            {property.listingType === 'for_rent'
              ? t('propertyDetail.forRent')
              : t('propertyDetail.forSale')}
          </Link>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span className="text-[#19322F] dark:text-white font-semibold truncate max-w-xs sm:max-w-sm">
            {property.title}
          </span>
        </nav>

        {/* 12-Column Responsive Layout matching code.html */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Main Column: Gallery (col-span-8) */}
          <div className="lg:col-span-8">
            <PropertyGallery property={property} />
          </div>

          {/* Right Column: Pricing, Agent & Leaflet Map Sidebar (col-span-4) */}
          <div className="lg:col-span-4 relative">
            <PropertySidebar property={property} />
          </div>

          {/* Left Bottom Column: Features, Description, Amenities, Mortgage (col-span-8) */}
          <div className="lg:col-span-8 lg:row-start-2 -mt-2 sm:-mt-4">
            <PropertyFeatures property={property} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0b1b18] border-t border-slate-200 dark:border-white/10 mt-12 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-[#5C706D] dark:text-gray-400">
            © {new Date().getFullYear()} LuxeEstate Inc. {t('footer.allRightsReserved')}
          </div>
          <div className="flex gap-6 text-sm text-[#5C706D] dark:text-gray-400">
            <Link href="/" className="hover:text-[#006655] dark:hover:text-[#06f9d0] transition-colors">
              {t('footer.exploreHomes')}
            </Link>
            <Link href="/featured" className="hover:text-[#006655] dark:hover:text-[#06f9d0] transition-colors">
              {t('footer.featuredCollection')}
            </Link>
            <a href="#" className="hover:text-[#006655] dark:hover:text-[#06f9d0] transition-colors">
              {t('footer.privacyPolicy')}
            </a>
            <a href="#" className="hover:text-[#006655] dark:hover:text-[#06f9d0] transition-colors">
              {t('footer.termsOfService')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

