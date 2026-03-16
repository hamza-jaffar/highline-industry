import { useState, useEffect } from 'react';

export default function useImage(url: string | null, crossOrigin?: 'anonymous' | 'use-credentials') {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

  useEffect(() => {
    if (!url) {
      setImage(null);
      setStatus('failed');
      return;
    }

    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;

    img.onload = () => {
      setImage(img);
      setStatus('loaded');
    };

    img.onerror = () => {
      setImage(null);
      setStatus('failed');
    };

    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url, crossOrigin]);

  return [image, status] as const;
}
