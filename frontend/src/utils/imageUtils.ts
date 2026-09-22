import React from 'react';

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';

export const getProductImage = (image?: string | null): string => {
  if (!image || !image.trim()) {
    return DEFAULT_PRODUCT_IMAGE;
  }
  return image;
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = DEFAULT_PRODUCT_IMAGE
) => {
  const target = e.currentTarget;
  if (target.src !== fallback) {
    target.onerror = null;
    target.src = fallback;
  }
};
