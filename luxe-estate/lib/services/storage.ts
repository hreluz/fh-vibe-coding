import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';

export const PROPERTY_IMAGES_BUCKET = 'property-images';

export interface UploadImageResult {
  publicUrl: string;
  path: string;
  error?: string;
}

/**
 * Uploads a property image directly to the Supabase Storage 'property-images' bucket from the browser.
 * Generates a clean, timestamped path to avoid naming collisions.
 */
export async function uploadPropertyImage(
  file: File | Blob,
  fileName?: string
): Promise<UploadImageResult> {
  const { isConfigured } = getSupabaseEnv();

  // If Supabase is not fully configured, return a base64 / blob URL for demo mode
  if (!isConfigured) {
    const objectUrl = URL.createObjectURL(file);
    return {
      publicUrl: objectUrl,
      path: `demo/${Date.now()}-${fileName || 'image.jpg'}`,
    };
  }

  try {
    const supabase = createClient();
    const rawName = fileName || (file instanceof File ? file.name : 'property-image.jpg');
    
    // Sanitize file name: remove special chars, retain extension
    const ext = rawName.substring(rawName.lastIndexOf('.')) || '.jpg';
    const cleanBaseName = rawName
      .substring(0, rawName.lastIndexOf('.'))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filePath = `listings/${Date.now()}-${cleanBaseName || 'property'}-${randomSuffix}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return {
        publicUrl: '',
        path: '',
        error: uploadError.message,
      };
    }

    const { data: publicData } = supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    return {
      publicUrl: publicData.publicUrl,
      path: filePath,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to upload image';
    console.error('Exception in uploadPropertyImage:', message);
    return {
      publicUrl: '',
      path: '',
      error: message,
    };
  }
}

/**
 * Deletes an image from the 'property-images' bucket if it's hosted on Supabase Storage.
 */
export async function deletePropertyImage(
  pathOrUrl: string
): Promise<{ success: boolean; error?: string }> {
  const { isConfigured } = getSupabaseEnv();
  if (!isConfigured || !pathOrUrl) {
    return { success: true };
  }

  try {
    const supabase = createClient();

    // Extract path if a full public URL was provided
    let storagePath = pathOrUrl;
    if (pathOrUrl.includes(PROPERTY_IMAGES_BUCKET)) {
      const parts = pathOrUrl.split(`${PROPERTY_IMAGES_BUCKET}/`);
      if (parts.length > 1) {
        storagePath = parts[1];
      }
    }

    // Only delete if it's a valid relative path in the bucket
    if (!storagePath.startsWith('http://') && !storagePath.startsWith('https://')) {
      const { error } = await supabase.storage
        .from(PROPERTY_IMAGES_BUCKET)
        .remove([storagePath]);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete image';
    return { success: false, error: message };
  }
}
