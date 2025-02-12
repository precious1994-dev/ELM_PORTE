'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { setupSSE } from '@/utils/sse';

interface IBanner {
  imageUrl: string;
}

export default function Banner() {
  const [banner, setBanner] = useState<IBanner | null>({
    imageUrl: 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/sermons-default'
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const fetchBanner = async () => {
      try {
        const response = await fetch('/api/banner');
        if (!response.ok) throw new Error('Failed to fetch banner');
        const data = await response.json();
        setBanner(data);
        setError('');
      } catch (error) {
        console.error('Error fetching banner:', error);
        setError('Failed to load banner');
      }
    };

    // Initial fetch
    fetchBanner();

    // Setup SSE
    cleanup = setupSSE({
      endpoint: '/api/banner/sse',
      onMessage: (data) => {
        setBanner(data);
        setError('');
      },
      onError: (error) => {
        console.error('SSE Error:', error);
        setError('Real-time updates unavailable');
        // Fallback to regular polling on error
        const pollInterval = setInterval(fetchBanner, 5000);
        return () => clearInterval(pollInterval);
      },
      onConnected: () => {
        console.log('Banner SSE Connected successfully');
        setError('');
      }
    });

    return () => {
      cleanup?.();
    };
  }, []);

  if (error) {
    console.warn('Banner Error:', error);
  }

  if (!banner) return null;

  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <Image
          src={banner.imageUrl}
          alt="Prédications banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4C9296]/90 via-[#4C9296]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-12 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute -right-12 top-1/2 h-64 w-64 rounded-full bg-white blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex min-h-[80vh] items-center justify-center px-6 lg:px-8">
        <div className="max-w-4xl">
          <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            Prédications
          </span>
          <h1 className="mt-6 font-serif text-5xl font-bold text-white sm:text-6xl md:text-7xl">
            Découvrez Nos{' '}
            <span className="text-primary-200">
              Messages
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
            Des enseignements inspirants qui vous aideront à approfondir votre relation avec Dieu 
            et à appliquer Sa Parole dans votre vie quotidienne.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-white/70">Découvrir Plus</span>
          <div className="h-12 w-6 rounded-full border-2 border-white/30 p-1">
            <div className="h-2 w-full animate-bounce rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
} 