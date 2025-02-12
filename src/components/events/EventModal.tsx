import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FaCalendar, FaClock, FaMapMarkerAlt, FaTimes, FaArrowRight } from 'react-icons/fa'
import { Button } from '@/components/ui/button'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  imageUrl: string
  category: string
}

interface Category {
  id: string
  name: string
}

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  categories?: Category[]
}

export function EventModal({ event, isOpen, onClose, categories = [] }: EventModalProps) {
  const router = useRouter()

  if (!event) return null

  const categoryName = categories.find(cat => cat.id === event.category)?.name || 'Catégorie'

  const handleViewDetails = () => {
    router.push(`/evenements/${event.id}`)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <FaTimes className="h-5 w-5" />
                </button>

                {/* Image */}
                <div className="relative h-64 w-full">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Category Badge */}
                  {event.category && (
                    <div className="absolute left-6 top-6">
                      <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[#4C9296] shadow-sm backdrop-blur-sm">
                        {categoryName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <Dialog.Title
                    as="h3"
                    className="font-serif text-2xl font-bold text-gray-900"
                  >
                    {event.title}
                  </Dialog.Title>

                  {/* Event Details */}
                  <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="h-4 w-4 text-[#4C9296]" />
                      <time dateTime={event.date}>
                        {format(parseISO(event.date), 'EEEE d MMMM yyyy', {
                          locale: fr,
                        })}
                      </time>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="h-4 w-4 text-[#4C9296]" />
                      <time>{event.time}</time>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="h-4 w-4 text-[#4C9296]" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="mt-2 whitespace-pre-wrap text-gray-600">
                      {event.description}
                    </p>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-8">
                    <Button
                      onClick={handleViewDetails}
                      className="w-full justify-center gap-2 bg-[#4C9296] hover:bg-[#4C9296]/90"
                    >
                      Voir plus de détails
                      <FaArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 