"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FaCalendar, FaSearch, FaThLarge, FaList } from "react-icons/fa";
import { ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Calendar } from "@/components/events/Calendar";
import { EventsBanner } from "@/components/events/EventsBanner";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock } from "lucide-react";
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  category?: string;
};

type Category = {
  id: string;
  name: string;
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    date: null as Date | null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching events and categories...');
        const [eventsRes, categoriesRes] = await Promise.all([
          fetch("/api/events", { cache: 'no-store' }),
          fetch("/api/categories", { cache: 'no-store' })
        ]);
        
        if (!eventsRes.ok || !categoriesRes.ok) {
          console.error('Events response:', eventsRes.status, eventsRes.statusText);
          console.error('Categories response:', categoriesRes.status, categoriesRes.statusText);
          throw new Error('Failed to fetch data');
        }

        const [eventsData, categoriesData] = await Promise.all([
          eventsRes.json(),
          categoriesRes.json()
        ]);
        
        console.log('Raw events data:', eventsData);
        console.log('Raw categories data:', categoriesData);

        // Validate and transform events data
        const validEvents = Array.isArray(eventsData) 
          ? eventsData
              .filter((event): event is Event => {
                const isValid = Boolean(
                  event && 
                  typeof event === 'object' && 
                  typeof event.id === 'string' &&
                  event.id.length > 0 &&
                  typeof event.title === 'string' &&
                  typeof event.description === 'string' &&
                  typeof event.date === 'string'
                );
                if (!isValid) {
                  console.warn('Invalid event found:', event);
                }
                return isValid;
              })
              .map(event => ({
                ...event,
                time: event.time || '',
                location: event.location || '',
                imageUrl: event.imageUrl || '/images/event-default.jpg',
                category: event.category || undefined
              }))
          : [];
        
        console.log('Valid events:', validEvents);

        // Validate and transform categories data
        const validCategories = Array.isArray(categoriesData)
          ? categoriesData.filter((category): category is Category => {
              const isValid = Boolean(
                category &&
                typeof category === 'object' &&
                typeof category.id === 'string' &&
                typeof category.name === 'string'
              );
              if (!isValid) {
                console.warn('Invalid category found:', category);
              }
              return isValid;
            })
          : [];

        console.log('Valid categories:', validCategories);

        setEvents(validEvents);
        setCategories(validCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        setEvents([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEvents = useMemo(() => {
    const filtered = events.filter(event => {
      // Additional validation before filtering
      if (!event?.id || typeof event.id !== 'string' || event.id.length === 0) {
        console.warn('Invalid event found in filteredEvents:', event);
        return false;
      }

      // Get current date at start of day
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get event date at start of day
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);

      // Check if event is in the future
      if (eventDate < today) {
        return false;
      }

      const matchesSearch = event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.location.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || event.category === filters.category;
      
      const matchesDate = !filters.date || format(new Date(event.date), 'yyyy-MM-dd') === format(filters.date, 'yyyy-MM-dd');
      
      return matchesSearch && matchesCategory && matchesDate;
    });

    console.log('Filtered events:', filtered);
    return filtered;
  }, [events, filters]);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (loading) {
    return (
      <div className="animate-fade-in w-full">
        {/* Banner Section Skeleton */}
        <Skeleton variant="banner" />

        {/* Events Section */}
        <Section className="relative overflow-hidden bg-gray-50 py-24">
          <Container>
            {/* Section Header Skeleton */}
            <div className="mx-auto max-w-3xl text-center">
              <Skeleton className="mx-auto h-8 w-32 rounded-full" />
              <Skeleton className="mx-auto mt-8 h-12 w-96" />
              <Skeleton className="mx-auto mt-6 h-20 w-full max-w-2xl" />
            </div>

            {/* Filters Section Skeleton */}
            <div className="mt-12 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <Skeleton className="h-12 w-full md:w-96" />
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-48" />
                  <Skeleton className="h-12 w-48" />
                </div>
              </div>
            </div>

            {/* Events Grid Skeleton */}
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg">
                  <div className="aspect-[4/3] w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <div className="p-6">
                    {/* Date Badge Skeleton */}
                    <div className="mb-4 flex items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    {/* Title Skeleton */}
                    <Skeleton className="mb-4 h-6 w-3/4" />
                    {/* Details Skeleton */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    {/* Category Badge Skeleton */}
                    <div className="mt-4">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="mt-12 flex justify-center gap-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-lg" />
              ))}
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </Container>
        </Section>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      {/* Hero Section */}
      <div className="w-full">
        <EventsBanner />
      </div>

      {/* Events Section */}
      <Section className="relative overflow-hidden bg-gray-50 py-24">
        {/* Background Decorative Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <Container>
          <div className="relative">
            {/* Section Header */}
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <FaCalendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Agenda</span>
              </div>
              
              <h2 className="mt-8 font-serif text-4xl font-bold leading-tight text-[#4C9296] md:text-5xl">
                Prochains{' '}
                <span className="relative inline-block text-[#4C9296]">
                  Événements
                  <div className="absolute -bottom-2 left-0 h-1 w-full rounded-full bg-[#4C9296]/30" />
                </span>
              </h2>
              
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                Consultez notre calendrier et inscrivez-vous à nos événements pour vivre des moments enrichissants en communauté.
              </p>
            </div>

            {/* Filters Section */}
            <div className="mt-12 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Rechercher un événement..."
                    className="w-full rounded-xl border-0 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 focus:ring-2 focus:ring-primary"
                  />
                  <FaSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>

                {/* Category Filter */}
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="rounded-xl border-0 bg-gray-50 py-3 pl-4 pr-10 text-sm text-gray-900 focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Toutes les catégories</option>
                  {Array.isArray(categories) && categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Date Filter */}
                <input
                  type="date"
                  value={filters.date ? format(filters.date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value ? new Date(e.target.value) : null }))}
                  className="rounded-xl border-0 bg-gray-50 py-3 px-4 text-sm text-gray-900 focus:ring-2 focus:ring-primary"
                />

                {/* View Toggle */}
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-1">
                  <button
                    onClick={() => setView('grid')}
                    className={`rounded-lg p-2 ${view === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <FaThLarge className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`rounded-lg p-2 ${view === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <FaList className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Events Grid/List */}
            <div className="mt-8">
              {currentEvents.length > 0 ? (
                <>
                  <div className={`grid gap-6 ${view === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {currentEvents.map((event) => {
                      // Additional validation before rendering
                      if (!event?.id || typeof event.id !== 'string' || event.id.length === 0) {
                        console.warn('Event with invalid ID found:', event);
                        return null;
                      }

                      // Create the URL and validate it
                      const eventUrl = event.id ? `/evenements/${event.id}` : undefined;
                      if (!eventUrl) {
                        console.warn('Invalid event URL for event:', event);
                        return null;
                      }

                      return (
                        <Link
                          href={eventUrl}
                          key={event.id}
                          className={`group relative overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                            view === 'list' ? 'flex' : ''
                          }`}
                        >
                          {/* Event Image */}
                          <div className={`relative ${view === 'list' ? 'w-1/3' : 'h-48'}`}>
                            <img
                              src={event.imageUrl || '/images/event-default.jpg'}
                              alt={event.title}
                              className="h-full w-full object-cover"
                            />
                            {/* Date Badge - Left */}
                            <div className="absolute left-4 top-4">
                              <div className="flex flex-col items-center rounded-xl bg-white/95 px-3 py-1 text-center shadow-sm backdrop-blur-sm">
                                <span className="text-xs font-medium text-gray-600">
                                  {format(new Date(event.date), 'MMM', { locale: fr })}
                                </span>
                                <span className="text-lg font-bold text-primary">
                                  {format(new Date(event.date), 'dd')}
                                </span>
                              </div>
                            </div>
                            {/* Category Badge - Right */}
                            {event.category && categories.length > 0 && (
                              <div className="absolute right-4 top-4">
                                <div className="rounded-xl bg-primary/90 px-3 py-1.5 text-center text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                                  {categories.find(cat => cat.id === event.category)?.name || 'Catégorie'}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Event Content */}
                          <div className={`flex flex-col p-6 ${view === 'list' ? 'w-2/3' : ''}`}>
                            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-[#4C9296]" />
                                <time>{event.time}</time>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-[#4C9296]" />
                                <span>{event.location}</span>
                              </div>
                            </div>

                            <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                              {event.title}
                            </h3>

                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                              {event.description}
                            </p>

                            <div className="mt-6 flex items-center gap-2 text-[#4C9296]">
                              <span className="text-sm font-medium">En savoir plus</span>
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200"
                        aria-label="Page précédente"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                      </button>

                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
                              currentPage === pageNum
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200"
                        aria-label="Page suivante"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Events Count */}
                  <div className="mt-6 text-center text-sm text-gray-600">
                    Affichage de {startIndex + 1} à {Math.min(endIndex, filteredEvents.length)} sur {filteredEvents.length} événements
                  </div>
                </>
              ) : (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white px-4 py-12 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-6 font-serif text-xl font-semibold text-gray-900">
                    Aucun événement trouvé
                  </h3>
                  <p className="mt-2 max-w-sm text-gray-600">
                    Aucun événement ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
} 