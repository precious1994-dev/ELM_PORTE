import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FaCalendar, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

export interface EventCardProps {
  title: string
  description: string
  date: Date
  time: string
  location: string
  imageUrl?: string
  onRegister?: () => void
}

export function EventCard({
  title,
  description,
  date,
  time,
  location,
  imageUrl,
  onRegister,
}: EventCardProps) {
  return (
    <div className="group overflow-hidden rounded-lg bg-white shadow-lg transition hover:shadow-xl">
      {imageUrl && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold text-[#4C9296]">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-gray-600">
            <FaCalendar className="mr-2 h-4 w-4 text-[#4C9296]" />
            <span>
              {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaClock className="mr-2 h-4 w-4 text-[#4C9296]" />
            <span>{time}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2 h-4 w-4 text-[#4C9296]" />
            <span>{location}</span>
          </div>
        </div>

        {onRegister && (
          <div className="mt-6">
            <Button
              onClick={onRegister}
              variant="outline"
              className="w-full border-[#4C9296] text-[#4C9296] hover:bg-[#4C9296] hover:text-white"
            >
              S'inscrire
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 