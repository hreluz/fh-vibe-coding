# Best Practices — Luxe Estate (Next.js Real Estate)

## 1. Next.js App Router & Architecture
- **Server Components by default**: Keep data fetching, database queries, and heavy rendering on the server (`app/page.tsx`, listing grids, detail views).
- **Client Components at the leaves**: Limit `"use client"` to interactive UI elements only (filter panels, image carousels, favorite buttons, modals, interactive maps).
- **URL-driven state management**: Store search, filter, pagination (`?page=1`), category (`?category=villa`), and sort options in URL `searchParams` for instant bookmarking and shareable links.
- **Debounced search inputs**: Debounce text search by 300–400ms before updating `URLSearchParams` to prevent excessive server requests.
- **Streaming with Suspense**: Wrap async listing sections in `<Suspense>` with skeleton fallbacks to achieve fast time-to-first-byte (TTFB).
- **Zero layout shift (CLS)**: Match skeleton loaders strictly to the dimensions, aspect ratios, and grid layout of real property cards.
- **Server Actions for mutations**: Use `'use server'` actions for inquiries, viewing bookings, and favorite toggles instead of custom API endpoints.
- **Zod validation**: Validate all form inputs and mutation payloads on both client and server before touching the database.
- **Optimistic UI**: Use `useOptimistic` for instantaneous feedback on interactions like favoriting or bookmarking a property.
- **On-demand cache revalidation**: Use `revalidatePath()` or `revalidateTag()` when property data or listing statuses are updated in the database.

## 2. Supabase & Database Performance
- **Server-side range pagination**: Use `.range(from, to)` in Supabase queries rather than fetching full datasets and slicing client-side.
- **Selective column querying**: Fetch only required fields (`id, title, slug, price, location, specs, imageUrl`) on listing cards instead of `SELECT *`.
- **Optimized count queries**: Use `{ count: 'exact', head: false }` only when page counts are strictly necessary, or switch to cursor/infinite scroll for large datasets.
- **B-Tree indexes**: Add composite and partial indexes for common query filters (`category`, `listing_type`, `price`, `is_featured`, `created_at`).
- **Full-Text Search (FTS)**: Utilize PostgreSQL `tsvector` and `GIN` indexes for multi-word property title, city, and description searches.
- **PostGIS geospatial queries**: Enable the `postgis` extension to support radius-based geolocation search ("Properties near me / within 10km").
- **Row Level Security (RLS)**: Enforce public read access for active listings and restrict write/delete permissions strictly to authenticated agents and admins.
- **Type generation**: Sync TypeScript definitions automatically with `npx supabase gen types typescript` to ensure end-to-end type safety.

## 3. Media & Performance Optimization
- **Responsive image sizing**: Always define precise `sizes` attributes in `next/image` (`sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`).
- **LCP image priority**: Set `priority={true}` only on the hero image or the first 1–2 visible property cards above the fold.
- **Blur placeholders (LQIP)**: Use `placeholder="blur"` with lightweight base64 blur data to prevent visual popping during image loads.
- **Fixed aspect ratios**: Enforce explicit aspect ratios (`aspect-[4/3]` or `aspect-[16/9]`) on card thumbnails to eliminate Cumulative Layout Shift (CLS).
- **Next-gen formats**: Ensure Supabase Storage and Next.js deliver images in modern WebP and AVIF formats automatically.
- **Client-side compression**: Compress uploaded property photos client-side prior to uploading to Supabase Storage.
- **Dynamic imports**: Lazy load heavy libraries (Mapbox/Leaflet, Three.js 3D tours, Recharts) using `next/dynamic({ ssr: false })`.

## 4. SEO & Metadata Standards
- **Dynamic metadata**: Use `generateMetadata()` to generate custom `title`, `description`, and `openGraph` images for each property page based on its details.
- **Schema.org JSON-LD structured data**: Include `SingleFamilyResidence` / `RealEstateListing` structured data with price, bedrooms, bathrooms, floor area, and geolocation for Google Rich Snippets.
- **Dynamic sitemap generation**: Maintain a dynamic `sitemap.ts` that includes all active property detail pages and category landing pages.
- **Canonical URLs**: Use canonical link tags to avoid duplicate content penalties between filtered search views and main listings.

## 5. Design System & UX Standards (Luxe Estate)
- **Strict color palette adherence**: Use Nordic (`#19322F`) for dark headers/text, Mosque (`#006655`) for primary actions, Hint of Green (`#D9ECC8`) for featured cards/badges, and Clear Day (`#EEF6F6`) for background canvas.
- **Typography consistency**: Use SF Pro Display with a clear hierarchy from micro-labels (`text-xs`) to hero headers (`text-5xl`).
- **Micro-animations & transitions**: Implement smooth hover elevations (`hover:-translate-y-1 hover:shadow-lg`) and heart button animations.
- **Touch target accessibility**: Ensure all buttons, filter pills, and navigation icons meet minimum 44x44px mobile touch targets.
- **Informative status badges**: Display distinct badges for *Exclusive*, *Featured*, *New Arrival*, and *For Sale / For Rent*.

## 6. Real Estate Feature Recommendations & Ideas
- **Interactive split-view map**: Synchronize property card hovers with interactive map pins and allow custom polygon area search.
- **Mortgage & affordability calculator**: Provide an interactive calculator with sliders for down payment, interest rate, loan term, taxes, and HOA fees.
- **Lead capture & viewing scheduler**: Embed a simple "Schedule a Tour" widget with date/time pickers and automated agent notifications.
- **Wishlist & price drop alerts**: Allow users to save favorite listings and opt into email/SMS notifications when prices drop.
- **Neighborhood & lifestyle data**: Integrate WalkScore, nearby schools, transit scores, and local amenities into property details.
- **360° virtual tour & video drone embeds**: Support Matterport 3D walkthroughs and high-definition video tours in photo modals.
- **Side-by-side property comparison**: Enable users to select multiple listings and compare square meters, price/m², amenities, and fees.
- **AI-assisted natural language search**: Allow users to search using natural phrases like *"3-bedroom penthouse with ocean view under $1.5M"*.

## 7. Error Handling & Edge Cases
- **User-friendly empty states**: Provide helpful suggestions and clear-filter buttons when filter combinations return zero results.
- **Image fallback handling**: Implement graceful placeholder fallbacks if an external property image fails to load or 404s.
- **Granular error boundaries**: Use route-level `error.tsx` so a single failed component doesn't crash the entire page.
- **Localized formatting helpers**: Use standard `Intl.NumberFormat` for currency display and support configurable metric (m²) vs imperial (sq ft) units.
