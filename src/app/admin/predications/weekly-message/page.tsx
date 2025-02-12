'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { FaPlay, FaEdit, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { setupSSE } from '@/utils/sse';

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
  isWeeklyMessage?: boolean;
  weeklyMessageExpiry?: string;
}

interface PaginatedResponse {
  sermons: Sermon[];
  totalPages: number;
  currentPage: number;
  totalSermons: number;
}

const ITEMS_PER_PAGE = 9;

export default function WeeklyMessagePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [currentWeeklyMessage, setCurrentWeeklyMessage] = useState<Sermon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSermons, setTotalSermons] = useState(0);
  const [error, setError] = useState<string>('');

  const fetchSermons = async (page: number) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/sermons?page=${page}&limit=${ITEMS_PER_PAGE}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sermons: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Type guard for PaginatedResponse
      if (!data || typeof data !== 'object') {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response data');
      }

      // Validate sermons array
      if (!data.sermons) {
        console.error('No sermons array in response:', data);
        throw new Error('No sermons data received');
      }

      // Force sermons to be an array
      const sermonsArray = Array.isArray(data.sermons) ? data.sermons : [];
      console.log('Sermons array:', sermonsArray); // Debug log

      // Validate each sermon object
      const validSermons = sermonsArray.filter((sermon: unknown) => {
        if (!sermon || typeof sermon !== 'object') {
          console.warn('Invalid sermon object:', sermon);
          return false;
        }
        // Type guard to ensure it's a Sermon
        const isSermon = (obj: unknown): obj is Sermon => {
          return (
            obj !== null &&
            typeof obj === 'object' &&
            '_id' in obj &&
            'title' in obj &&
            'speaker' in obj
          );
        };
        if (!isSermon(sermon)) {
          console.warn('Invalid sermon structure:', sermon);
          return false;
        }
        return true;
      });

      setSermons(validSermons);
      setTotalPages(Math.max(1, data.totalPages || 1));
      setTotalSermons(data.totalSermons || 0);
    } catch (error) {
      console.error('Error fetching sermons:', error);
      setError('Erreur lors du chargement des prédications');
      toast.error('Erreur lors du chargement des prédications');
      // Set default values on error
      setSermons([]);
      setTotalPages(1);
      setTotalSermons(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    let isSubscribed = true;
    
    const fetchInitialData = async () => {
      try {
        // Fetch current weekly message
        const weeklyResponse = await fetch('/api/sermons/weekly-message');
        if (weeklyResponse.ok) {
          const weeklyData = await weeklyResponse.json();
          if (isSubscribed && weeklyData) {
            setCurrentWeeklyMessage(weeklyData);
          }
        }

        // Fetch sermons list
        await fetchSermons(currentPage);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    fetchInitialData();
    
    // Setup SSE
    const cleanup = setupSSE({
      endpoint: '/api/sermons/weekly-message/sse',
      onMessage: (data) => {
        if (!isSubscribed) return;

        if (data === null) {
          setCurrentWeeklyMessage(null);
          return;
        }

        const isValidWeeklyMessage = (obj: unknown): obj is Sermon => {
          return (
            obj !== null &&
            typeof obj === 'object' &&
            '_id' in obj &&
            typeof obj._id === 'string' &&
            'title' in obj &&
            typeof obj.title === 'string' &&
            'speaker' in obj &&
            typeof obj.speaker === 'string' &&
            'date' in obj &&
            typeof obj.date === 'string' &&
            'description' in obj &&
            typeof obj.description === 'string' &&
            'youtubeUrl' in obj &&
            typeof obj.youtubeUrl === 'string'
          );
        };

        if (!isValidWeeklyMessage(data)) {
          console.warn('Invalid weekly message data:', data);
          return;
        }

        setCurrentWeeklyMessage(data);
      },
      onError: (error) => {
        if (!isSubscribed) return;
        console.error('SSE Error:', error);
        toast.error('La connexion temps réel est indisponible');
      },
      onConnected: () => {
        if (!isSubscribed) return;
        console.log('SSE Connected successfully');
      }
    });

    return () => {
      isSubscribed = false;
      cleanup();
    };
  }, [currentPage, status]);

  // Protect the page
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin');
    }
  }, [status, router]);

  const handleSetWeeklyMessage = async (sermonId: string) => {
    try {
      const response = await fetch(`/api/sermons/${sermonId}/set-weekly`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set weekly message');
      }
      
      // Fetch the updated weekly message immediately after setting it
      const weeklyResponse = await fetch('/api/sermons/weekly-message');
      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json();
        setCurrentWeeklyMessage(weeklyData);
      }
      
      toast.success('Message de la semaine mis à jour');
    } catch (error) {
      console.error('Error setting weekly message:', error);
      toast.error('Erreur lors de la mise à jour du message de la semaine');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Early return if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Message de la Semaine
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez le message mis en avant de la semaine
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
        {/* Current Weekly Message Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Message actuel de la semaine</h2>
          {currentWeeklyMessage ? (
            <Card className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="relative aspect-video w-full md:w-1/3">
                  <img
                    src={currentWeeklyMessage.image}
                    alt={currentWeeklyMessage.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <p className="text-sm font-medium text-white">
                      {new Date(currentWeeklyMessage.date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <h3 className="text-xl font-bold text-gray-900">{currentWeeklyMessage.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{currentWeeklyMessage.speaker}</p>
                  <p className="mt-4 text-gray-600 line-clamp-2">{currentWeeklyMessage.description}</p>
                  <div className="mt-6 flex items-center gap-4">
                    {currentWeeklyMessage.youtubeUrl && (
                      <Link
                        href={currentWeeklyMessage.youtubeUrl}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                      >
                        <FaPlay className="h-4 w-4" />
                        Regarder
                      </Link>
                    )}
                    {currentWeeklyMessage._id && (
                      <Link
                        href={`/admin/predications/${currentWeeklyMessage._id}/edit`}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <FaEdit className="h-4 w-4" />
                        Modifier
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun message sélectionné</h3>
              <p className="mt-1 text-sm text-gray-500">
                Sélectionnez un message dans la liste ci-dessous
              </p>
            </Card>
          )}
        </div>

        {/* All Sermons Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Sélectionner un message</h2>
            <p className="text-sm text-gray-500">
              {totalSermons} message{totalSermons > 1 ? 's' : ''} au total
            </p>
          </div>
          
          {error ? (
            <Card className="p-8 text-center">
              <div className="text-red-500">{error}</div>
              <Button
                onClick={() => fetchSermons(currentPage)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Réessayer
              </Button>
            </Card>
          ) : !Array.isArray(sermons) ? (
            <Card className="p-8 text-center">
              <div className="text-red-500">Erreur: Format de données invalide</div>
              <Button
                onClick={() => fetchSermons(currentPage)}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Réessayer
              </Button>
            </Card>
          ) : sermons.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">Aucun message disponible</div>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sermons.map((sermon) => (
                  <Card 
                    key={sermon._id} 
                    className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                      sermon._id === currentWeeklyMessage?._id ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                  >
                    <div className="relative aspect-video">
                      <img
                        src={sermon.image}
                        alt={sermon.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {new Date(sermon.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {sermon.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 p-4">
                      <div className="flex-1">
                        <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                          {sermon.title}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-primary">
                          {sermon.speaker}
                        </p>
                        {sermon.passage && (
                          <p className="mt-1 text-sm text-gray-600">
                            {sermon.passage}
                          </p>
                        )}
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {sermon.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handleSetWeeklyMessage(sermon._id)}
                          className={`flex-1 gap-2 ${
                            sermon._id === currentWeeklyMessage?._id
                              ? 'bg-green-600 hover:bg-green-700'
                              : ''
                          }`}
                        >
                          {sermon._id === currentWeeklyMessage?._id ? 'Message actuel' : 'Sélectionner'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <FaChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        className={`min-w-[2.5rem] ${
                          currentPage === page ? 'bg-primary text-white' : ''
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    Suivant
                    <FaChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 