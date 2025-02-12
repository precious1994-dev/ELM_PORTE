'use client'

import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Hero } from '@/components/sections/mens-ministry/hero'
import { Vision } from '@/components/sections/mens-ministry/vision'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface BannerContent {
  imageUrl: string
  welcome: string
  title: string
  subtitle: string
  description: string
}

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

interface VisionContent {
  title: string
  subtitle: string
  description: string
  features: Feature[]
}

interface Activity {
  title: string
  description: string
  imageUrl: string
  schedule: string
  location: string
}

interface ActivitiesContent {
  sectionTitle: string
  subtitle: string
  description: string
  activities: Activity[]
}

interface TeamMember {
  name: string
  role: string
  description: string
  image: string
  email: string
  phone: string
}

interface TeamContent {
  title: string
  subtitle: string
  description: string
  members: TeamMember[]
}

const defaultFeatures = [
  {
    title: 'Croissance Spirituelle',
    description: 'Développer une relation profonde avec Dieu à travers la prière et l\'étude biblique.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Leadership',
    description: 'Former des leaders servant avec intégrité dans leur famille, église et société.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Fraternité',
    description: 'Créer des liens authentiques et un soutien mutuel entre hommes.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

const defaultIcons = {
  breakfast: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  bible: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  sports: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
}

export default function MensMinistryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [banner, setBanner] = useState<BannerContent>({
    imageUrl: '',
    welcome: '',
    title: '',
    subtitle: '',
    description: ''
  })
  const [vision, setVision] = useState<VisionContent>({
    title: '',
    subtitle: '',
    description: '',
    features: []
  })
  const [activities, setActivities] = useState<ActivitiesContent>({
    sectionTitle: '',
    subtitle: '',
    description: '',
    activities: []
  })
  const [team, setTeam] = useState<TeamContent>({
    title: '',
    subtitle: '',
    description: '',
    members: []
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch activities data with proper cache control
        const activitiesResponse = await fetch('/api/hommes/activites', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        })
        
        if (!activitiesResponse.ok) {
          throw new Error('Failed to fetch activities')
        }

        const activitiesData = await activitiesResponse.json()
        console.log('Fetched activities data:', activitiesData) // Debug log

        if (activitiesData && activitiesData.activities) {
          // Add timestamp to image URLs to prevent caching
          const updatedActivities = {
            ...activitiesData,
            activities: activitiesData.activities.map((activity: Activity) => {
              console.log('Activity image URL:', activity.imageUrl) // Debug log
              return {
                ...activity,
                imageUrl: activity.imageUrl || '' // Ensure imageUrl is never undefined
              }
            })
          }
          setActivities(updatedActivities)
        }

        // Fetch other data...
        const bannerResponse = await fetch('/api/hommes/banner')
        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json()
          setBanner(bannerData)
        }

        const visionResponse = await fetch('/api/hommes/vision')
        if (visionResponse.ok) {
          const visionData = await visionResponse.json()
          setVision(visionData)
        }

        const teamResponse = await fetch('/api/hommes/equipe')
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeam(teamData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getFeatureWithDefaultIcon = (feature: Feature, index: number) => ({
    ...feature,
    title: feature.title || defaultFeatures[index].title,
    description: feature.description || defaultFeatures[index].description,
    icon: defaultFeatures[index].icon,
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (isLoading) {
    return (
      <main>
        {/* Hero Section Skeleton */}
        <Skeleton variant="banner" />

        {/* Vision Section Skeleton */}
        <Section className="relative overflow-hidden">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-md">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10" />
                  <div className="relative">
                    <div className="mb-6">
                      <Skeleton className="h-12 w-12 rounded-2xl" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Activities Section Skeleton */}
        <Section className="relative overflow-hidden bg-gray-50">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-white shadow-md">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="h-8 w-32 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Team Section Skeleton */}
        <Section className="relative overflow-hidden">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Skeleton className="h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <Skeleton className="h-8 w-48 mb-3" />
                      <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      </main>
    )
  }

  return (
    <>
      <Hero key="mens-ministry-hero" {...banner} />
      
      <Vision key="mens-ministry-vision" {...vision} />
      
      <Section key="mens-ministry-activities" className="relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              {activities.subtitle || 'Activités'}
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                {activities.sectionTitle || 'Nos Programmes'}
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {activities.description || 'Des activités variées pour renforcer votre foi et créer des liens fraternels.'}
            </p>
          </div>

          {error ? (
            <div className="mt-16 text-center text-red-500">
              {error}
            </div>
          ) : activities.activities.length > 0 ? (
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {activities.activities.map((activity, index) => (
                <div
                  key={`activity-${index}`}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48">
                    {activity.imageUrl ? (
                      <Image
                        src={activity.imageUrl}
                        alt={activity.title || 'Activity image'}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#4C9296]/10 flex items-center justify-center">
                        <svg className="h-12 w-12 text-[#4C9296]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                      {activity.title}
                    </h3>
                    <p className="mt-2 text-gray-600">{activity.description}</p>
                    {(activity.schedule || activity.location) && (
                      <div key={`activity-badges-${index}`} className="mt-4 flex flex-wrap gap-2">
                        {activity.schedule && (
                          <span key={`activity-schedule-${index}`} className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-3 py-1 text-sm text-[#4C9296]">
                            {activity.schedule}
                          </span>
                        )}
                        {activity.location && (
                          <span key={`activity-location-${index}`} className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-3 py-1 text-sm text-[#4C9296]">
                            {activity.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16 text-center text-gray-500">
              Aucune activité disponible pour le moment.
            </div>
          )}
        </Container>
      </Section>

      <Section key="mens-ministry-team" className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              Notre Équipe
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                {team.title}
              </span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.members.map((member, index) => (
              <div
                key={`team-member-${index}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl flex-shrink-0 w-full"
              >
                <Image
                  src={member.image || '/images/placeholder-user.jpg'}
                  alt={member.name}
                  width={400}
                  height={500}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Permanent Overlay with Text */}
                <div key={`team-member-overlay-${index}`} className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div key={`team-member-content-${index}`} className="absolute bottom-0 left-0 right-0 p-8 text-left transform transition-transform duration-300 group-hover:translate-y-0">
                    <h3 className="font-serif text-2xl font-bold text-white">
                      {member.name}
                    </h3>
                    <p key={`team-member-role-${index}`} className="mt-3">
                      <span className="text-[#4C9296] bg-white/90 px-4 py-1.5 rounded-full text-sm font-medium">
                        {member.role}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
} 