'use client'

import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BannerContent } from '@/app/api/bapteme/banner/route'
import { AboutBaptemeContent } from '@/app/api/bapteme/a-propos-le-bapteme/route'
import { FAQContent } from '@/app/api/bapteme/faq/route'

interface ProcessContent {
  mainTitle: string
  subtitle: string
  description: string
  steps: {
    title: string
    description: string
    image: string
    icon: string
  }[]
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

export default function BaptismPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [bannerContent, setBannerContent] = useState<BannerContent>({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    isActive: true
  })
  const [aboutContent, setAboutContent] = useState<AboutBaptemeContent>({
    mainTitle: 'Le Baptême',
    subtitle: 'À Propos',
    description: 'Le baptême est un acte d\'obéissance et un témoignage public de notre foi en Jésus-Christ. C\'est une étape importante dans la vie de tout croyant.',
    cards: [
      {
        title: 'Signification',
        description: 'Le baptême symbolise notre identification à la mort, l\'ensevelissement et la résurrection de Christ.',
        icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      },
      {
        title: 'Engagement',
        description: 'C\'est un engagement public à suivre Christ et à vivre selon Ses enseignements.',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        title: 'Témoignage',
        description: 'Une déclaration publique de notre foi et de notre nouvelle vie en Christ.',
        icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
      }
    ]
  })
  const [processContent, setProcessContent] = useState<ProcessContent>({
    mainTitle: 'Les Étapes du Baptême',
    subtitle: 'Processus',
    description: 'Découvrez le parcours vers le baptême dans notre église.',
    steps: [
      {
        title: 'Préparation',
        description: 'Rencontres avec un responsable pour comprendre la signification du baptême.',
        image: '/images/baptism/preparation.jpg',
        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
      },
      {
        title: 'Témoignage',
        description: 'Partage de votre expérience de foi avec la communauté.',
        image: '/images/baptism/testimony.jpg',
        icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
      },
      {
        title: 'Célébration',
        description: 'La cérémonie du baptême lors d\'un culte spécial.',
        image: '/images/baptism/celebration.jpg',
        icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
      }
    ]
  })
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [faqContent, setFaqContent] = useState<FAQContent>({
    questions: []
  })

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true)
      try {
        // Fetch banner content
        const bannerResponse = await fetch('/api/bapteme/banner')
        if (!bannerResponse.ok) {
          throw new Error('Failed to fetch banner')
        }
        const bannerData = await bannerResponse.json()
        if (bannerData) {
          setBannerContent(bannerData)
        }

        // Fetch about section content
        const aboutResponse = await fetch('/api/bapteme/a-propos-le-bapteme')
        if (!aboutResponse.ok) {
          throw new Error('Failed to fetch about content')
        }
        const aboutData = await aboutResponse.json()
        if (aboutData) {
          setAboutContent(aboutData)
        }

        // Fetch process section content
        const processResponse = await fetch('/api/bapteme/process-bapteme')
        if (!processResponse.ok) {
          throw new Error('Failed to fetch process content')
        }
        const processData = await processResponse.json()
        if (processData) {
          setProcessContent(processData)
        }

        // Fetch categories first
        const categoriesResponse = await fetch('/api/categories')
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)

        // Find the baptism category ID
        const baptismCategoryId = categoriesData.find(
          (cat: Category) => 
            cat.name.toLowerCase() === 'baptême' || 
            cat.name.toLowerCase() === 'bapteme' ||
            cat.name.toLowerCase() === 'baptism'
        )?.id

        if (!baptismCategoryId) {
          console.error('Baptism category not found')
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
              // Check if event is in the future and belongs to the baptism category
              return eventDate >= now && event.category === baptismCategoryId
            })
            .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 2) // Get only the next 2 events
          
          setUpcomingEvents(upcoming)
        }

        // Fetch FAQ content
        const faqResponse = await fetch('/api/bapteme/faq')
        if (!faqResponse.ok) {
          throw new Error('Failed to fetch FAQ content')
        }
        const faqData = await faqResponse.json()
        if (faqData) {
          setFaqContent(faqData)
        }
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (isLoading) {
    return (
      <main>
        {/* Banner Section Skeleton */}
        <Skeleton variant="banner" />

        {/* About Section Skeleton */}
        <Section className="bg-white">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="card" className="bg-white shadow-md" />
              ))}
            </div>
          </Container>
        </Section>

        {/* Process Section Skeleton */}
        <Section className="bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col">
                  <Skeleton className="aspect-[4/3] w-full rounded-t-2xl" />
                  <div className="bg-white p-6 rounded-b-2xl">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Events Section Skeleton */}
        <Section className="bg-white">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Skeleton key={i} variant="event" className="bg-white shadow-md" />
              ))}
            </div>
          </Container>
        </Section>

        {/* FAQ Section Skeleton */}
        <Section className="bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <Skeleton className="h-6 w-full mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
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
            src={bannerContent.imageUrl || '/images/baptism.jpg'}
            alt="Le Baptême"
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
        <Container className="relative flex min-h-[80vh] items-center">
          <div className="max-w-4xl">
            <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {bannerContent.subtitle || 'Le Baptême'}
            </span>
            <h1 className="mt-6 font-serif text-5xl font-bold text-white sm:text-6xl md:text-7xl">
              {bannerContent.title || 'Une Nouvelle Vie en Christ'}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
              {bannerContent.description || 'Le baptême est un acte public de foi, symbolisant notre identification à la mort et à la résurrection de Jésus-Christ.'}
            </p>
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

      {/* About Section */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="relative">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
                {aboutContent.subtitle}
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                  {aboutContent.mainTitle}
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                {aboutContent.description}
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {aboutContent.cards.map((card, index) => (
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

      {/* Steps Section */}
      <Section className="relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              {processContent.subtitle}
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                {processContent.mainTitle}
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {processContent.description}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {processContent.steps.map((step, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                      <div className="text-white">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Upcoming Events Section */}
      <Section className="relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              Événements
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                Prochains Baptêmes
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Découvrez les prochaines célébrations de baptême dans notre église.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image Container */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={event.imageUrl || 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/events-default'}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e: any) => {
                        console.error('Image failed to load:', event.imageUrl);
                        if (event.imageUrl?.startsWith('http')) {
                          e.target.src = '/images/events/baptism-default.jpg';
                        } else {
                          e.target.src = 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/events-default';
                        }
                      }}
                      priority={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-[#4C9296] shadow-lg backdrop-blur-sm">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {categories.find(cat => cat.id === event.category)?.name || 'Baptême'}
                      </span>
                    </div>

                    {/* Date Badge */}
                    <div className="absolute right-4 top-4">
                      <div className="rounded-xl bg-white/90 px-3 py-2 text-center shadow-lg backdrop-blur-sm">
                        <div className="text-lg font-bold text-[#4C9296]">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-xs font-medium text-gray-600">
                          {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl font-bold text-gray-900 group-hover:text-[#4C9296] transition-colors">
                      {event.title}
                    </h3>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-[#4C9296]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{event.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-[#4C9296]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="mt-4 text-gray-600 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between">
                      <Link 
                        href={`/evenements/${event.id}`}
                        className="group inline-flex items-center gap-2 text-sm font-medium text-[#4C9296] transition-colors hover:text-[#3A7276]"
                      >
                        Plus d'infos
                        <svg 
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>

                      <button 
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-[#4C9296]/5 hover:text-[#4C9296]"
                        aria-label="Ajouter au calendrier"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex min-h-[300px] flex-col items-center justify-center rounded-3xl bg-white px-4 py-12 text-center shadow-sm">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 ring-8 ring-gray-50/50">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-6 font-serif text-xl font-semibold text-gray-900">
                  Aucun baptême prévu
                </h3>
                <p className="mt-2 max-w-sm text-gray-600">
                  Il n'y a pas de baptêmes prévus pour le moment. Revenez bientôt !
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* FAQ Section */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              FAQ
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                Questions Fréquentes
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Trouvez les réponses à vos questions sur le baptême.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {faqContent.questions.map((faq, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10 transition-all group-hover:scale-150" />
                <div className="relative">
                  <h3 className="mb-4 font-serif text-xl font-bold text-[#4C9296]">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  )
} 