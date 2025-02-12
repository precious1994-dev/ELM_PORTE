import { createContext, useContext, useState, ReactNode } from 'react'

interface Sermon {
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

interface PlaylistContextType {
  playlist: Sermon[]
  currentIndex: number
  addToPlaylist: (sermon: Sermon) => void
  removeFromPlaylist: (id: string) => void
  playNext: () => void
  playPrevious: () => void
  clearPlaylist: () => void
  currentSermon: Sermon | null
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined)

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<Sermon[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  const addToPlaylist = (sermon: Sermon) => {
    if (!playlist.some(item => item.id === sermon.id)) {
      setPlaylist(prev => [...prev, sermon])
      if (currentIndex === -1) {
        setCurrentIndex(0)
      }
    }
  }

  const removeFromPlaylist = (id: string) => {
    const index = playlist.findIndex(item => item.id === id)
    if (index !== -1) {
      setPlaylist(prev => prev.filter(item => item.id !== id))
      if (index === currentIndex) {
        if (playlist.length > 1) {
          setCurrentIndex(index === playlist.length - 1 ? index - 1 : index)
        } else {
          setCurrentIndex(-1)
        }
      } else if (index < currentIndex) {
        setCurrentIndex(prev => prev - 1)
      }
    }
  }

  const playNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsPlaying(true)
    }
  }

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsPlaying(true)
    }
  }

  const clearPlaylist = () => {
    setPlaylist([])
    setCurrentIndex(-1)
    setIsPlaying(false)
  }

  const currentSermon = currentIndex >= 0 ? playlist[currentIndex] : null

  return (
    <PlaylistContext.Provider
      value={{
        playlist,
        currentIndex,
        addToPlaylist,
        removeFromPlaylist,
        playNext,
        playPrevious,
        clearPlaylist,
        currentSermon,
        isPlaying,
        setIsPlaying,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylist() {
  const context = useContext(PlaylistContext)
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider')
  }
  return context
} 