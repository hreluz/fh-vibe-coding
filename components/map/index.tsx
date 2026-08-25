'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import with SSR disabled to prevent Leaflet window reference errors
export const PropertyMap = dynamic(
  () => import('./PropertyMap').then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[220px] rounded-xl bg-[#19322F]/5 dark:bg-white/5 animate-pulse flex flex-col items-center justify-center text-[#5C706D] dark:text-gray-400">
        <span className="material-icons text-3xl mb-1 text-[#006655]/60 animate-bounce">
          place
        </span>
        <span className="text-xs font-medium">Loading Map...</span>
      </div>
    ),
  }
);
