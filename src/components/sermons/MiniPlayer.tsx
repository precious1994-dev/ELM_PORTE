'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  FaPlay,
  FaPause,
  FaTimes,
  FaExpand,
  FaStepForward,
  FaStepBackward,
  FaList,
} from 'react-icons/fa'
import { usePlaylist } from '@/contexts/PlaylistContext'
import { PlaylistDrawer } from './PlaylistDrawer'

export function MiniPlayer() {
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const {
    currentSermon,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrevious,
    playlist,
    currentIndex,
  } = usePlaylist()

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSermon) return

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (currentIndex < playlist.length - 1) {
        playNext()
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentSermon, isPlaying, currentIndex, playlist.length, playNext, setIsPlaying])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const newProgress = (clickPosition / progressBar.offsetWidth) * 100
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * duration
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!currentSermon) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-lg">
        <div
          className="relative h-1 cursor-pointer bg-gray-200"
          onClick={handleProgressClick}
        >
          <div
            className="absolute h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => playPrevious()}
                disabled={currentIndex === 0}
              >
                <FaStepBackward className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 rounded-full p-0"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <FaPause className="h-3 w-3" />
                ) : (
                  <FaPlay className="h-3 w-3 pl-0.5" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => playNext()}
                disabled={currentIndex === playlist.length - 1}
              >
                <FaStepForward className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <h4 className="text-sm font-semibold">{currentSermon.title}</h4>
              <p className="text-xs text-gray-600">
                {currentSermon.speaker} ·{' '}
                {format(new Date(currentSermon.date), 'dd MMM yyyy', {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">
              {formatTime(audioRef.current?.currentTime || 0)} /{' '}
              {formatTime(duration)}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-full p-0"
              onClick={() => setShowPlaylist(!showPlaylist)}
            >
              <FaList className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <audio
          ref={audioRef}
          src={currentSermon.audioUrl}
          className="hidden"
        />
      </div>

      <PlaylistDrawer isOpen={showPlaylist} onClose={() => setShowPlaylist(false)} />
    </>
  )
} 