'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PropertyMapProps {
  lat?: number;
  lng?: number;
  title: string;
  locationName: string;
  priceFormatted?: string;
  zoom?: number;
  className?: string;
  interactive?: boolean;
}

export function PropertyMap({
  lat = 34.0736,
  lng = -118.4004,
  title,
  locationName,
  priceFormatted,
  zoom = 14,
  className = 'h-full w-full',
  interactive = true,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Validate coordinates to prevent Leaflet NaN crashes
  const validLat =
    typeof lat === 'number' && !isNaN(lat) && isFinite(lat) ? lat : 34.0736;
  const validLng =
    typeof lng === 'number' && !isNaN(lng) && isFinite(lng) ? lng : -118.4004;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [validLat, validLng],
        zoom,
        zoomControl: interactive,
        scrollWheelZoom: false,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Clean tiles from CartoDB Voyager
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      // Custom Luxury Marker Icon using Mosque (#006655)
      const customIcon = L.divIcon({
        className: 'custom-property-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-[#006655] border-4 border-white shadow-xl flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110">
              <span class="material-icons text-base" style="font-size: 18px;">home</span>
            </div>
            <div class="w-2 h-2 bg-[#006655] rotate-45 transform -translate-x-1/2 -translate-y-1 mt-3"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -25],
      });

      const marker = L.marker([validLat, validLng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div class="p-1 font-sans">
          <h4 class="font-bold text-sm text-[#19322F] mb-0.5">${title}</h4>
          <p class="text-xs text-[#5C706D]">${locationName}</p>
          ${
            priceFormatted
              ? `<p class="text-xs font-semibold text-[#006655] mt-1">${priceFormatted}</p>`
              : ''
          }
        </div>
      `;

      marker.bindPopup(popupContent);

      // Invalidate size after mount in case container size settled
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (err) {
      console.warn('Leaflet initialization warning:', err);
    }
  }, [validLat, validLng, zoom, title, locationName, priceFormatted, interactive]);

  return (
    <div className={`relative overflow-hidden rounded-xl z-0 ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full z-0 min-h-[180px]" />
    </div>
  );
}
