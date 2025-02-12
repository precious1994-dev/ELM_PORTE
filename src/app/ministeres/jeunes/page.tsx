'use client'

import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BannerContent } from '@/models/youth-banner'
import { AdnContent } from '@/models/youthADN'
import { Plus, Users, Zap, Calendar, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import HorairesSection from '@/components/jeunes/HorairesSection'
import TeamSection from '@/components/jeunes/TeamSection'

interface Activity {
  _id: string;
  title: string;
  description: string;
  image: string;
  order?: number;
}

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

interface Category {
  id: string
  name: string
}

interface Schedule {
  _id: string;
  title: string;
  day: string;
  time: string;
  description: string;
}

interface SocialNetwork {
  _id: string;
  platform: string;
  url: string;
  isActive: boolean;
}

export default function YouthMinistryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [bannerContent, setBannerContent] = useState<BannerContent>({
    imageUrl: '/images/youth-ministry.jpg',
    welcome: 'Bienvenue au Ministère des Jeunes',
    title: 'Grandis dans ta Foi',
    subtitle: 'Impacte ta Génération',
    description: 'Un espace dynamique où les jeunes peuvent grandir dans leur foi, développer des amitiés authentiques et découvrir leur potentiel en Christ.',
    schedule: 'Tous les Samedis à 18h',
    location: 'Salle des Jeunes'
  })

  const [adnContent, setAdnContent] = useState<AdnContent>({
    mainTitle: 'Notre Vision pour les Jeunes',
    subtitle: 'Notre ADN',
    description: 'Nous croyons que chaque jeune a un potentiel unique et un appel spécial de Dieu. Notre mission est de les accompagner dans leur croissance spirituelle.',
    cards: []
  })

  const [activities, setActivities] = useState<Activity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialNetwork[]>([])
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true)
      try {
        // Fetch banner content
        const bannerResponse = await fetch('/api/jeunes/banner')
        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json()
          setBannerContent(bannerData)
        }

        // Fetch ADN content
        const adnResponse = await fetch('/api/jeunes/adn')
        if (adnResponse.ok) {
          const adnData = await adnResponse.json()
          setAdnContent(adnData)
        }

        // Fetch activities
        const activitiesResponse = await fetch('/api/jeunes/activites')
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivities(activitiesData)
        }

        // Fetch categories first
        const categoriesResponse = await fetch('/api/categories')
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)

        // Find the youth category ID
        const youthCategoryId = categoriesData.find(
          (cat: Category) => 
            cat.name.toLowerCase() === 'jeunes' || 
            cat.name.toLowerCase() === 'jeune' || 
            cat.name.toLowerCase() === 'jeunesse' || 
            cat.name.toLowerCase() === 'youth'
        )?.id

        if (!youthCategoryId) {
          console.error('Youth category not found')
          return
        }

        // Fetch upcoming events
        const eventsResponse = await fetch('/api/events')
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          // Filter and sort upcoming events
          const now = new Date()
          now.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
          
          const upcoming = eventsData
            .filter((event: Event) => {
              const eventDate = new Date(event.date)
              eventDate.setHours(0, 0, 0, 0) // Reset time to start of day
              // Check if event is in the future and belongs to the youth category
              const isYouthEvent = event.category === youthCategoryId
              const isFutureEvent = eventDate >= now
              console.log('Event:', event.title, 'Is Youth:', isYouthEvent, 'Is Future:', isFutureEvent)
              return isFutureEvent && isYouthEvent
            })
            .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3) // Get only the next 3 events
          
          console.log('Filtered events:', upcoming.length, 'events found')
          setUpcomingEvents(upcoming)
        }

        // Fetch schedules
        const schedulesResponse = await fetch('/api/jeunes/horaires');
        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json();
          setSchedules(schedulesData.schedules);
        }

        // Fetch social links
        const socialsResponse = await fetch('/api/jeunes/reseaux')
        if (socialsResponse.ok) {
          const socialsData = await socialsResponse.json()
          setSocialLinks(socialsData.filter((social: SocialNetwork) => social.isActive))
        }
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [])

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Plus':
        return <Plus className="h-7 w-7" />
      case 'Users':
        return <Users className="h-7 w-7" />
      case 'Zap':
        return <Zap className="h-7 w-7" />
      default:
        return <Plus className="h-7 w-7" />
    }
  }

  const toggleDescription = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (isLoading) {
    return (
      <main>
        <Skeleton variant="banner" />
        <Section className="bg-white">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="card" className="bg-white shadow-md" />
              ))}
            </div>
          </Container>
        </Section>

        <Section className="bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="card" className="bg-white shadow-md" />
              ))}
            </div>
          </Container>
        </Section>

        <Section className="bg-white">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="card" className="bg-white shadow-md" />
              ))}
            </div>
          </Container>
        </Section>

        <Section className="bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="team" />
              ))}
            </div>
          </Container>
        </Section>
      </main>
    )
  }

  return (
    <main>
      {/* Hero Section */}
      <Section className="relative min-h-[80vh] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={bannerContent.imageUrl}
            alt="Ministère des Jeunes"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-12 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-12 top-1/2 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>

        {/* Content */}
        <Container className="relative flex min-h-[80vh] items-center">
          <div className="max-w-4xl">
            <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {bannerContent.welcome}
            </span>
            <h1 className="mt-6 font-serif text-5xl font-bold text-white sm:text-6xl md:text-7xl">
              {bannerContent.title},{' '}
              <span className="text-primary-200">
                {bannerContent.subtitle}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
              {bannerContent.description}
            </p>
            
            {/* Quick Info */}
            <div className="mt-12 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/90">{bannerContent.schedule}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-white/90">{bannerContent.location}</p>
              </div>
            </div>
          </div>
        </Container>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-white/70">Découvrir Plus</span>
            <div className="h-12 w-6 rounded-full border-2 border-white/30 p-1">
              <div className="h-2 w-full animate-bounce rounded-full bg-white" />
            </div>
          </div>
        </div>
      </Section>

      {/* Vision Section */}
      <Section className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="relative">
            {/* Section Header */}
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
                {adnContent.subtitle}
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                  {adnContent.mainTitle}
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                {adnContent.description}
              </p>
            </div>

            {/* Vision Cards */}
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {adnContent.cards.map((card, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10 transition-all group-hover:scale-150" />
                  <div className="relative">
                    <h3 className="mb-4 font-serif text-xl font-bold text-[#4C9296]">
                      {card.title}
                    </h3>
                    <p className="text-gray-600">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Activities Section */}
      <Section className="relative overflow-hidden bg-gray-50">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              Programme
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                Nos Activités
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Des moments conçus pour grandir ensemble dans la foi, 
              développer des amitiés authentiques et s'épanouir spirituellement.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => (
              <div
                key={activity._id}
                className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={activity.image}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Content Container */}
                <div className="p-6 relative z-10">
                  <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                    {activity.title}
                  </h3>
                  <p className={`mt-3 text-gray-600 ${!expandedCards[activity._id] && 'line-clamp-3'}`}>
                    {activity.description}
                  </p>
                  {activity.description.length > 150 && (
                    <button
                      onClick={() => toggleDescription(activity._id)}
                      className="mt-2 text-sm font-medium text-[#4C9296] hover:text-[#3A7276] focus:outline-none relative z-20"
                    >
                      {expandedCards[activity._id] ? 'Voir moins' : 'Lire la suite'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Upcoming Events Section */}
      <Section className="relative overflow-hidden bg-gray-50">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              Prochainement
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl text-[#4C9296]">
              Événements à Venir
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Découvrez nos prochains événements spécialement conçus pour les jeunes.
              Des moments de partage, de prière et de croissance spirituelle vous attendent.
            </p>
          </div>

          {/* Upcoming Events Grid */}
          <div className="mt-16">
            {upcomingEvents.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/evenements/${event.id}`}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4C9296] focus:ring-offset-2"
                  >
                    {/* Date Badge */}
                    <div className="absolute left-4 top-4 z-10">
                      <div className="flex flex-col items-center rounded-xl bg-white/95 px-3 py-1 text-center shadow-sm backdrop-blur-sm">
                        <span className="text-xs font-medium text-gray-600">
                          {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-[#4C9296]">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                    </div>

                    {/* Category Label */}
                    <div className="absolute right-4 top-4 z-10">
                      <div className="rounded-full bg-[#4C9296]/90 px-3 py-1 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                        {categories.find(cat => cat.id === event.category)?.name || 'Jeunes'}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative aspect-[2/1] overflow-hidden">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Title */}
                      <h3 className="mt-3 font-serif text-lg font-bold text-[#4C9296] transition-colors">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {event.description}
                      </p>

                      {/* Time and Location */}
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#4C9296]/70" />
                          <time>{event.time}</time>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#4C9296]/70" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="mt-4 flex items-center justify-end">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-[#4C9296] transition-colors group-hover:text-[#3A7276]">
                          En savoir plus
                          <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl bg-white px-4 py-12 text-center shadow-sm">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 ring-8 ring-gray-50/50">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-semibold text-gray-900">
                  Aucun événement à venir
                </h3>
                <p className="mt-2 max-w-sm text-gray-600">
                  Il n'y a pas d'événements prévus pour le moment. Revenez bientôt !
                </p>
              </div>
            )}
          </div>

          {/* View All Events Button */}
          <div className="relative z-10 mt-12 text-center">
            <Link
              href="/evenements"
              className="group relative z-10 inline-block rounded-full border-2 border-[#4C9296] bg-white px-6 py-2 text-[#4C9296] transition-all duration-300 hover:bg-[#4C9296] hover:text-white"
            >
              Voir tous les événements
              <span className="absolute -right-1 -top-1 -z-10 h-full w-full rounded-full bg-[#4C9296]/20 transition-all duration-300 group-hover:right-1 group-hover:top-1" />
            </Link>
          </div>
        </Container>
      </Section>

      {/* Team Section */}
      <TeamSection />

      {/* Schedule Section */}
      <Section className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              Planning
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                Nos Horaires
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Retrouvez-nous lors de nos différentes rencontres hebdomadaires et mensuelles.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10 transition-all group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#4C9296]/10 text-[#4C9296]">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mb-4 flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                      {schedule.day}
                    </h3>
                    <span className="rounded-full bg-[#4C9296]/10 px-3 py-1 text-sm font-medium text-[#4C9296]">
                      {schedule.time}
                    </span>
                  </div>
                  <h4 className="mb-2 font-medium text-gray-900">
                    {schedule.title}
                  </h4>
                  <p className="text-gray-600">
                    {schedule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Social Media Section */}
      <Section className="relative overflow-hidden bg-white">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              Restons Connectés
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                Suivez-nous
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Restez informés de nos activités et connectés avec notre communauté sur les réseaux sociaux.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
              {socialLinks.map((social) => {
                let icon;
                switch (social.platform) {
                  case 'instagram':
                    icon = <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />;
                    break;
                  case 'tiktok':
                    icon = <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />;
                    break;
                  case 'youtube':
                    icon = <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />;
                    break;
                  case 'facebook':
                    icon = <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />;
                    break;
                  default:
                    return null;
                }

                return (
                  <a
                    key={social._id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] p-0.5 transition-all hover:-translate-y-1 hover:shadow-lg"
                    aria-label={`Suivez-nous sur ${social.platform}`}
                  >
                    <span className="flex items-center gap-3 rounded-full bg-white px-6 py-3 transition-all group-hover:bg-opacity-90">
                      <svg className="h-6 w-6 text-[#4C9296]" fill="currentColor" viewBox="0 0 24 24">
                        {icon}
                      </svg>
                      <span className="font-medium text-[#4C9296]">{social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
} 