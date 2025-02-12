import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
}

interface VisionProps {
  title: string
  subtitle: string
  description: string
  features: Feature[]
}

export function Vision({ title, subtitle, description, features }: VisionProps) {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
      </div>

      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
            {subtitle}
          </span>
          <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
            <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            {description}
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10 transition-all group-hover:scale-150" />
              
              <div className="relative">
                <div className="mb-4 inline-block rounded-2xl bg-[#4C9296]/10 p-3 text-[#4C9296]">
                  {feature.icon}
                </div>
                <h3 className="mb-3 font-serif text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
} 