import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface MinistryCardProps {
  title: string
  description: string
  image: string
  href: string
  icon?: React.ReactNode
}

export function MinistryCard({
  title,
  description,
  image,
  href,
  icon,
}: MinistryCardProps) {
  const router = useRouter()

  return (
    <div className="group overflow-hidden rounded-lg bg-white shadow-lg transition hover:shadow-xl">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40" />
        {icon && (
          <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
            {icon}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold text-[#4C9296]">
          {title}
        </h3>
        <p className="mt-2 text-gray-600">{description}</p>
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(href)}
          >
            En Savoir Plus
          </Button>
        </div>
      </div>
    </div>
  )
} 