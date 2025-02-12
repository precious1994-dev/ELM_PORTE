'use client'

import { PlaylistProvider } from '@/contexts/PlaylistContext'
import { MiniPlayer } from '@/components/sermons/MiniPlayer'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlaylistProvider>
      {children}
      <MiniPlayer />
    </PlaylistProvider>
  )
} 