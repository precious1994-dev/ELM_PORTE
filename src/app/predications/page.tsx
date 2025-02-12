'use client'

import { useState, useRef, useEffect } from 'react'
import { format, isWithinInterval, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FaSearch, FaFilter, FaTimes, FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaChevronLeft, FaChevronRight, FaArrowRight, FaCalendarAlt } from 'react-icons/fa'
import { SermonCard } from '@/components/sermons/SermonCard'
import Banner from '@/components/sermons/Banner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import YouTube from 'react-youtube'
import Link from 'next/link'

interface Sermon {
  _id: string;
  title: string;
  speaker: string;
  date: string;
  passage: string;
  description: string;
  duration: string;
  image: string;
  pasteurImage: string;
  youtubeUrl: string;
  series?: string;
  isWeeklyMessage?: boolean;
  weeklyMessageExpiry?: string;
}

interface Filters {
  search: string
  series: string | null
  speaker: string | null
  duration: string | null
  dateRange: {
    start: string | null
    end: string | null
  }
}

export default function Page() {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSeriesModal, setShowSeriesModal] = useState(false)
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const playerRef = useRef<any>(null)
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [filters, setFilters] = useState<Filters>({
    search: '',
    series: null,
    speaker: null,
    duration: null,
    dateRange: {
      start: null,
      end: null,
    },
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSermons, setTotalSermons] = useState(0)
  const sermonsPerPage = 9
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weeklyMessage, setWeeklyMessage] = useState<Sermon | null>(null)

  // SSE connection reference
  const sseRef = useRef<EventSource | null>(null)

  useEffect(() => {
    fetchSermons()
    setupSSE()

    return () => {
      // Cleanup SSE connection on component unmount
      cleanupSSE()
    }
  }, [currentPage, filters])

  const cleanupSSE = () => {
    if (sseRef.current) {
      sseRef.current.close()
      sseRef.current = null
    }
  }

  const setupSSE = () => {
    try {
      // Clean up existing connection if any
      cleanupSSE()

      // Create new SSE connection
      const eventSource = new EventSource('/api/sermons/sse')
      sseRef.current = eventSource

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setSermons(data)
        } catch (err) {
          console.error('Error parsing SSE data:', err)
        }
      }

      eventSource.addEventListener('weekly-message', (event) => {
        try {
          const data = JSON.parse(event.data)
          setWeeklyMessage(data)
        } catch (err) {
          console.error('Error parsing weekly message event:', err)
        }
      })

      eventSource.addEventListener('update', (event) => {
        try {
          const data = JSON.parse(event.data)
          setSermons(data)
        } catch (err) {
          console.error('Error parsing update event:', err)
        }
      })

      eventSource.addEventListener('connected', () => {
        console.log('SSE Connected')
      })

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        cleanupSSE()
        // Attempt to reconnect after a delay
        setTimeout(setupSSE, 5000)
      }
    } catch (error) {
      console.error('Error setting up SSE:', error)
      // Attempt to reconnect after a delay
      setTimeout(setupSSE, 5000)
    }
  }

  const fetchSermons = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: sermonsPerPage.toString(),
      });

      // Add filters to query parameters
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.series) {
        queryParams.append('series', filters.series);
      }
      if (filters.speaker) {
        queryParams.append('speaker', filters.speaker);
      }

      const response = await fetch(`/api/sermons?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sermons: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Check for API error
      if (data.error) {
        console.error('API Error:', data.error);
        throw new Error(data.error);
      }
      
      // Validate sermons data
      if (!data || !data.sermons || !Array.isArray(data.sermons)) {
        console.error('Invalid sermons data received:', data);
        setSermons([]);
        return;
      }

      // Validate each sermon object
      const validSermons = data.sermons.filter((sermon: unknown): sermon is Sermon => {
        if (!sermon || typeof sermon !== 'object') {
          console.warn('Invalid sermon object:', sermon);
          return false;
        }
        return (
          '_id' in sermon &&
          'title' in sermon &&
          'speaker' in sermon &&
          'date' in sermon &&
          'description' in sermon
        );
      });

      setSermons(validSermons);
      setTotalPages(data.totalPages || 1);
      setTotalSermons(data.totalSermons || 0);

      // Fetch weekly message
      try {
        const weeklyResponse = await fetch('/api/sermons/weekly-message');
        if (weeklyResponse.ok) {
          const weeklyData = await weeklyResponse.json();
          if (weeklyData && typeof weeklyData === 'object' && !weeklyData.error) {
            setWeeklyMessage(weeklyData);
          }
        }
      } catch (weeklyError) {
        console.error('Error fetching weekly message:', weeklyError);
        // Don't throw here to avoid affecting the main sermons display
      }
    } catch (error) {
      console.error('Error fetching sermons:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des prédications');
      setSermons([]); // Ensure sermons is always an array
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique values for filters
  const uniqueSeries = Array.from(
    new Set(
      (Array.isArray(sermons) ? sermons : [])
        .filter(sermon => sermon && sermon.series) // Filter out null/undefined and ensure series exists
        .map(sermon => sermon.series || 'Sans série')
    )
  )
    .filter(series => series.toLowerCase().includes(filters.search.toLowerCase()))
    .slice(0, 3);

  const uniqueSpeakers = Array.from(
    new Set(
      (Array.isArray(sermons) ? sermons : [])
        .filter(sermon => sermon && sermon.speaker) // Filter out null/undefined and ensure speaker exists
        .map(sermon => sermon.speaker)
    )
  );

  // Helper function to parse duration string to minutes
  const parseDurationToMinutes = (duration: string): number => {
    const match = duration.match(/(\d+)/)
    return match ? parseInt(match[0]) : 0
  }

  // Filter sermons based on all criteria
  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch = filters.search
      ? sermon.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        sermon.speaker.toLowerCase().includes(filters.search.toLowerCase()) ||
        sermon.description.toLowerCase().includes(filters.search.toLowerCase())
      : true

    // Handle series matching with optional chaining
    const matchesSeries = !filters.series || sermon.series === filters.series || (!sermon.series && filters.series === 'Sans série')
    const matchesSpeaker = !filters.speaker || sermon.speaker === filters.speaker
    
    // Handle duration filtering
    const matchesDuration = !filters.duration || (() => {
      const durationMinutes = parseDurationToMinutes(sermon.duration)
      switch(filters.duration) {
        case '0-30':
          return durationMinutes <= 30
        case '31-60':
          return durationMinutes > 30 && durationMinutes <= 60
        case '60+':
          return durationMinutes > 60
        default:
          return true
      }
    })()

    const matchesDateRange =
      (!filters.dateRange.start || !filters.dateRange.end) ||
      isWithinInterval(parseISO(sermon.date), {
        start: parseISO(filters.dateRange.start || sermon.date),
        end: parseISO(filters.dateRange.end || sermon.date),
      })

    return matchesSearch && matchesSeries && matchesSpeaker && matchesDuration && matchesDateRange
  })

  // Pagination logic
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  // Reset to first page when filters change
  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      search: '',
      series: null,
      speaker: null,
      duration: null,
      dateRange: {
        start: null,
        end: null,
      },
    })
  }

  const activeFiltersCount =
    (filters.series ? 1 : 0) +
    (filters.speaker ? 1 : 0) +
    (filters.duration ? 1 : 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0)

  // Handle player ready
  const handlePlayerReady = (event: any) => {
    playerRef.current = event.target
  }

  // Handle player state changes
  const handlePlayerStateChange = (event: any) => {
    switch (event.data) {
      case 1: // playing
        setIsPlaying(true)
        break
      case 2: // paused
        setIsPlaying(false)
        break
      case 0: // ended
        setIsPlaying(false)
        break
      default:
        break
    }
  }

  // Handle minimize toggle
  const handleMinimizeToggle = (minimize: boolean) => {
    setIsMinimized(minimize)
    // Ensure video continues playing when switching views
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo()
      }
    }
  }

  // Handle close player
  const handleClosePlayer = () => {
    if (playerRef.current) {
      playerRef.current.stopVideo()
    }
    setSelectedSermon(null)
    setIsPlaying(false)
    setIsMinimized(false)
  }

  // Helper function to extract video ID from YouTube URL
  const getYoutubeVideoId = (url: string | undefined): string => {
    if (!url) return ''
    
    try {
      // Handle youtu.be URLs
      if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1].split(/[?#]/)[0]
      }
      
      // Handle youtube.com URLs
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url)
        return urlObj.searchParams.get('v') || ''
      }

      // Handle youtube.com/embed URLs
      if (url.includes('youtube.com/embed/')) {
        return url.split('embed/')[1].split(/[?#]/)[0]
      }

      // If the input is already a video ID (11 characters)
      if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
        return url
      }

      return ''
    } catch (error) {
      console.error('Error extracting YouTube video ID:', error)
      return ''
    }
  }

  // Update the series click handler
  const handleSeriesClick = (series: string | undefined) => {
    setSelectedSeries(series || 'Sans série')
    setShowSeriesModal(true)
  }

  if (isLoading) {
    return (
      <main>
        {/* Banner Section Skeleton */}
        <Skeleton variant="banner" />

        {/* Weekly Message Skeleton */}
        <Section className="bg-white">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="aspect-video w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <div className="p-6">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </Container>
        </Section>

        {/* Search and Filters Skeleton */}
        <Section className="bg-gray-50">
          <Container>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
              <div className="w-full md:w-96">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </Container>
        </Section>

        {/* Sermons Grid Skeleton */}
        <Section className="bg-gray-50">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-md">
                  <div className="aspect-video relative">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-12 flex justify-center gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-lg" />
              ))}
            </div>
          </Container>
        </Section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner />
      
      <Section>
        <Container>
          {/* Search and Filters Section */}
          <div className="sticky top-0 z-30 border-y border-gray-200 bg-white/90 py-4 backdrop-blur-lg">
            <Container>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Enhanced Search Field */}
                <div className="relative flex-1">
                  <div className="group relative mx-auto max-w-2xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <FaSearch className="h-5 w-5 text-gray-400 transition-colors duration-150 group-focus-within:text-primary-500" />
                    </div>
                    <input
                      type="text"
                      className="block w-full rounded-2xl border-0 bg-gray-50/80 py-4 pl-12 pr-12 text-base text-black shadow-sm ring-1 ring-gray-200/80 transition-all duration-150 placeholder:text-gray-400 hover:bg-white hover:ring-gray-300 focus:bg-white focus:ring-2 focus:ring-primary-500"
                      placeholder="Rechercher par titre, prédicateur, passage biblique..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                    {filters.search && (
                      <button
                        onClick={() => setFilters({ ...filters, search: '' })}
                        className="absolute inset-y-0 right-0 flex items-center pr-4"
                      >
                        <span className="rounded-full p-1 hover:bg-gray-100">
                          <FaTimes className="h-4 w-4 text-gray-400 transition-colors duration-150 hover:text-gray-600" />
                        </span>
                      </button>
                    )}
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center pr-4 text-sm text-gray-400 lg:flex">
                      <kbd className="hidden rounded-lg border border-gray-200 bg-white px-2 py-1 font-sans text-xs text-gray-400 shadow-sm lg:inline-block">⌘K</kbd>
                    </div>
                  </div>
                  {/* Search Suggestions - Only show when search has content */}
                  {filters.search && (
                    <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                      <div className="space-y-1 px-2 py-3">
                        <h3 className="text-xs font-medium uppercase text-gray-500">Suggestions</h3>
                        <div className="space-y-1">
                          {uniqueSeries.map((series) => (
                            <button
                              key={series}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setFilters({ ...filters, series })}
                            >
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              {series}
                            </button>
                          ))}
                          {uniqueSpeakers
                            .filter(speaker => 
                              speaker.toLowerCase().includes(filters.search.toLowerCase())
                            )
                            .slice(0, 3)
                            .map((speaker) => (
                              <button
                                key={speaker}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setFilters({ ...filters, speaker })}
                              >
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {speaker}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Keep existing filter buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className={`group flex items-center gap-2 transition-colors text-[#4C9296] ${
                      showFilters ? 'border-[#4C9296] bg-[#4C9296]/10' : ''
                    }`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FaFilter className={`h-4 w-4 ${showFilters ? 'text-[#4C9296]' : 'text-[#4C9296]'}`} />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 rounded-full bg-[#4C9296]/10 px-2 py-0.5 text-xs font-medium text-[#4C9296]">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-gray-600 hover:bg-gray-50"
                      onClick={handleResetFilters}
                    >
                      <FaTimes className="h-4 w-4" />
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Série</label>
                      <select
                        className="mt-1 block w-full rounded-lg border-gray-200 text-sm text-black focus:border-primary-500 focus:ring-primary-500"
                        value={filters.series || ''}
                        onChange={(e) => setFilters({ ...filters, series: e.target.value || null })}
                      >
                        <option value="">Toutes les séries</option>
                        {uniqueSeries.map((series) => (
                          <option key={series} value={series}>
                            {series}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prédicateur</label>
                      <select
                        className="mt-1 block w-full rounded-lg border-gray-200 text-sm text-black focus:border-primary-500 focus:ring-primary-500"
                        value={filters.speaker || ''}
                        onChange={(e) => setFilters({ ...filters, speaker: e.target.value || null })}
                      >
                        <option value="">Tous les prédicateurs</option>
                        {uniqueSpeakers.map((speaker) => (
                          <option key={speaker} value={speaker}>
                            {speaker}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Durée</label>
                      <select
                        className="mt-1 block w-full rounded-lg border-gray-200 text-sm text-black focus:border-primary-500 focus:ring-primary-500"
                        value={filters.duration || ''}
                        onChange={(e) => setFilters({ ...filters, duration: e.target.value || null })}
                      >
                        <option value="">Toutes les durées</option>
                        <option value="0-30">0-30 minutes</option>
                        <option value="31-60">31-60 minutes</option>
                        <option value="60+">Plus de 60 minutes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Période</label>
                      <div className="mt-1 grid gap-2">
                        <input
                          type="date"
                          className="block w-full rounded-lg border-gray-200 text-sm text-black focus:border-primary-500 focus:ring-primary-500"
                          value={filters.dateRange.start || ''}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              dateRange: { ...filters.dateRange, start: e.target.value || null },
                            })
                          }
                        />
                        <input
                          type="date"
                          className="block w-full rounded-lg border-gray-200 text-sm text-black focus:border-primary-500 focus:ring-primary-500"
                          value={filters.dateRange.end || ''}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              dateRange: { ...filters.dateRange, end: e.target.value || null },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Container>
          </div>

          {/* Sermons Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => (
              <div
                key={sermon._id}
                className="group flex flex-col justify-between rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{format(parseISO(sermon.date), 'dd MMMM yyyy', { locale: fr })}</span>
                    <span>•</span>
                    <span>{sermon.duration}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#4C9296]">{sermon.title}</h2>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-[#4C9296]/30">
                      <Image
                        src={sermon.pasteurImage || sermon.image}
                        alt={sermon.speaker}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-600">{sermon.speaker}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-2 py-0.5 text-xs font-medium text-[#4C9296] ring-1 ring-[#4C9296]/20">
                      {sermon.series || 'Sans série'}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-2 py-0.5 text-xs font-medium text-[#4C9296] ring-1 ring-[#4C9296]/20">
                      {sermon.passage}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">{sermon.description}</p>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1 rounded-full bg-[#4C9296] text-white transition-all duration-300 hover:bg-[#3A7276]"
                    onClick={() => setSelectedSermon(sermon)}
                  >
                    Écouter le message
                  </Button>
                  <Link 
                    href={`/predications/${sermon._id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#4C9296] text-[#4C9296] transition-all duration-300 hover:bg-[#4C9296] hover:text-white"
                  >
                    <FaArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#4C9296] text-[#4C9296] transition-all duration-300 hover:bg-[#4C9296] hover:text-white disabled:pointer-events-none disabled:opacity-50"
                aria-label="Page précédente"
              >
                <FaChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'border-[#4C9296] bg-[#4C9296] text-white'
                        : 'border-[#4C9296] text-[#4C9296] hover:bg-[#4C9296] hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#4C9296] text-[#4C9296] transition-all duration-300 hover:bg-[#4C9296] hover:text-white disabled:pointer-events-none disabled:opacity-50"
                aria-label="Page suivante"
              >
                <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Weekly Message Section */}
          {weeklyMessage && (
            <div className="mt-16 mb-12">
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4C9296]/10 px-4 py-1.5 text-sm font-medium text-[#4C9296]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Message de la Semaine
                </div>
                <h2 className="mt-3 font-serif text-3xl font-bold text-[#4C9296] sm:text-4xl">Prédication à la Une</h2>
                <p className="mx-auto mt-3 max-w-2xl text-black">Découvrez notre message mis en avant cette semaine, soigneusement sélectionné pour votre édification spirituelle</p>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 transition-all hover:shadow-2xl">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={weeklyMessage.image}
                    alt={weeklyMessage.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {format(parseISO(weeklyMessage.date), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {weeklyMessage.duration}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-2xl font-bold text-white md:text-3xl">
                      {weeklyMessage.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-[#4C9296]/30">
                      <Image
                        src={weeklyMessage.pasteurImage || weeklyMessage.image}
                        alt={weeklyMessage.speaker}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{weeklyMessage.speaker}</h4>
                      <p className="text-sm text-gray-600">Pasteur</p>
                    </div>
                    <Button
                      variant="default"
                      className="ml-auto flex items-center gap-2 text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSermon(weeklyMessage);
                      }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Écouter
                    </Button>
                  </div>
                  <p className="mt-4 text-gray-600">
                    {weeklyMessage.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* Video Player Modal */}
      <Transition appear show={!!selectedSermon && !isMinimized} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50"
          onClose={handleClosePlayer}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  {selectedSermon && (
                    <>
                      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
                        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
                          <button
                            onClick={() => handleMinimizeToggle(true)}
                            className="rounded-lg bg-black/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleClosePlayer}
                            className="rounded-lg bg-black/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <YouTube
                          videoId={getYoutubeVideoId(selectedSermon.youtubeUrl)}
                          opts={{
                            width: '100%',
                            height: '100%',
                            playerVars: {
                              autoplay: 1,
                              modestbranding: 1,
                              rel: 0,
                              showinfo: 0,
                            },
                          }}
                          onReady={handlePlayerReady}
                          onStateChange={handlePlayerStateChange}
                          className="absolute inset-0"
                          iframeClassName="w-full h-full"
                        />
                      </div>

                      <div className="mt-6">
                        {/* Sermon Info */}
                        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                          <h3 className="font-serif text-lg font-bold text-gray-900 sm:text-xl">
                            {selectedSermon.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:text-sm">
                            <span>{format(parseISO(selectedSermon.date), 'dd MMMM yyyy', { locale: fr })}</span>
                            <span>•</span>
                            <span>{selectedSermon.duration}</span>
                          </div>
                          <p className="text-xs text-gray-600 sm:text-sm">{selectedSermon.description}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-2 py-0.5 text-xs font-medium text-[#4C9296] ring-1 ring-[#4C9296]/20">
                              {selectedSermon.series || 'Sans série'}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-2 py-0.5 text-xs font-medium text-[#4C9296] ring-1 ring-[#4C9296]/20">
                              {selectedSermon.passage}
                            </span>
                          </div>
                          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-[#4C9296]/30 sm:h-12 sm:w-12">
                                <Image
                                  src={selectedSermon.pasteurImage || selectedSermon.image}
                                  alt={selectedSermon.speaker}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 sm:text-base">{selectedSermon.speaker}</h4>
                                <p className="text-xs text-gray-600 sm:text-sm">Pasteur</p>
                              </div>
                            </div>
                            <a
                              href={selectedSermon.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:ml-auto sm:w-auto"
                            >
                              Voir sur YouTube
                            </a>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Minimized Player */}
      {selectedSermon && isMinimized && (
        <div className="fixed bottom-4 right-4 z-40 w-80 overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-gray-200">
          <div className="group relative aspect-video">
            <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                onClick={() => handleMinimizeToggle(false)}
                className="rounded-lg bg-black/20 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={handleClosePlayer}
                className="rounded-lg bg-black/20 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <YouTube
              videoId={getYoutubeVideoId(selectedSermon.youtubeUrl)}
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 1,
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0,
                },
              }}
              onReady={handlePlayerReady}
              onStateChange={handlePlayerStateChange}
              className="absolute inset-0"
              iframeClassName="w-full h-full"
            />
          </div>
          <div className="p-3">
            <h4 className="truncate text-sm font-medium text-gray-900">{selectedSermon.title}</h4>
            <p className="truncate text-xs text-gray-600">{selectedSermon.speaker}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
    </div>
  )
} 