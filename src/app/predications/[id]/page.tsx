'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { FaArrowLeft, FaPlay, FaPause, FaShare, FaDownload, FaCalendar, FaClock, FaBook, FaUser, FaArrowRight } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

interface Sermon {
  _id: string
  title: string
  description: string
  speaker: string
  date: string
  passage: string
  duration: string
  series?: string
  audioUrl?: string
  imageUrl?: string
  youtubeUrl?: string
  image: string
  pasteurImage?: string
}

export default function SermonDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [relatedSermons, setRelatedSermons] = useState<Sermon[]>([])
  const [speakerSermons, setSpeakerSermons] = useState<Sermon[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    const fetchSermon = async () => {
      try {
        const response = await fetch(`/api/sermons/${id}`)
        if (!response.ok) throw new Error('Sermon not found')
        const data = await response.json()
        setSermon(data)

        // Fetch related sermons (same series)
        if (data.series) {
          const relatedResponse = await fetch(`/api/sermons?series=${data.series}`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            // Check if the response has the sermons property (paginated response)
            const relatedSermons = relatedData.sermons || relatedData;
            if (Array.isArray(relatedSermons)) {
              setRelatedSermons(
                relatedSermons
                  .filter((sermon): sermon is Sermon => {
                    if (!sermon || typeof sermon !== 'object') return false;
                    return '_id' in sermon && sermon._id !== id;
                  })
                  .slice(0, 3)
              );
            } else {
              console.warn('Related sermons data is not an array:', relatedSermons);
              setRelatedSermons([]);
            }
          }
        }

        // Fetch more sermons from the same speaker
        const speakerResponse = await fetch(`/api/sermons?speaker=${data.speaker}`);
        if (speakerResponse.ok) {
          const speakerData = await speakerResponse.json();
          // Check if the response has the sermons property (paginated response)
          const speakerSermons = speakerData.sermons || speakerData;
          if (Array.isArray(speakerSermons)) {
            setSpeakerSermons(
              speakerSermons
                .filter((sermon): sermon is Sermon => {
                  if (!sermon || typeof sermon !== 'object') return false;
                  return '_id' in sermon && sermon._id !== id;
                })
                .slice(0, 3)
            );
          } else {
            console.warn('Speaker sermons data is not an array:', speakerSermons);
            setSpeakerSermons([]);
          }
        }
      } catch (error) {
        console.error('Error fetching sermon:', error)
        router.push('/predications')
      }
    }

    fetchSermon()
  }, [id, router])

  useEffect(() => {
    if (sermon?.audioUrl) {
      const audioElement = new Audio(sermon.audioUrl)
      setAudio(audioElement)
      return () => {
        audioElement.pause()
        audioElement.src = ''
      }
    }
  }, [sermon?.audioUrl])

  const handlePlayPause = () => {
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    console.log('Original URL:', url);
    
    // Handle YouTube URLs
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      const embedUrl = `https://www.youtube.com/embed/${match[1]}`;
      console.log('Embed URL:', embedUrl);
      return embedUrl;
    }
    
    console.log('No match found, returning original URL');
    return url;
  };

  if (!sermon) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4C9296] border-t-transparent" />
      </div>
    )
  }

  const SermonCard = ({ sermon }: { sermon: Sermon }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {sermon.imageUrl && (
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={sermon.imageUrl}
            alt={sermon.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 transition-opacity group-hover:opacity-70" />
          
          {/* Metadata overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 text-sm text-white/90 backdrop-blur-sm">
                  <FaCalendar className="h-3.5 w-3.5" />
                  <span>{format(parseISO(sermon.date), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-1 text-sm text-white/90 backdrop-blur-sm">
                  <FaClock className="h-3.5 w-3.5" />
                  <span>{sermon.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative space-y-4 p-6">
        {/* Series tag if exists */}
        {sermon.series && (
          <div className="inline-flex items-center rounded-full bg-[#4C9296]/5 px-3 py-1 text-xs font-medium text-[#4C9296]">
            {sermon.series}
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-bold text-[#4C9296] decoration-[#4C9296] decoration-2 group-hover:text-[#3A6D70] group-hover:underline group-hover:underline-offset-4 line-clamp-2">
            {sermon.title}
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaUser className="h-3.5 w-3.5 text-[#4C9296]/70" />
              <span>{sermon.speaker}</span>
            </div>
            {sermon.passage && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaBook className="h-3.5 w-3.5 text-[#4C9296]/70" />
                <span>{sermon.passage}</span>
              </div>
            )}
          </div>
        </div>

        <Link
          href={`/predications/${sermon._id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4C9296] transition-colors hover:text-[#3A6D70]"
        >
          <span>Voir le message</span>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4C9296]/5 group-hover:bg-[#4C9296]/10">
            <FaArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[400px] w-full overflow-hidden lg:h-[60vh]">
        {sermon?.image && (
          <>
            <Image
              src={sermon.image}
              alt={sermon.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#4C9296]/90 via-[#4C9296]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -left-12 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
              <div className="absolute -right-12 top-1/2 h-64 w-64 rounded-full bg-white blur-3xl" />
            </div>
          </>
        )}
        <Container className="relative h-full">
          <Button
            variant="ghost"
            className="absolute top-24 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            onClick={() => router.back()}
          >
            <FaArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="flex h-full items-end pb-12">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
                <span>{sermon && format(parseISO(sermon.date), 'dd MMMM yyyy', { locale: fr })}</span>
                <span>•</span>
                <span>{sermon?.duration}</span>
                {sermon?.series && (
                  <>
                    <span>•</span>
                    <span>{sermon.series}</span>
                  </>
                )}
              </div>
              <h1 className="mt-4 font-serif text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                {sermon?.title}
              </h1>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-[#4C9296]/30">
                    <Image
                      src={sermon?.pasteurImage || sermon?.image || 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/pastor-default'}
                      alt={sermon?.speaker || 'Pasteur'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="font-medium text-white">{sermon?.speaker}</h2>
                    <p className="text-sm text-white/80">Pasteur</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Sticky Audio Player */}
      {sermon.audioUrl && (
        <div className="sticky top-0 z-50 bg-white shadow-md">
          <Container>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="default"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4C9296] text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#3A6D70] hover:shadow-xl"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <FaPause className="h-5 w-5" />
                  ) : (
                    <FaPlay className="h-5 w-5 pl-0.5" />
                  )}
                </Button>
                <div className="flex flex-col">
                  <span className="font-medium text-[#4C9296]">En cours de lecture</span>
                  <span className="text-sm text-gray-500">{sermon.title}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#4C9296]"
                >
                  <FaShare className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#4C9296]"
                >
                  <FaDownload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Main Content */}
      <Container className="py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#4C9296]">À propos de ce message</h2>
              <p className="mt-6 whitespace-pre-wrap text-gray-600 leading-relaxed">
                {sermon.description}
              </p>
            </div>

            {/* Video Section */}
            {sermon.youtubeUrl && (
              <div className="mt-8 overflow-hidden rounded-2xl bg-white p-8 shadow-sm">
                <h2 className="mb-6 font-serif text-2xl font-bold text-[#4C9296]">Regarder la vidéo</h2>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                  <iframe
                    src={getEmbedUrl(sermon.youtubeUrl)}
                    title={sermon.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Metadata Card */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#4C9296]">Informations</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaUser className="h-5 w-5 text-[#4C9296]" />
                  <span>{sermon.speaker}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FaCalendar className="h-5 w-5 text-[#4C9296]" />
                  <span>{format(parseISO(sermon.date), 'dd MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FaClock className="h-5 w-5 text-[#4C9296]" />
                  <span>{sermon.duration}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FaBook className="h-5 w-5 text-[#4C9296]" />
                  <span>{sermon.passage}</span>
                </div>
              </div>
            </div>

            {/* Scripture Card */}
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#4C9296]">Passage biblique</h3>
              <div className="mt-4">
                <a
                  href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.passage)}&version=LSG`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl bg-gray-50 p-6 transition-colors hover:bg-[#4C9296]/5"
                >
                  <span className="block font-medium text-[#4C9296] group-hover:text-[#3A6D70]">
                    {sermon.passage}
                  </span>
                  <span className="mt-2 block text-sm text-gray-600">
                    Lire le passage sur Bible Gateway →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Sections */}
        <div className="mt-16 space-y-16">
          {/* Related Sermons (Same Series) */}
          {relatedSermons.length > 0 && (
            <section>
              <div className="mb-8 text-center">
                <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296] ring-1 ring-[#4C9296]/20">
                  Dans la même série
                </span>
                <h2 className="mt-4 font-serif text-3xl font-bold text-[#4C9296]">
                  Plus de messages de la série {sermon.series}
                </h2>
                <p className="mt-4 text-gray-600">
                  Découvrez d'autres messages de cette série pour approfondir votre compréhension
                </p>
              </div>

              {/* Mobile Scroll Indicator */}
              <div className="relative">
                <div className="absolute -top-10 right-0 flex items-center gap-2 sm:hidden">
                  <span className="text-sm text-gray-500">Faire défiler</span>
                  <svg className="h-5 w-5 text-gray-400 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Cards Container with Horizontal Scroll */}
                <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-8 pt-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:pb-0 sm:pt-0 sm:px-0 lg:grid-cols-3 lg:gap-10 hide-scrollbar">
                  {relatedSermons.map((relatedSermon) => (
                    <div key={relatedSermon._id} className="w-[300px] flex-shrink-0 sm:w-auto">
                      <SermonCard sermon={relatedSermon} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* More from Speaker */}
          {speakerSermons.length > 0 && (
            <section>
              <div className="mb-8 text-center">
                <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296] ring-1 ring-[#4C9296]/20">
                  Même prédicateur
                </span>
                <h2 className="mt-4 font-serif text-3xl font-bold text-[#4C9296]">
                  Plus de messages de {sermon.speaker}
                </h2>
                <p className="mt-4 text-gray-600">
                  Écoutez d'autres messages apportés par ce prédicateur
                </p>
              </div>

              {/* Mobile Scroll Indicator */}
              <div className="relative">
                <div className="absolute -top-10 right-0 flex items-center gap-2 sm:hidden">
                  <span className="text-sm text-gray-500">Faire défiler</span>
                  <svg className="h-5 w-5 text-gray-400 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* Cards Container with Horizontal Scroll */}
                <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-8 pt-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:pb-0 sm:pt-0 sm:px-0 lg:grid-cols-3 lg:gap-10 hide-scrollbar">
                  {speakerSermons.map((speakerSermon) => (
                    <div key={speakerSermon._id} className="w-[300px] flex-shrink-0 sm:w-auto">
                      <SermonCard sermon={speakerSermon} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  )
} 