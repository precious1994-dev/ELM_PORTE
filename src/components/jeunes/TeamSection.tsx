'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import Image from 'next/image'

interface TeamMember {
  _id: string
  name: string
  role: string
  image: string
  description: string
}

export default function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/jeunes/equipe')
        if (!response.ok) {
          throw new Error('Failed to fetch team members')
        }
        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error('Error fetching team members:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [])

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </Container>
      </Section>
    )
  }

  if (members.length === 0) {
    return null
  }

  return (
    <Section className="relative overflow-hidden bg-white">
      <Container>
        <div className="relative">
          {/* Section Header */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              Notre Équipe
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                L'Équipe des Jeunes
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Une équipe passionnée et dévouée pour accompagner les jeunes dans leur croissance spirituelle.
            </p>
          </div>

          {/* Team Members - Mobile: Horizontal Scroll, Desktop: Grid */}
          <div className="relative -mx-4 md:mx-0">
            <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 pl-4 pr-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:p-0 [&::-webkit-scrollbar]:hidden">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="group relative aspect-[4/5] w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl md:w-full"
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-medium">
                      {member.name}
                    </h3>
                    <span className="mt-2 inline-block rounded-full bg-[#4C9296]/90 px-3 py-1 text-sm backdrop-blur-sm">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
} 