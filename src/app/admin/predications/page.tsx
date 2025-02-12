'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { FaPlus, FaEdit, FaTrash, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SeriesModal from '@/components/admin/SeriesModal';

interface Sermon {
  _id: string;
  title: string;
  speaker: string;
  date: string;
  passage: string;
  description: string;
  duration: string;
  image: string;
  youtubeUrl: string;
  series?: string;
  book?: string;
}

export default function AdminSermonsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [series, setSeries] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSermons, setTotalSermons] = useState(0);
  const itemsPerPage = 9;
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchSermons();
    }
  }, [status, router, currentPage, searchQuery, selectedSeries, sortOrder]);

  const fetchSermons = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        t: Date.now().toString(),
      });

      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }

      if (selectedSeries) {
        queryParams.append('series', selectedSeries);
      }

      queryParams.append('sortOrder', sortOrder);

      const response = await fetch(`/api/sermons?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sermons');
      }
      const data = await response.json();
      
      // Check if data has the new structure with sermons property
      const sermonsArray = data.sermons || [];
      if (!Array.isArray(sermonsArray)) {
        console.error('Invalid sermons data:', data);
        setSermons([]);
        return;
      }
      
      setSermons(sermonsArray);
      setTotalPages(data.totalPages || 1);
      setTotalSermons(data.totalSermons || 0);
      
      // Extract unique series
      const uniqueSeries = Array.from(new Set(sermonsArray
        .map((sermon: Sermon) => sermon.series)
        .filter((series): series is string => typeof series === 'string' && series !== '')));
      setSeries(uniqueSeries);
      
      // Broadcast update to all clients
      await fetch('/api/sermons/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sermonsArray),
      });
    } catch (error) {
      console.error('Error fetching sermons:', error);
      toast.error('Erreur lors du chargement des prédications');
      setSermons([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette prédication ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sermons/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Prédication supprimée avec succès');
      fetchSermons();
    } catch (error) {
      console.error('Error deleting sermon:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredSermons = sermons;

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <SeriesModal 
        isOpen={isSeriesModalOpen}
        onClose={() => setIsSeriesModalOpen(false)}
        onSeriesUpdate={fetchSermons}
      />
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Gérer les Prédications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalSermons} prédication{totalSermons !== 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsSeriesModalOpen(true)}
              className="inline-flex items-center gap-2 text-[#4C9296] border-[#4C9296]/20 hover:bg-[#4C9296]/10 hover:text-[#4C9296] transition-colors"
            >
              <FaPlus className="h-4 w-4" />
              Gérer les Séries
            </Button>
            <Link 
              href="/admin/predications/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#4C9296] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#4C9296]/90 focus:outline-none focus:ring-2 focus:ring-[#4C9296] focus:ring-offset-2"
            >
              <FaPlus className="h-4 w-4" />
              Nouvelle Prédication
            </Link>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher par titre, prédicateur ou passage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-gray-900 shadow-sm transition-all placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Toutes les séries</option>
              {series.map((serie) => (
                <option key={serie} value={serie}>{serie}</option>
              ))}
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {sortOrder === 'desc' ? (
                <>
                  Plus récent d'abord
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                <>
                  Plus ancien d'abord
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSermons.length > 0 ? (
            filteredSermons.map((sermon) => (
              <div
                key={sermon._id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={sermon.image}
                    alt={sermon.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20"></div>
                  <Link
                    href={sermon.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center transition-transform hover:scale-110"
                  >
                    <svg className="h-12 w-12 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </Link>
                  {sermon.series && (
                    <span className="absolute left-2 top-2 inline-flex items-center rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {sermon.series}
                    </span>
                  )}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-white">
                      <time dateTime={sermon.date} className="drop-shadow-lg">
                        {new Date(sermon.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                      <span className="drop-shadow-lg">•</span>
                      <span className="drop-shadow-lg">{sermon.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="truncate text-lg font-bold text-gray-900 group-hover:text-primary">
                    {sermon.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium truncate">{sermon.speaker}</span>
                    <span>•</span>
                    <span className="truncate">{sermon.passage}</span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/admin/predications/${sermon._id}/edit`}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <FaEdit className="h-4 w-4" />
                      <span>Modifier</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(sermon._id)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm transition-all hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <FaTrash className="h-4 w-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              {searchQuery || selectedSeries ? (
                <>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun résultat</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Essayez de modifier vos critères de recherche
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedSeries('');
                      }}
                      className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <FaPlus className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune prédication</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Commencez par ajouter une nouvelle prédication
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/admin/predications/new"
                      className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                      Ajouter une prédication
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaChevronLeft className="h-4 w-4" />
              Précédent
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Suivant
              <FaChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 