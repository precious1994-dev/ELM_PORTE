'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FaCalendar } from 'react-icons/fa'
import { Container } from '@/components/ui/container'

interface BannerData {
  imageUrl: string
}

export function EventsBanner() {
  const [bannerData, setBannerData] = useState<BannerData>({
    imageUrl: 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/events-default'
  })

  useEffect(() => {
    // Initial fetch
    fetchBanner()

    // Set up polling
    const interval = setInterval(fetchBanner, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchBanner = async () => {
    try {
      const response = await fetch('/api/events/banner')
      if (!response.ok) {
        throw new Error('Failed to fetch banner')
      }
      const data = await response.json()
      if (data?.imageUrl) {
        setBannerData(data)
      }
    } catch (error) {
      console.error('Error fetching banner:', error)
    }
  }

  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 w-full">
        <Image
          src={bannerData?.imageUrl || 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/events-default'}
          alt="Événements"
          fill
          className="object-cover"
          priority
          sizes="100vw"
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
      <div className="relative flex min-h-[80vh] items-center justify-center">
        <Container>
          <div className="mx-auto max-w-4xl text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <FaCalendar className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Événements</span>
            </div>
            <h1 className="mt-6 font-serif text-5xl font-bold text-white sm:text-6xl md:text-7xl">
              Rejoignez Nos{' '}
              <span className="text-primary-200">Événements</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
              Découvrez nos prochains événements et participez à la vie de notre communauté. Des moments de partage, de prière et de croissance spirituelle vous attendent.
            </p>
          </div>
        </Container>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-white/70">Découvrir Plus</span>
          <div className="h-12 w-6 rounded-full border-2 border-white/30 p-1">
            <div className="h-2 w-full animate-bounce rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  )
} 