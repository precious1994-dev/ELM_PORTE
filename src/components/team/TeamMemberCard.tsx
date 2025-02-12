import Image from 'next/image'

interface TeamMemberCardProps {
  name: string
  role: string
  image: string
  description: string
}

export function TeamMemberCard({
  name,
  role,
  image,
  description,
}: TeamMemberCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg transition hover:shadow-xl">
      <div className="relative h-64 w-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold text-gray-900">
          {name}
        </h3>
        <p className="mt-1 text-sm font-medium text-primary">
          {role}
        </p>
        <p className="mt-4 text-gray-600">{description}</p>
      </div>
    </div>
  )
} 