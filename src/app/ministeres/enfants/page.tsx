'use client'

import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { BannerContent } from '@/app/api/enfants/banner/route'
import type { VisionContent } from '@/app/api/enfants/vision/route'
import type { ClassContent } from '@/app/api/enfants/nos-claasse/route'
import { TeamSection } from '@/components/ministries/children/TeamSection'

export default function ChildrenMinistryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [banner, setBanner] = useState<BannerContent>({
    imageUrl: "/images/children-ministry.jpg",
    welcome: "Bienvenue au Ministère des Enfants",
    title: "Grandir dans la Foi",
    subtitle: "avec Joie et Créativité",
    description: "Un espace sécurisé et amusant où les enfants découvrent l'amour de Dieu à travers des activités adaptées à leur âge.",
    schedule: "Chaque Dimanche à 10h",
    location: "Salle des Enfants"
  })

  const [vision, setVision] = useState<VisionContent>({
    title: "Notre Vision",
    subtitle: "pour les Enfants",
    description: "Nous croyons que chaque enfant est précieux aux yeux de Dieu. Notre mission est de les guider dans leur découverte de la foi avec amour et créativité.",
    cards: [
      {
        title: "Amour & Sécurité",
        description: "Un environnement sûr et bienveillant où chaque enfant se sent aimé, valorisé et protégé.",
        icon: "heart"
      },
      {
        title: "Apprentissage Biblique",
        description: "Des enseignements bibliques adaptés à chaque âge, rendant la Parole de Dieu accessible et pertinente.",
        icon: "book"
      },
      {
        title: "Amusement & Créativité",
        description: "Des activités ludiques et créatives qui rendent l'apprentissage de la foi amusant et mémorable.",
        icon: "smile"
      }
    ]
  })

  const [classes, setClasses] = useState<ClassContent>({
    title: "Nos Classes",
    subtitle: "Groupes d'Âge",
    description: "Des programmes adaptés à chaque étape du développement de l'enfant.",
    classes: [
      {
        title: "Les Petits",
        ageRange: "3-5 ans",
        description: "Découverte des histoires bibliques à travers le jeu, les chansons et les activités manuelles.",
        image: "/images/children/little-ones.jpg"
      },
      {
        title: "Les Explorateurs",
        ageRange: "6-8 ans",
        description: "Apprentissage interactif des valeurs bibliques et développement des amitiés chrétiennes.",
        image: "/images/children/explorers.jpg"
      },
      {
        title: "Les Aventuriers",
        ageRange: "9-11 ans",
        description: "Approfondissement de la foi et préparation à la transition vers le groupe des jeunes.",
        image: "/images/children/adventurers.jpg"
      }
    ]
  })

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true)
      try {
        // Fetch banner data
        const bannerResponse = await fetch('/api/enfants/banner', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json();
          setBanner(prevBanner => ({
            ...prevBanner,
            ...bannerData
          }));
        }

        // Fetch vision data
        const visionResponse = await fetch('/api/enfants/vision', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (visionResponse.ok) {
          const visionData = await visionResponse.json();
          setVision(prevVision => ({
            ...prevVision,
            ...visionData,
            cards: Array.isArray(visionData.cards) ? visionData.cards : []
          }));
        }

        // Fetch classes data
        const classesResponse = await fetch('/api/enfants/nos-claasse', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClasses(prevClasses => ({
            ...prevClasses,
            ...classesData,
            classes: Array.isArray(classesData.classes) ? classesData.classes : []
          }));
        }

      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false)
      }
    };

    fetchContent();
  }, []);

  // Helper function to get the icon component based on the icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'heart':
        return (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'book':
        return (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'smile':
        return (
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <main>
        <Skeleton variant="banner" />
        
        {/* Vision Section Skeleton */}
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

        {/* Classes Section Skeleton */}
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
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Team Section Skeleton */}
        <Section className="bg-white">
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
    <>
      {/* Banner Section */}
      <section className="relative min-h-[80vh] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={banner.imageUrl}
            alt="Ministère des Enfants"
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
              {banner.welcome}
            </span>
            <h1 className="mt-6 font-serif text-5xl font-bold text-white sm:text-6xl md:text-7xl">
              {banner.title}{' '}
              <span className="text-primary-200">
                {banner.subtitle}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
              {banner.description}
            </p>
            
            {/* Quick Info */}
            <div className="mt-12 flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/90">{banner.schedule}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-white/90">{banner.location}</p>
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
      </section>

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
                Notre Approche
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                  {vision.title}
                </span>{' '}
                <span className="text-[#4C9296]">{vision.subtitle}</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                {vision.description}
              </p>
            </div>

            {/* Vision Cards */}
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {vision.cards.map((card, index) => (
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

      {/* Classes Section */}
      <Section className="relative overflow-hidden bg-gray-50">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              {classes.subtitle}
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                {classes.title}
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {classes.description}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {classes.classes.map((cls, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48">
                  <Image
                    src={cls.image}
                    alt={cls.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
                      <div className="text-white">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                      {cls.title}
                    </h3>
                    <span className="rounded-full bg-[#4C9296]/10 px-3 py-1 text-sm font-medium text-[#4C9296]">
                      {cls.ageRange}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {cls.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Team Section */}
      <TeamSection />
    </>
  )
} 