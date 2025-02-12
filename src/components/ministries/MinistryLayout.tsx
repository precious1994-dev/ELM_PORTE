import Image from 'next/image'
import { Section } from '@/components/ui/section'
import { SectionHeader } from '@/components/ui/section-header'

interface MinistryLayoutProps {
  title: string
  description: string
  image: string
  content: React.ReactNode
  schedule?: Array<{
    day: string
    time: string
    activity: string
  }>
  team?: Array<{
    name: string
    role: string
  }>
}

export function MinistryLayout({
  title,
  description,
  image,
  content,
  schedule,
  team,
}: MinistryLayoutProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif text-4xl font-bold sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 text-xl">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <Section>
        <div className="prose prose-lg mx-auto max-w-3xl">
          {content}
        </div>
      </Section>

      {/* Schedule */}
      {schedule && schedule.length > 0 && (
        <Section background="gray">
          <SectionHeader title="Horaires" centered />
          <div className="mt-8">
            <div className="mx-auto max-w-3xl divide-y divide-gray-200 rounded-lg bg-white shadow-lg">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-6"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.activity}</p>
                    <p className="text-sm text-gray-600">{item.day}</p>
                  </div>
                  <p className="font-medium text-primary">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Team */}
      {team && team.length > 0 && (
        <Section>
          <SectionHeader title="Notre Équipe" centered />
          <div className="mt-8">
            <div className="mx-auto max-w-3xl divide-y divide-gray-200 rounded-lg bg-white shadow-lg">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-6"
                >
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm font-medium text-primary">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}
    </div>
  )
} 