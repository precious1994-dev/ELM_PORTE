'use client';

import { useState, useEffect } from 'react';

interface HistoryData {
  mainTitle: string;
  subtitle: string;
  description: string;
}

const defaultHistory: HistoryData = {
  mainTitle: "Notre Histoire",
  subtitle: "Un Héritage de Foi et d'Amour",
  description: "Depuis notre création, nous nous engageons à nourrir la foi des plus jeunes à travers un enseignement biblique adapté et des activités enrichissantes."
};

export default function HistoireManager() {
  const [history, setHistory] = useState<HistoryData>(defaultHistory);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/apropos/histoire');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Validate the data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data received from server');
        }
        
        // Ensure data has all required properties with fallbacks
        const validData: HistoryData = {
          mainTitle: data.title || data.mainTitle || defaultHistory.mainTitle,
          subtitle: data.subtitle || defaultHistory.subtitle,
          description: data.description || defaultHistory.description,
        };
        
        setHistory(validData);
        setError(null);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
        setHistory(defaultHistory);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4C9296]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#4C9296] text-white rounded hover:bg-[#3A7276] transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Ensure we have valid data for rendering
  const safeHistory: HistoryData = {
    mainTitle: history?.mainTitle || defaultHistory.mainTitle,
    subtitle: history?.subtitle || defaultHistory.subtitle,
    description: history?.description || defaultHistory.description,
  };

  return (
    <section className="relative overflow-hidden bg-gray-50 py-16">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
            {safeHistory.subtitle}
          </span>
          <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
            <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
              {safeHistory.mainTitle}
            </span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            {safeHistory.description}
          </p>
        </div>
      </div>
    </section>
  );
} 