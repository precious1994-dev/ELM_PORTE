'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import type { BannerContent } from '@/app/api/adulte/banner/route'
import type { VisionContent } from '@/app/api/adulte/vision/route'
import type { ActivitiesContent } from '@/app/api/adulte/activites/route'
import type { TeamContent } from '@/app/api/adulte/equipe/route'

const CLOUD_NAME = 'dzxhxv2sd'
const DEFAULT_AVATAR = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1710935040/team-members/default-avatar.jpg`

export default function AdultsMinistryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [bannerContent, setBannerContent] = useState<BannerContent | null>(null)
  const [visionContent, setVisionContent] = useState<VisionContent | null>(null)
  const [activitiesContent, setActivitiesContent] = useState<ActivitiesContent | null>(null)
  const [teamContent, setTeamContent] = useState<TeamContent | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch banner content
        const bannerResponse = await fetch('/api/adulte/banner')
        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json()
          setBannerContent(bannerData)
        }

        // Fetch vision content
        const visionResponse = await fetch('/api/adulte/vision')
        if (visionResponse.ok) {
          const visionData = await visionResponse.json()
          setVisionContent(visionData)
        }

        // Fetch activities content
        const activitiesResponse = await fetch('/api/adulte/activites')
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setActivitiesContent(activitiesData)
        }

        // Fetch team content
        const teamResponse = await fetch('/api/adulte/equipe', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeamContent(teamData)
        }
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [])

  const getValidImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl || imageUrl.trim() === '') {
      return DEFAULT_AVATAR
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl
    }
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1710935040/team-members/${imageUrl}`
  }

  if (isLoading || !bannerContent || !visionContent || !activitiesContent || !teamContent) {
    return (
      <main>
        {/* Banner Section Skeleton */}
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

        {/* Activities Section Skeleton */}
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
    <main>
      {/* Hero Section */}
      <Section className="relative min-h-[80vh] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={bannerContent.imageUrl || '/images/adults-ministry.jpg'}
            alt="Ministère des Adultes"
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
              {bannerContent.welcome}
            </span>
            <h1 className="mt-6 font-serif text-5xl font-bold text-white sm:text-6xl md:text-7xl">
              {bannerContent.title}{' '}
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
                {visionContent?.subtitle}
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                  {visionContent?.title}
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                {visionContent?.description}
              </p>
            </div>

            {/* Vision Cards */}
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visionContent?.cards?.map((card, index) => (
                <div key={index} className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10 transition-all group-hover:scale-150" />
                  <div className="relative">
                    <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-gray-600">
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
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              {activitiesContent?.subtitle}
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                {activitiesContent?.title}
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              {activitiesContent?.description}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {activitiesContent?.activities?.map((activity, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48">
                  <Image
                    src={activity.image}
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
              Leadership
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                Notre Équipe
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Une équipe dévouée au service et à l'accompagnement spirituel des adultes.
            </p>
          </div>

          <div className="relative mt-20">
            {/* Mobile Scroll Indicator */}
            {teamContent?.members?.length > 0 && (
              <div className="absolute -top-12 right-0 flex items-center gap-2 sm:hidden">
                <span className="text-sm text-gray-500">Faire défiler</span>
                <svg className="h-5 w-5 text-gray-400 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            )}

            {/* Cards Container */}
            <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-8 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:pb-0 sm:px-0 lg:grid-cols-3 lg:gap-10 hide-scrollbar">
              {teamContent?.members?.map((member, index) => {
                const imageUrl = getValidImageUrl(member?.image)
                return (
                  <div
                    key={index}
                    className="group relative aspect-[4/5] overflow-hidden rounded-2xl flex-shrink-0 w-[260px] sm:w-auto sm:flex-shrink-1"
                  >
                    <Image
                      src={imageUrl}
                      alt={member?.name}
                      width={400}
                      height={500}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = DEFAULT_AVATAR
                      }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 3}
                    />
                    {/* Permanent Overlay with Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-left transform transition-transform duration-300 group-hover:translate-y-0">
                        <h3 className="font-serif text-2xl font-bold text-white">
                          {member?.name}
                        </h3>
                        <p className="mt-3">
                          <span className="text-[#4C9296] bg-white/90 px-4 py-1.5 rounded-full text-sm font-medium">
                            {member?.role}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <style jsx global>{`
            .hide-scrollbar {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            @media (min-width: 640px) {
              .hide-scrollbar {
                overflow: visible;
              }
            }
            @keyframes bounce-x {
              0%, 100% {
                transform: translateX(-25%);
                animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
              }
              50% {
                transform: translateX(0);
                animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
              }
            }
            .animate-bounce-x {
              animation: bounce-x 1s infinite;
            }
          `}</style>
        </Container>
      </Section>
    </main>
  )
} 