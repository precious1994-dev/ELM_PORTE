'use client'

import { useState, useEffect } from 'react'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

interface Schedule {
  _id: string
  day: string
  time: string
  description: string
}

export function ScheduleSection() {
  const [schedules, setSchedules] = useState<Schedule[]>([])

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch('/api/enfants/schedules')
        if (response.ok) {
          const data = await response.json()
          setSchedules(data)
        }
      } catch (error) {
        console.error('Error fetching schedules:', error)
      }
    }

    fetchSchedules()
  }, [])

  return (
    <Section className="relative overflow-hidden bg-white">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
      </div>

      <Container>
        {/* Section Header */}
        <div className="relative mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
            Découvrez nos activités
          </span>
          <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
            <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
              Nos Horaires
            </span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            Découvrez les horaires de nos activités pour les enfants
          </p>
        </div>

        {/* Schedule Content */}
        <div className="mt-16 space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule._id}
              className="flex items-center justify-between bg-white rounded-lg border border-gray-100 p-6 hover:border-[#4C9296]/20 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {schedule.day}
                </h3>
                <p className="mt-1 text-gray-600">
                  {schedule.description}
                </p>
              </div>
              <div className="ml-4 flex items-center">
                <div className="bg-[#4C9296]/10 rounded-full p-2">
                  <svg
                    className="w-5 h-5 text-[#4C9296]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="ml-2 text-lg font-medium text-gray-900">
                  {schedule.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
} 