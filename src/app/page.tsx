'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'
import { EventCard } from '@/components/events/EventCard'
import { FaPlay, FaPrayingHands, FaUsers, FaHandsHelping, FaClock, FaBible, FaPray, FaMusic, FaArrowRight } from 'react-icons/fa'
import { EventModal } from '@/components/events/EventModal'
import { SermonModal } from '@/components/sermons/SermonModal'
import HomeSlider from '@/components/home/HomeSlider'
import VisionSection from '@/components/home/VisionSection'
import CommunitySection from '@/components/home/CommunitySection'
import HorairesSection from '@/components/horaires/HorairesSection'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  imageUrl: string
  category: string
}

interface Sermon {
  _id: string
  title: string
  speaker: string
  date: string
  passage: string
  description: string
  duration: string
  image: string
  youtubeUrl: string
}

interface SermonModalType {
  id: string
  title: string
  speaker: string
  date: string
  passage: string
  description: string
  duration: string
  image: string
  youtubeUrl: string
}

interface Category {
  id: string
  name: string
}

export default function Home() {
  const router = useRouter()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedSermon, setSelectedSermon] = useState<SermonModalType | null>(null)
  const [isSermonModalOpen, setIsSermonModalOpen] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSermonsLoading, setIsSermonsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sermonsError, setSermonsError] = useState<string | null>(null)

  // Fetch upcoming events and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [eventsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/categories')
        ])

        if (!eventsResponse.ok || !categoriesResponse.ok) {
          throw new Error('Erreur lors du chargement des données')
        }

        const [eventsData, categoriesData] = await Promise.all([
          eventsResponse.json(),
          categoriesResponse.json()
        ])
        
        // Sort events by date and filter only upcoming events
        const now = new Date()
        const sortedUpcomingEvents = eventsData
          .filter((event: Event) => new Date(event.date) >= now)
          .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3) // Get only the next 3 upcoming events
        
        setUpcomingEvents(sortedUpcomingEvents)
        setCategories(categoriesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch recent sermons
  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setIsSermonsLoading(true)
        const response = await fetch('/api/sermons?limit=3') // Get only 3 most recent sermons
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des prédications')
        }
        const data = await response.json()
        setRecentSermons(data.sermons)
      } catch (err) {
        setSermonsError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setIsSermonsLoading(false)
      }
    }

    fetchSermons()
  }, [])

  const transformSermonData = (sermon: Sermon): SermonModalType => {
    return {
      id: sermon._id,
      title: sermon.title,
      speaker: sermon.speaker,
      date: sermon.date,
      passage: sermon.passage,
      description: sermon.description,
      duration: sermon.duration,
      image: sermon.image,
      youtubeUrl: sermon.youtubeUrl,
    };
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }

  const handleSermonClick = (sermon: Sermon) => {
    setSelectedSermon(transformSermonData(sermon))
    setIsSermonModalOpen(true)
  }

  return (
    <main className="animate-fade-in">
      <HomeSlider />

      {/* Vision Section */}
      <VisionSection />

      {/* Community Section */}
      <CommunitySection />

      {/* Events Section */}
      <Section className="bg-gradient-to-b from-white to-gray-50/50">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-[#4C9296] sm:text-5xl">
              Événements à Venir
            </h2>
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-[#4C9296]/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm font-semibold uppercase tracking-wider text-[#4C9296]">
                  Rejoignez-nous
                </span>
              </div>
            </div>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Participez à nos événements et faites partie d'une communauté vivante et dynamique
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {isLoading ? (
              // Loading skeleton
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl bg-white shadow-md">
                  <div className="h-48 w-full rounded-t-2xl bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="mt-4 h-6 w-3/4 rounded bg-gray-200" />
                    <div className="mt-3 h-16 w-full rounded bg-gray-200" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-3 rounded-2xl bg-red-50 p-6 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="col-span-3 rounded-2xl bg-white p-6 text-center">
                <p className="text-gray-600">Aucun événement à venir pour le moment.</p>
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image Container */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={event.imageUrl || '/images/event-default.jpg'}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Date Badge */}
                    <div className="absolute right-4 top-4 rounded-xl bg-white/90 p-2 text-center backdrop-blur-sm">
                      <div className="text-lg font-bold text-primary">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-xs font-medium text-gray-600">
                        {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                      </div>
                    </div>
                    {/* Category Badge */}
                    {event.category && (
                      <div className="absolute left-4 top-4">
                        <div className="rounded-xl bg-primary/90 px-3 py-1.5 text-center text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                          {categories.find(cat => cat.id === event.category)?.name || 'Catégorie'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#4C9296]">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {event.time}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-[#4C9296]">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                    <h3 className="mt-4 font-serif text-xl font-bold text-[#4C9296]">
                      {event.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-16">
            <Button 
              size="lg" 
              onClick={() => router.push('/evenements')}
              className="group relative z-10 rounded-full border-2 border-[#4C9296] bg-white px-6 py-2 text-[#4C9296] transition-all duration-300 hover:bg-[#4C9296] hover:text-white"
            >
              <span className="flex items-center gap-2">
                Voir tous les événements
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="h-4 w-4 stroke-current transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M6.75 5.75 9.25 8l-2.5 2.25"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Latest Sermons Section */}
      <Section>
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              Dernières Prédications
            </h2>
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-primary/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm font-semibold uppercase tracking-wider text-primary">
                  Messages inspirants
                </span>
              </div>
            </div>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Découvrez nos messages les plus récents et laissez-vous inspirer par la Parole de Dieu
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isSermonsLoading ? (
              // Loading skeleton for sermons
              Array(3).fill(0).map((_, index) => (
                <div key={`sermon-skeleton-${index}`} className="animate-pulse overflow-hidden rounded-lg bg-white shadow-lg">
                  <div className="h-48 w-full bg-gray-200" />
                  <div className="p-5">
                    <div className="h-6 w-3/4 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-1/3 rounded bg-gray-200" />
                    <div className="mt-3 h-16 w-full rounded bg-gray-200" />
                    <div className="mt-4 flex gap-3">
                      <div className="h-9 w-full rounded bg-gray-200" />
                      <div className="h-9 w-9 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))
            ) : sermonsError ? (
              <div className="col-span-3 rounded-2xl bg-red-50 p-6 text-center">
                <p className="text-red-600">{sermonsError}</p>
              </div>
            ) : recentSermons.length === 0 ? (
              <div className="col-span-3 rounded-2xl bg-white p-6 text-center">
                <p className="text-gray-600">Aucune prédication disponible pour le moment.</p>
              </div>
            ) : (
              recentSermons.map((sermon) => (
                <div
                  key={`sermon-${sermon._id}`}
                  className="group overflow-hidden rounded-lg bg-white shadow-lg transition hover:shadow-xl"
                >
                  <Link href={`/predications/${sermon._id}`} className="block">
                    <div className="relative h-48 w-full">
                      <Image
                        src={sermon.image || '/images/sermons/default.jpg'}
                        alt={sermon.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="line-clamp-1 font-serif text-xl font-semibold text-[#4C9296]">
                        {sermon.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {sermon.speaker} · {sermon.duration}
                      </p>
                      <p className="mt-1 text-sm font-medium text-primary">
                        {sermon.passage}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {sermon.description}
                      </p>
                      <div className="mt-4 flex gap-3">
                        <Button 
                          size="sm" 
                          className="flex-1 rounded-full bg-[#4C9296] text-white transition-all duration-300 hover:bg-[#3A7276]"
                          onClick={(e) => {
                            e.preventDefault();
                            handleSermonClick(sermon);
                          }}
                        >
                          Écouter
                        </Button>
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#4C9296] text-[#4C9296] transition-all duration-300 hover:bg-[#4C9296] hover:text-white"
                        >
                          <FaArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
          <div className="mt-16">
            <Button 
              size="lg" 
              onClick={() => router.push('/predications')}
              className="group relative z-10 rounded-full border-2 border-[#4C9296] bg-white px-6 py-2 text-[#4C9296] transition-all duration-300 hover:bg-[#4C9296] hover:text-white"
            >
              <span className="flex items-center gap-2">
                Voir toutes les prédications
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="h-4 w-4 stroke-current transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M6.75 5.75 9.25 8l-2.5 2.25"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Horaires Section - Moved to bottom */}
      <Section className="bg-gradient-to-b from-gray-50/50 to-white">
        <HorairesSection />
      </Section>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        categories={categories}
      />

      {/* Sermon Modal */}
      <SermonModal
        sermon={selectedSermon}
        isOpen={isSermonModalOpen}
        onClose={() => {
          setIsSermonModalOpen(false)
          setSelectedSermon(null)
        }}
      />
    </main>
  )
} 