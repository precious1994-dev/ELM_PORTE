'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface BannerContent {
  imageUrl: string
  welcome: string
  title: string
  subtitle: string
  description: string
  schedule: string
  location: string
}

interface VisionContent {
  subtitle: string
  title: string
  description: string
  points: {
    title: string
    description: string
    icon: string
  }[]
}

interface ActivitesContent {
  sectionTitle: string
  subtitle: string
  description: string
  activities: {
    title: string
    description: string
    imageUrl: string
    schedule?: string
    location?: string
  }[]
}

interface TeamContent {
  sectionTitle: string
  subtitle: string
  description: string
  members: {
    name: string
    role: string
    imageUrl: string
  }[]
}

export default function WomensMinistryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [banner, setBanner] = useState<BannerContent>({
    imageUrl: '',
    welcome: '',
    title: '',
    subtitle: '',
    description: '',
    schedule: '',
    location: ''
  })

  const [vision, setVision] = useState<VisionContent>({
    subtitle: '',
    title: '',
    description: '',
    points: []
  })

  const [activites, setActivites] = useState<ActivitesContent>({
    sectionTitle: '',
    subtitle: '',
    description: '',
    activities: []
  })

  const [team, setTeam] = useState<TeamContent>({
    sectionTitle: '',
    subtitle: '',
    description: '',
    members: []
  })

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const bannerResponse = await fetch('/api/femmes/banner')
        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json()
          setBanner(bannerData)
        }

        const visionResponse = await fetch('/api/femmes/vision')
        if (visionResponse.ok) {
          const visionData = await visionResponse.json()
          setVision(visionData)
        }

        const activitesResponse = await fetch('/api/femmes/activites')
        if (activitesResponse.ok) {
          const activitesData = await activitesResponse.json()
          setActivites(activitesData)
        }

        const teamResponse = await fetch('/api/femmes/equipe')
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeam(teamData)
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
        {/* Hero Section Skeleton */}
        <Section className="relative min-h-[80vh] overflow-hidden">
          <Skeleton variant="banner" className="absolute inset-0" />
          <Container className="relative flex min-h-[80vh] items-center">
            <div className="max-w-4xl">
              <Skeleton className="h-10 w-48 rounded-full" />
              <Skeleton className="mt-6 h-16 w-3/4 sm:h-20 md:h-24" />
              <Skeleton className="mt-6 h-20 w-2/3" />
              <div className="mt-8 flex flex-wrap gap-4">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </Container>
          {/* Scroll Indicator Skeleton */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <Skeleton className="h-20 w-12" />
          </div>
        </Section>

        {/* Vision Section Skeleton */}
        <Section className="relative overflow-hidden">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-md">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10" />
                  <div className="relative">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
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
                  <div className="relative h-48">
                    <Skeleton className="h-full w-full" />
                  </div>
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
            <div className="mt-16 -mx-4 px-4 flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative overflow-hidden rounded-2xl flex-none w-[280px] sm:w-auto snap-center">
                  <div className="relative h-72">
                    <Skeleton className="h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-6 w-32" />
                      </div>
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
    <main>
      {/* Hero Section */}
      <Section className="relative min-h-[80vh] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
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
            {(banner.schedule || banner.location) && (
              <div className="mt-8 flex flex-wrap gap-4">
                {banner.schedule && (
                  <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white">Horaires: {banner.schedule}</span>
                  </div>
                )}
                {banner.location && (
                  <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white">Lieu: {banner.location}</span>
                  </div>
                )}
              </div>
            )}
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
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="relative">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
                {vision.subtitle}
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                  {vision.title}
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                {vision.description}
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {vision.points.map((item, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10 transition-all group-hover:scale-150" />
                  <div className="relative">
                    <h3 className="mb-4 font-serif text-xl font-bold text-[#4C9296]">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
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
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              {activites.subtitle}
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                {activites.sectionTitle}
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {activites.description}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {activites.activities.map((activity, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48">
                  <Image
                    src={activity.imageUrl}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                    {activity.title}
                  </h3>
                  <p className="mt-3 text-gray-600">
                    {activity.description}
                  </p>
                  {(activity.schedule || activity.location) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activity.schedule && (
                        <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-3 py-1 text-sm text-[#4C9296]">
                          {activity.schedule}
                        </span>
                      )}
                      {activity.location && (
                        <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-3 py-1 text-sm text-[#4C9296]">
                          {activity.location}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Team Section */}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              {team.subtitle}
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                {team.sectionTitle}
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {team.description}
            </p>
          </div>

          <div className="mt-16 -mx-4 px-4 flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {team.members.map((member, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl flex-none w-[280px] sm:w-auto snap-center"
              >
                <div className="relative h-72">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 className="font-serif text-2xl font-bold">
                      {member.name}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-white/90">
                      {member.role}
                    </p>
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