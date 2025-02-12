import { usePlaylist } from '@/contexts/PlaylistContext'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FaTimes, FaTrash, FaPlay } from 'react-icons/fa'
import { useEffect } from 'react'

interface PlaylistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function PlaylistDrawer({ isOpen, onClose }: PlaylistDrawerProps) {
  const {
    playlist,
    currentIndex,
    removeFromPlaylist,
    clearPlaylist,
    currentSermon,
    setIsPlaying,
  } = usePlaylist()

  // Handle cleanup when drawer closes
  useEffect(() => {
    if (!isOpen) {
      // Any cleanup logic if needed when drawer closes
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePlayClick = (index: number) => {
    if (index === currentIndex) {
      setIsPlaying(true)
    } else {
      // TODO: Implement play from index
    }
  }

  return (
    <div className="fixed bottom-16 right-0 top-0 z-30 w-80 border-l border-gray-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h3 className="font-serif text-lg font-semibold">Liste de lecture</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={clearPlaylist}
          >
            <FaTrash className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={onClose}
          >
            <FaTimes className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="h-full overflow-y-auto p-4">
        {playlist.length === 0 ? (
          <p className="text-center text-gray-500">
            Aucun sermon dans la liste de lecture
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {playlist.map((sermon, index) => (
              <div
                key={sermon.id}
                className={`rounded-lg border p-3 ${
                  index === currentIndex
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{sermon.title}</h4>
                    <p className="text-sm text-gray-600">
                      {sermon.speaker} ·{' '}
                      {format(new Date(sermon.date), 'dd MMM yyyy', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => handlePlayClick(index)}
                    >
                      <FaPlay className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => removeFromPlaylist(sermon.id)}
                    >
                      <FaTimes className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 