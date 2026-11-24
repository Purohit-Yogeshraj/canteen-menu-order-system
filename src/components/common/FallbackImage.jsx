// ==============================================================================
// FALLBACK IMAGE COMPONENT
// Renders clean Unsplash photo with graceful SVG placeholder fallback
// ==============================================================================

import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

export function FallbackImage({ src, alt, className = '', category = 'Snacks' }) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Category fallback SVG colors
  const categoryGradients = {
    Snacks: 'from-amber-100 to-orange-200 text-orange-700',
    Meals: 'from-orange-100 to-amber-200 text-amber-800',
    Beverages: 'from-blue-50 to-cyan-100 text-cyan-800',
    Desserts: 'from-pink-100 to-rose-200 text-rose-800',
  };

  const gradient = categoryGradients[category] || 'from-orange-100 to-amber-100 text-orange-700';

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradient} ${className}`}
        aria-label={alt}
      >
        <Utensils className="w-8 h-8 opacity-60 mb-1" />
        <span className="text-[11px] font-medium opacity-80 px-2 text-center line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-stone-200 animate-pulse flex items-center justify-center">
          <Utensils className="w-6 h-6 text-stone-400 opacity-50" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
