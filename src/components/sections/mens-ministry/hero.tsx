import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

interface HeroProps {
  imageUrl: string
  welcome: string
  title: string
  subtitle: string
  description: string
}

export function Hero({
  imageUrl,
  welcome,
  title,
  subtitle,
  description
}: HeroProps) {
  return (
    <Section className="relative min-h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl || '/images/mens-ministry-hero.jpg'}
          alt="Men's Ministry"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <Container className="relative">
        <div className="flex min-h-[80vh] items-center">
          <div className="max-w-2xl text-white">
            <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              {welcome}
            </span>
            
            <h1 className="mt-6 font-serif text-5xl font-bold leading-tight sm:text-6xl">
              {title}
            </h1>
            
            <p className="mt-6 text-xl text-white/90">
              {subtitle}
            </p>
            
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              {description}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
} 