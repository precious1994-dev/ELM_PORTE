import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import Image from 'next/image'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FaTimes, FaCompress, FaExpand, FaChevronDown, FaChevronUp } from 'react-icons/fa'

interface Sermon {
  id: string
  title: string
  speaker: string
  date: string
  passage: string
  description: string
  duration: string
  image: string
  youtubeUrl: string
  pasteurImage?: string
}

interface SermonModalProps {
  sermon: Sermon | null
  isOpen: boolean
  onClose: () => void
}

export function SermonModal({ sermon, isOpen, onClose }: SermonModalProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  if (!sermon) return null

  const getYoutubeVideoId = (url: string): string => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : '';
  };

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
  }

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded)
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="relative aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${getYoutubeVideoId(sermon.youtubeUrl)}?autoplay=1`}
            title={sermon.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute right-0 top-0 flex gap-1 p-2">
            <button
              onClick={handleMaximize}
              className="rounded-full bg-white/90 p-1.5 text-gray-600 shadow-md backdrop-blur-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <FaExpand className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-white/90 p-1.5 text-gray-600 shadow-md backdrop-blur-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <FaTimes className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="border-t border-gray-100 bg-white p-2">
          <h4 className="line-clamp-1 text-sm font-medium text-gray-900">
            {sermon.title}
          </h4>
          <p className="text-xs text-gray-600">
            {sermon.speaker}
          </p>
        </div>
      </div>
    )
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
              <Dialog.Panel className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Control Buttons */}
                <div className="absolute right-4 top-4 z-10 flex gap-2">
                  <button
                    onClick={handleMinimize}
                    className="rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <FaCompress className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>

                {/* YouTube Video */}
                <div className="relative aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(sermon.youtubeUrl)}?autoplay=1`}
                    title={sermon.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <Dialog.Title
                    as="h3"
                    className="font-serif text-2xl font-bold text-gray-900"
                  >
                    {sermon.title}
                  </Dialog.Title>

                  {/* Sermon Details */}
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-[#4C9296]/30">
                      <Image
                        src={sermon.pasteurImage || sermon.image || 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/pastor-default'}
                        alt={sermon.speaker}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <div className="font-medium">{sermon.speaker}</div>
                      <div>·</div>
                      <time dateTime={sermon.date}>
                        {format(parseISO(sermon.date), 'dd MMM yyyy', {
                          locale: fr,
                        })}
                      </time>
                      <div>·</div>
                      <div>{sermon.duration}</div>
                    </div>
                  </div>

                  {/* Bible Passage */}
                  <div className="mt-4 rounded-lg bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                    {sermon.passage}
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <p className={`text-gray-600 ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                      {sermon.description}
                    </p>
                    <button
                      onClick={toggleDescription}
                      className="mt-2 flex items-center gap-2 text-sm font-medium text-[#4C9296] hover:text-[#3A7276] transition-colors"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          Voir moins
                          <FaChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          Voir plus
                          <FaChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
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