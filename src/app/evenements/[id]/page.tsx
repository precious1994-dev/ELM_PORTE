'use client'

import { useState, useEffect } from 'react'
import { format, addHours, parseISO, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { MapPin, Clock, ArrowLeft, Share2, Calendar, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'

type Event = {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  imageUrl: string
  category?: string
}

export default function EventPage() {
  const [event, setEvent] = useState<Event | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const params = useParams()
  const router = useRouter()

  const eventsPerPage = 3
  const totalPages = Math.ceil(upcomingEvents.length / eventsPerPage)
  const startIndex = (currentPage - 1) * eventsPerPage
  const endIndex = startIndex + eventsPerPage
  const currentEvents = upcomingEvents.slice(startIndex, endIndex)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${params.id}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch event')
        }
        const data = await response.json()
        setEvent(data)

        // Fetch all events for upcoming events section
        const allEventsResponse = await fetch('/api/events')
        const allEvents = await allEventsResponse.json()
        
        // Filter and sort upcoming events, excluding the current event
        const upcoming = allEvents
          .filter((e: Event) => {
            const eventDate = parseISO(`${e.date}T${e.time}`)
            return e.id !== params.id && isFuture(eventDate)
          })
          .sort((a: Event, b: Event) => {
            const dateA = parseISO(`${a.date}T${a.time}`)
            const dateB = parseISO(`${b.date}T${b.time}`)
            return dateA.getTime() - dateB.getTime()
          });

        setUpcomingEvents(upcoming)
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Impossible de charger l\'événement')
        router.push('/evenements')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEvent()
    }
  }, [params.id, router])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Lien copié dans le presse-papier')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleAddToCalendar = () => {
    if (!event) return
    
    const startDate = parseISO(`${event.date}T${event.time}`)
    const endDate = addHours(startDate, 2)
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}\/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`
    
    window.open(googleCalendarUrl, '_blank')
    toast.success('Ouverture de Google Calendar...')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'événement...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  const eventDate = parseISO(`${event.date}T${event.time}`)
  const isUpcoming = eventDate > new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div 
        className={`fixed top-24 left-0 right-0 z-50 transition-all duration-300`}
      >
        <Container size="md">
          <div className="flex items-center">
            <Link
              href="/evenements"
              className={`group inline-flex items-center rounded-full transition-all duration-300 ${
                isScrolled 
                  ? 'bg-primary/10 hover:bg-primary/20' 
                  : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
              } px-4 py-2`}
              aria-label="Retour à la liste des événements"
            >
              <span className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors mr-3 ${
                isScrolled 
                  ? 'bg-primary/20 group-hover:bg-primary/30' 
                  : 'bg-white/20 group-hover:bg-white/30'
              }`}>
                <ArrowLeft className={`h-4 w-4 ${isScrolled ? 'text-primary' : 'text-white'}`} />
              </span>
              <span className={`font-medium ${isScrolled ? 'text-primary' : 'text-white'}`}>
                Retour aux événements
              </span>
            </Link>
          </div>
        </Container>
      </div>

      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={event.imageUrl || '/images/events-default.jpg'}
            alt=""
            className="object-cover w-full h-full animate-fade-in"
            style={{ animationDuration: '1s' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
        </div>
        <Container size="md" className="relative h-full">
          <div className="flex flex-col justify-end h-full pb-24 pt-32">
            <div className="animate-slide-up" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }}>
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="inline-flex items-center bg-primary/20 text-white backdrop-blur-sm rounded-full px-4 py-1 text-sm font-medium">
                  {format(eventDate, 'EEEE', { locale: fr })}
                </span>
                {isUpcoming && (
                  <span className="inline-flex items-center bg-green-500/20 text-green-100 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-medium">
                    À venir
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <time dateTime={eventDate.toISOString()}>
                    {format(eventDate, "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                  </time>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <address className="not-italic">{event.location}</address>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Event Details */}
      <Section className="py-16 -mt-16 relative z-10">
        <Container size="md">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden transform animate-slide-up" style={{ animationDuration: '0.8s', animationDelay: '0.4s' }}>
            <div className="grid lg:grid-cols-7 gap-0">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-5 p-8 lg:p-12 lg:border-r border-gray-100">
                <div className="space-y-8">
                  {/* Event Description Header */}
                  <div className="flex items-start space-x-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        À propos de l'événement
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Tous les détails sur cet événement
                      </p>
                    </div>
                  </div>

                  {/* Event Description Content */}
                  <div className="pl-18">
                    <div className="prose prose-lg max-w-none">
                      <div className="space-y-6">
                        {event.description.split('\n').map((paragraph, index) => (
                          <div 
                            key={index} 
                            className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all duration-200"
                          >
                            <p className="text-gray-600 leading-relaxed m-0">
                              {paragraph}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Quick Actions */}
              <div className="lg:col-span-2 p-8 lg:p-12 bg-gray-50">
                <div className="space-y-6">
                  <Button
                    onClick={handleAddToCalendar}
                    className="w-full bg-primary hover:bg-primary/90 justify-center text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ajouter au calendrier
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full justify-center text-gray-900"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Itinéraire
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <Section className="py-24 bg-gray-50">
          <Container>
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-3 py-1 text-sm font-medium text-[#4C9296]">
                À venir
              </span>
              <h2 className="mt-4 text-3xl font-serif font-bold tracking-tight text-[#4C9296] sm:text-4xl">
                Autres événements à ne pas manquer
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Découvrez nos prochains événements et rejoignez-nous
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid gap-8 md:grid-cols-3">
              {currentEvents.map((upcomingEvent) => (
                <Link
                  key={upcomingEvent.id}
                  href={`/evenements/${upcomingEvent.id}`}
                  className="group relative block overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Event Image */}
                  <div className="aspect-[16/9] overflow-hidden">
                    <div className="relative h-full w-full">
                      <img
                        src={upcomingEvent.imageUrl || '/images/event-default.jpg'}
                        alt={upcomingEvent.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Date Badge */}
                      <div className="absolute left-4 top-4">
                        <div className="flex flex-col items-center rounded-xl bg-white/95 px-3 py-1 text-center shadow-sm backdrop-blur-sm">
                          <span className="text-xs font-medium text-gray-600">
                            {format(parseISO(upcomingEvent.date), 'MMM', { locale: fr })}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {format(parseISO(upcomingEvent.date), 'dd')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                      {upcomingEvent.title}
                    </h3>
                    
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {upcomingEvent.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary/70" />
                        <time>{upcomingEvent.time}</time>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary/70" />
                        <span className="line-clamp-1">{upcomingEvent.location}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-primary">
                      <span className="text-sm font-medium">En savoir plus</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 transition-all duration-200"
                  aria-label="Page précédente"
                >
                  <ArrowLeft className="h-4 w-4" />
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

            {/* View All Events Button */}
            <div className={`${totalPages > 1 ? 'mt-8' : 'mt-12'} text-center`}>
              <Link
                href="/evenements"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-gray-900/10 transition-all hover:bg-gray-50 hover:ring-gray-900/20"
              >
                Voir tous les événements
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </Section>
      )}
    </div>
  )
} 