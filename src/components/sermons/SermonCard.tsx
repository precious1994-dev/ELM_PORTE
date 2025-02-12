'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  FaPlay,
  FaPause,
  FaDownload,
  FaTimes,
  FaShare,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaList,
  FaArrowRight,
} from 'react-icons/fa'
import { MiniPlayer } from './MiniPlayer'
import { usePlaylist } from '@/contexts/PlaylistContext'
import Link from 'next/link'

interface SermonCardProps {
  id: string
  title: string
  speaker: string
  date: string
  description: string
  audioUrl: string
  duration: string
  series: string
  passage: string
}

export function SermonCard({
  id,
  title,
  speaker,
  date,
  description,
  audioUrl,
  duration,
  series,
  passage,
}: SermonCardProps) {
  const [showPlayer, setShowPlayer] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const formattedDate = format(new Date(date), 'dd MMMM yyyy', { locale: fr })
  
  const {
    addToPlaylist,
    currentSermon,
    isPlaying,
    setIsPlaying,
  } = usePlaylist()

  const isCurrentSermon = currentSermon?.id === id

  const handlePlay = () => {
    if (isCurrentSermon) {
      setIsPlaying(true)
    } else {
      addToPlaylist({ id, title, speaker, date, description, audioUrl, duration, series, passage })
      setIsPlaying(true)
    }
  }

  const handleAddToPlaylist = () => {
    addToPlaylist({ id, title, speaker, date, description, audioUrl, duration, series, passage })
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `${title}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const text = `Écoutez "${title}" par ${speaker} - ${description}`

    switch (platform) {
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        )
        break
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        )
        break
      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
          '_blank'
        )
        break
      case 'copy':
        try {
          await navigator.clipboard.writeText(url)
          alert('Lien copié !')
        } catch (err) {
          console.error('Failed to copy:', err)
        }
        break
    }
    setShowShareMenu(false)
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#4C9296]">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {speaker} · {formattedDate} · {duration}
            </p>
            <p className="mt-2 text-gray-600">{description}</p>
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-semibold">Série :</span> {series} ·{' '}
              <span className="font-semibold">Passage :</span> {passage}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <div className="mt-4 flex gap-3">
              <Button 
                size="sm" 
                className="flex-1 rounded-full bg-[#4C9296] text-white transition-all duration-300 hover:bg-[#3A7276]"
                onClick={handlePlay}
              >
                {isCurrentSermon && isPlaying ? (
                  <FaPause className="mr-2 h-4 w-4" />
                ) : (
                  <FaPlay className="mr-2 h-4 w-4" />
                )}
                {isCurrentSermon && isPlaying ? 'Pause' : 'Écouter'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddToPlaylist}>
                <FaList className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <FaDownload className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareMenu(!showShareMenu)}
              >
                <FaShare className="h-4 w-4" />
              </Button>
              {showShareMenu && (
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => handleShare('facebook')}
                  >
                    <FaFacebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => handleShare('twitter')}
                  >
                    <FaTwitter className="h-4 w-4 text-blue-400" />
                    Twitter
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => handleShare('whatsapp')}
                  >
                    <FaWhatsapp className="h-4 w-4 text-green-500" />
                    WhatsApp
                  </button>
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                    onClick={() => handleShare('copy')}
                  >
                    <FaLink className="h-4 w-4 text-gray-500" />
                    Copier le lien
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Player Modal */}
      {showPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-2xl rounded-lg bg-white p-6">
            <button
              onClick={() => setShowPlayer(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            <h3 className="mb-4 font-serif text-xl font-semibold">{title}</h3>
            <div className="mt-4">
              <audio
                controls
                autoPlay={isPlaying}
                className="w-full"
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
              >
                <source src={audioUrl} type="audio/mpeg" />
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>{speaker}</p>
              <p>{formattedDate}</p>
              <p>{passage}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 