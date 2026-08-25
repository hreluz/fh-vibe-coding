'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Property, PropertyCategory, ListingType, PropertyBadge } from '@/types/property';
import { uploadPropertyImage } from '@/lib/services/storage';
import { PropertyMap } from '@/components/map';

interface PropertyFormProps {
  mode: 'create' | 'edit';
  initialProperty?: Property | null;
}

const COMMON_AMENITIES = [
  'Swimming Pool',
  'Garden',
  'Air Conditioning',
  'Smart Home System',
  'Private Gym & Spa',
  'Wine Cellar',
  'EV Charging Station',
  '24/7 Security & Concierge',
  'Panoramic Views',
  'Private Elevator',
];

export function PropertyForm({ mode, initialProperty }: PropertyFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [, startTransition] = useTransition();

  // Form Fields State
  const [title, setTitle] = useState(initialProperty?.title || '');
  const [slug, setSlug] = useState(initialProperty?.slug || '');
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(initialProperty?.slug));
  const [price, setPrice] = useState<string>(initialProperty ? String(initialProperty.price) : '');
  const [listingType, setListingType] = useState<ListingType>(initialProperty?.listingType || 'for_sale');
  const [category, setCategory] = useState<PropertyCategory>(initialProperty?.category || 'villa');
  const [description, setDescription] = useState(initialProperty?.description || '');
  
  // Location
  const [address, setAddress] = useState(initialProperty?.location.address || '');
  const [city, setCity] = useState(initialProperty?.location.city || '');
  const [state, setState] = useState(initialProperty?.location.state || '');
  const [country, setCountry] = useState(initialProperty?.location.country || 'USA');
  const [latitude, setLatitude] = useState<number>(initialProperty?.coordinates?.lat ?? 34.0736);
  const [longitude, setLongitude] = useState<number>(initialProperty?.coordinates?.lng ?? -118.4004);
  const [showCoords, setShowCoords] = useState(false);

  // Specs & Details
  const [areaSqMeters, setAreaSqMeters] = useState<string>(
    initialProperty ? String(initialProperty.specs.areaSqMeters) : '250'
  );
  const [yearBuilt, setYearBuilt] = useState<string>(
    initialProperty?.specs.yearBuilt ? String(initialProperty.specs.yearBuilt) : '2023'
  );
  const [bedrooms, setBedrooms] = useState<number>(initialProperty?.specs.bedrooms ?? 3);
  const [bathrooms, setBathrooms] = useState<number>(initialProperty?.specs.bathrooms ?? 2);
  const [garage, setGarage] = useState<number>(initialProperty?.specs.garage ?? 1);

  // Amenities
  const [amenities, setAmenities] = useState<string[]>(
    initialProperty?.amenities && initialProperty.amenities.length > 0
      ? initialProperty.amenities
      : ['Swimming Pool', 'Garden', 'Air Conditioning', 'Smart Home System']
  );
  const [customAmenityInput, setCustomAmenityInput] = useState('');

  // Marketing
  const [badge, setBadge] = useState<'none' | 'Exclusive' | 'New Arrival' | 'Featured'>(
    initialProperty?.badge ? initialProperty.badge : 'none'
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProperty?.isFeatured ?? false);

  // Images
  const [images, setImages] = useState<string[]>(
    initialProperty?.images && initialProperty.images.length > 0
      ? initialProperty.images
      : []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-generate slug when title changes (if user hasn't manually edited slug)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isCustomSlug && mode === 'create') {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Image Upload Handlers
  const handleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setErrorMsg(null);
    const newImageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}...`);
      
      const res = await uploadPropertyImage(file, file.name);
      if (res.error) {
        setErrorMsg(`Failed to upload ${file.name}: ${res.error}`);
      } else if (res.publicUrl) {
        newImageUrls.push(res.publicUrl);
      }
    }

    if (newImageUrls.length > 0) {
      setImages((prev) => [...prev, ...newImageUrls]);
    }
    setIsUploading(false);
    setUploadProgress(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  // Description formatting helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setDescription(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  // Amenities Handlers
  const toggleAmenity = (name: string) => {
    setAmenities((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleAddCustomAmenity = () => {
    if (!customAmenityInput.trim()) return;
    const trimmed = customAmenityInput.trim();
    if (!amenities.includes(trimmed)) {
      setAmenities((prev) => [...prev, trimmed]);
    }
    setCustomAmenityInput('');
  };

  // Save / Submit Handler
  const handleSave = async (isDraft: boolean = false) => {
    setErrorMsg(null);

    // Validation for full save
    if (!isDraft) {
      if (!title.trim()) {
        setErrorMsg('Property title is required.');
        return;
      }
      if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        setErrorMsg('Please enter a valid property price.');
        return;
      }
      if (!address.trim() && !city.trim()) {
        setErrorMsg('Please provide at least a street address or city.');
        return;
      }
    }

    setIsSaving(true);

    const locationFormatted = [address.trim(), city.trim(), state.trim(), country.trim()]
      .filter(Boolean)
      .join(', ');

    const payload = {
      title: title.trim() || 'Untitled Draft Property',
      slug: slug.trim() || undefined,
      price: Number(price) || 0,
      listingType,
      category,
      address: address.trim(),
      city: city.trim(),
      state: state.trim() || null,
      country: country.trim() || null,
      locationFormatted: locationFormatted || 'Location Pending',
      bedrooms,
      bathrooms,
      areaSqMeters: Number(areaSqMeters) || 0,
      garage,
      yearBuilt: yearBuilt ? Number(yearBuilt) : null,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      badge: badge === 'none' ? null : badge,
      isFeatured: isDraft ? false : isFeatured,
      description: description.trim() || null,
      amenities,
      latitude: latitude || 34.0736,
      longitude: longitude || -118.4004,
    };

    try {
      let res: Response;
      if (mode === 'create') {
        res = await fetch('/api/admin/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/properties/${initialProperty?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save property');
      }

      // Success -> Redirect back to admin properties list
      startTransition(() => {
        router.push('/admin?tab=properties');
        router.refresh();
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while saving';
      setErrorMsg(msg);
      setIsSaving(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!initialProperty?.id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/properties/${initialProperty.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete property');
      }
      startTransition(() => {
        router.push('/admin?tab=properties');
        router.refresh();
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete property';
      setErrorMsg(msg);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="text-[#19322F] dark:text-[#EEF6F6] min-h-screen">
      {/* Top Header & Breadcrumbs */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-neutral-800 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-neutral-400 font-medium">
              <li>
                <Link href="/admin?tab=properties" className="hover:text-[#006655] dark:hover:text-[#06f9d0] transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <span className="material-icons text-xs text-gray-400">chevron_right</span>
              </li>
              <li aria-current="page" className="text-[#19322F] dark:text-white font-semibold">
                {mode === 'create' ? 'Add New' : `Edit: ${initialProperty?.title || 'Property'}`}
              </li>
            </ol>
          </nav>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#19322F] dark:text-white tracking-tight mb-2">
              {mode === 'create' ? 'Add New Property' : 'Edit Property'}
            </h1>
            <p className="text-base text-gray-500 dark:text-neutral-400 max-w-2xl font-normal">
              {mode === 'create'
                ? 'Fill in the details below to create a new luxury listing. Fields marked with * are mandatory.'
                : 'Update listing specifications, photos, pricing, and availability status.'}
            </p>
          </div>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {mode === 'edit' && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-icons text-base">delete_outline</span>
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(true)}
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors font-medium text-sm disabled:opacity-50 cursor-pointer shadow-xs"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="px-5 py-2.5 rounded-lg bg-[#006655] hover:bg-[#19322F] dark:bg-[#06f9d0] dark:text-neutral-950 dark:hover:bg-[#006655] dark:hover:text-white text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <span className="material-icons text-sm animate-spin">refresh</span>
            ) : (
              <span className="material-icons text-sm">save</span>
            )}
            <span>{isSaving ? 'Saving...' : mode === 'create' ? 'Save Property' : 'Update Property'}</span>
          </button>
        </div>
      </header>

      {/* Error Alert Message */}
      {errorMsg && (
        <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 flex items-center gap-3">
          <span className="material-icons text-red-500">error_outline</span>
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Form Content Grid */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Basic Info, Description, Gallery */}
        <div className="xl:col-span-8 space-y-8">
          {/* 1. Basic Information Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-gray-100 dark:border-neutral-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#D9ECC8]/30 dark:border-neutral-800 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 dark:from-emerald-950/20 to-transparent">
              <div className="w-8 h-8 rounded-full bg-[#D9ECC8] dark:bg-[#006655]/40 flex items-center justify-center text-[#19322F] dark:text-[#06f9d0]">
                <span className="material-icons text-lg">info</span>
              </div>
              <h2 className="text-xl font-bold text-[#19322F] dark:text-white">Basic Information</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-[#19322F] dark:text-neutral-200 mb-1.5" htmlFor="title">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Modern Penthouse with Ocean View"
                  className="w-full text-base px-4 py-2.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] dark:focus:ring-[#06f9d0] focus:border-[#006655] transition-all"
                />
              </div>

              {/* URL Slug Field */}
              <div className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400" htmlFor="slug">
                    URL Slug
                  </label>
                  <span className="text-[11px] text-gray-400">
                    /properties/{slug || '...'}
                  </span>
                </div>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setIsCustomSlug(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, ''));
                  }}
                  placeholder="modern-penthouse-ocean-view"
                  className="w-full text-xs px-3 py-2 rounded-md border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/60 text-gray-700 dark:text-neutral-300 font-mono focus:ring-1 focus:ring-[#006655] focus:border-[#006655]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#19322F] dark:text-neutral-200 mb-1.5" htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-4 py-2.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#19322F] dark:text-neutral-200 mb-1.5" htmlFor="listingType">
                    Status / Listing Type
                  </label>
                  <select
                    id="listingType"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as ListingType)}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base cursor-pointer"
                  >
                    <option value="for_sale">For Sale</option>
                    <option value="for_rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#19322F] dark:text-neutral-200 mb-1.5" htmlFor="category">
                    Property Type
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base cursor-pointer capitalize"
                  >
                    <option value="villa">Villa</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="penthouse">Penthouse</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Description Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-gray-100 dark:border-neutral-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#D9ECC8]/30 dark:border-neutral-800 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 dark:from-emerald-950/20 to-transparent">
              <div className="w-8 h-8 rounded-full bg-[#D9ECC8] dark:bg-[#006655]/40 flex items-center justify-center text-[#19322F] dark:text-[#06f9d0]">
                <span className="material-icons text-lg">description</span>
              </div>
              <h2 className="text-xl font-bold text-[#19322F] dark:text-white">Description</h2>
            </div>
            <div className="p-8">
              <div className="mb-3 flex items-center gap-1 border-b border-gray-100 dark:border-neutral-800 pb-2">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  title="Bold"
                  className="p-1.5 text-gray-500 hover:text-[#19322F] dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition-colors"
                >
                  <span className="material-icons text-lg">format_bold</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  title="Italic"
                  className="p-1.5 text-gray-500 hover:text-[#19322F] dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition-colors"
                >
                  <span className="material-icons text-lg">format_italic</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n• ')}
                  title="Bullet List"
                  className="p-1.5 text-gray-500 hover:text-[#19322F] dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition-colors"
                >
                  <span className="material-icons text-lg">format_list_bulleted</span>
                </button>
              </div>
              <textarea
                ref={textareaRef}
                id="description"
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the property architectural features, neighborhood, views, and unique luxury selling points..."
                className="w-full px-4 py-3 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base leading-relaxed resize-y min-h-[200px]"
              />
              <div className="mt-2 text-right text-xs text-gray-400 dark:text-neutral-500">
                {description.length} / 2000 characters
              </div>
            </div>
          </div>

          {/* 3. Gallery Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-gray-100 dark:border-neutral-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#D9ECC8]/30 dark:border-neutral-800 flex justify-between items-center bg-gradient-to-r from-[#D9ECC8]/10 dark:from-emerald-950/20 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D9ECC8] dark:bg-[#006655]/40 flex items-center justify-center text-[#19322F] dark:text-[#06f9d0]">
                  <span className="material-icons text-lg">image</span>
                </div>
                <h2 className="text-xl font-bold text-[#19322F] dark:text-white">Gallery</h2>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
                JPG, PNG, WEBP, AVIF
              </span>
            </div>

            <div className="p-8">
              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer group ${
                  isDragging
                    ? 'border-[#006655] bg-[#D9ECC8]/20'
                    : 'border-gray-300 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/30 hover:bg-[#D9ECC8]/10 dark:hover:bg-neutral-800/60 hover:border-[#006655]/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) handleFilesUpload(e.target.files);
                  }}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-xs text-[#006655] dark:text-[#06f9d0] group-hover:scale-110 transition-transform duration-300">
                    <span className="material-icons text-2xl">cloud_upload</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-medium text-[#19322F] dark:text-white">
                      Click or drag images here to upload
                    </p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">
                      Uploaded directly to Supabase Storage bucket &bull; Max 10MB per photo
                    </p>
                  </div>
                  {isUploading && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#006655] dark:text-[#06f9d0]">
                      <span className="material-icons text-sm animate-spin">refresh</span>
                      <span>{uploadProgress || 'Uploading images...'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Images Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {images.map((imgUrl, index) => (
                    <div
                      key={`${imgUrl}-${index}`}
                      className="aspect-square rounded-lg overflow-hidden relative group shadow-xs border border-gray-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Property preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Overlay action buttons */}
                      <div className="absolute inset-0 bg-[#19322F]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(index);
                          }}
                          title="Delete image"
                          className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                        >
                          <span className="material-icons text-sm">delete</span>
                        </button>
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetMainImage(index);
                            }}
                            title="Set as Main Cover"
                            className="w-8 h-8 rounded-full bg-white text-[#19322F] hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                          >
                            <span className="material-icons text-sm">star_border</span>
                          </button>
                        )}
                      </div>

                      {/* Main Badge for the 1st photo */}
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-[#006655] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                          Main
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add More Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 flex flex-col items-center justify-center text-gray-400 hover:text-[#006655] dark:hover:text-[#06f9d0] hover:border-[#006655] hover:bg-[#D9ECC8]/20 transition-all group cursor-pointer"
                  >
                    <span className="material-icons group-hover:scale-110 transition-transform">add</span>
                    <span className="text-xs mt-1 font-medium">Add More</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Location, Details, Amenities, Marketing */}
        <div className="xl:col-span-4 space-y-8">
          {/* Location Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-gray-100 dark:border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9ECC8]/30 dark:border-neutral-800 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 dark:from-emerald-950/20 to-transparent">
              <div className="w-8 h-8 rounded-full bg-[#D9ECC8] dark:bg-[#006655]/40 flex items-center justify-center text-[#19322F] dark:text-[#06f9d0]">
                <span className="material-icons text-lg">place</span>
              </div>
              <h2 className="text-lg font-bold text-[#19322F] dark:text-white">Location</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#19322F] dark:text-neutral-200 mb-1.5" htmlFor="address">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 1004 Benedict Canyon Dr"
                  className="w-full px-4 py-2.5 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Beverly Hills"
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white text-sm focus:ring-1 focus:ring-[#006655]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1" htmlFor="state">
                    State / Region
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="California"
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white text-sm focus:ring-1 focus:ring-[#006655]"
                  />
                </div>
              </div>

              {/* Coordinates Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowCoords(!showCoords)}
                  className="text-xs text-[#006655] dark:text-[#06f9d0] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-icons text-sm">{showCoords ? 'expand_less' : 'tune'}</span>
                  <span>{showCoords ? 'Hide Lat / Lng' : 'Set GPS Coordinates'}</span>
                </button>
                {showCoords && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-0.5">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[#19322F] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-0.5">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[#19322F] dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Map Preview Widget */}
              <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
                <PropertyMap
                  lat={latitude}
                  lng={longitude}
                  title={title || 'Location Pin'}
                  locationName={address ? `${address}, ${city}` : 'Map Preview'}
                  priceFormatted={price ? `$${Number(price).toLocaleString()}` : undefined}
                  interactive={true}
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>

          {/* Details Card (Area, Year, Steppers, Amenities, Marketing) */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-gray-100 dark:border-neutral-800 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-[#D9ECC8]/30 dark:border-neutral-800 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 dark:from-emerald-950/20 to-transparent">
              <div className="w-8 h-8 rounded-full bg-[#D9ECC8] dark:bg-[#006655]/40 flex items-center justify-center text-[#19322F] dark:text-[#06f9d0]">
                <span className="material-icons text-lg">straighten</span>
              </div>
              <h2 className="text-lg font-bold text-[#19322F] dark:text-white">Details</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Area & Year Built */}
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-xs text-gray-500 dark:text-neutral-400 font-medium mb-1 block" htmlFor="area">
                    Area (m²)
                  </label>
                  <input
                    id="area"
                    type="number"
                    min="0"
                    value={areaSqMeters}
                    onChange={(e) => setAreaSqMeters(e.target.value)}
                    placeholder="0"
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[#19322F] dark:text-white focus:bg-white dark:focus:bg-neutral-800 focus:ring-1 focus:ring-[#006655] transition-all text-sm"
                  />
                </div>
                <div className="group">
                  <label className="text-xs text-gray-500 dark:text-neutral-400 font-medium mb-1 block" htmlFor="yearBuilt">
                    Year Built
                  </label>
                  <input
                    id="yearBuilt"
                    type="number"
                    min="1800"
                    max="2030"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    placeholder="YYYY"
                    className="w-full text-left px-3 py-2 rounded border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[#19322F] dark:text-white focus:bg-white dark:focus:bg-neutral-800 focus:ring-1 focus:ring-[#006655] transition-all text-sm"
                  />
                </div>
              </div>

              <hr className="border-gray-100 dark:border-neutral-800" />

              {/* Steppers */}
              <div className="space-y-4">
                {/* Bedrooms */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#19322F] dark:text-neutral-200 flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">bed</span> Bedrooms
                  </label>
                  <div className="flex items-center border border-gray-200 dark:border-neutral-700 rounded-md overflow-hidden bg-white dark:bg-neutral-800 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setBedrooms((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 transition-colors border-r border-gray-100 dark:border-neutral-700 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={bedrooms}
                      className="w-10 text-center border-none bg-transparent text-[#19322F] dark:text-white p-0 focus:ring-0 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setBedrooms((prev) => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 transition-colors border-l border-gray-100 dark:border-neutral-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#19322F] dark:text-neutral-200 flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">shower</span> Bathrooms
                  </label>
                  <div className="flex items-center border border-gray-200 dark:border-neutral-700 rounded-md overflow-hidden bg-white dark:bg-neutral-800 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setBathrooms((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 transition-colors border-r border-gray-100 dark:border-neutral-700 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={bathrooms}
                      className="w-10 text-center border-none bg-transparent text-[#19322F] dark:text-white p-0 focus:ring-0 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setBathrooms((prev) => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 transition-colors border-l border-gray-100 dark:border-neutral-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Parking */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#19322F] dark:text-neutral-200 flex items-center gap-2">
                    <span className="material-icons text-gray-400 text-sm">directions_car</span> Parking / Garage
                  </label>
                  <div className="flex items-center border border-gray-200 dark:border-neutral-700 rounded-md overflow-hidden bg-white dark:bg-neutral-800 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setGarage((prev) => Math.max(0, prev - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 transition-colors border-r border-gray-100 dark:border-neutral-700 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={garage}
                      className="w-10 text-center border-none bg-transparent text-[#19322F] dark:text-white p-0 focus:ring-0 text-sm font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setGarage((prev) => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 transition-colors border-l border-gray-100 dark:border-neutral-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-neutral-800" />

              {/* Amenities List */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">
                  Amenities
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {COMMON_AMENITIES.map((amenity) => {
                    const checked = amenities.includes(amenity);
                    return (
                      <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAmenity(amenity)}
                          className="w-4 h-4 text-[#006655] border-gray-300 dark:border-neutral-700 rounded focus:ring-[#006655] cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 dark:text-neutral-300 group-hover:text-[#19322F] dark:group-hover:text-white transition-colors">
                          {amenity}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Custom Amenity Adder */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Custom amenity..."
                    value={customAmenityInput}
                    onChange={(e) => setCustomAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomAmenity();
                      }
                    }}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[#19322F] dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAmenity}
                    className="px-2.5 py-1.5 rounded bg-gray-100 dark:bg-neutral-800 text-xs font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 text-[#19322F] dark:text-white"
                  >
                    Add
                  </button>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-neutral-800" />

              {/* Marketing: Badge & Featured */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-neutral-400 font-medium mb-1 block" htmlFor="badge">
                    Marketing Badge
                  </label>
                  <select
                    id="badge"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as 'none' | 'Exclusive' | 'New Arrival' | 'Featured')}
                    className="w-full px-3 py-2 rounded border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-[#19322F] dark:text-white text-xs cursor-pointer"
                  >
                    <option value="none">None (Standard)</option>
                    <option value="Exclusive">Exclusive</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Featured">Featured</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-sm font-medium text-[#19322F] dark:text-white">Featured Listing</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">Show on homepage showcase</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isFeatured ? 'bg-[#006655]' : 'bg-gray-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isFeatured ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Save Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-gray-200 dark:border-neutral-800 shadow-xl md:hidden z-40 flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin?tab=properties')}
            className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#19322F] dark:text-white font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="flex-1 py-3 rounded-lg bg-[#006655] dark:bg-[#06f9d0] dark:text-neutral-950 text-white font-medium text-sm flex justify-center items-center gap-2"
          >
            {isSaving ? 'Saving...' : mode === 'create' ? 'Save Property' : 'Update'}
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <span className="material-icons text-2xl">warning</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Delete Property Listing?</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Are you sure you want to delete <strong className="text-neutral-900 dark:text-white">{initialProperty?.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1.5"
              >
                {isDeleting && <span className="material-icons text-xs animate-spin">refresh</span>}
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
