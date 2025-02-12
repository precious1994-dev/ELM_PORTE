'use client'

import { useEffect, useState } from 'react'
import type { SocialNetwork } from '@/app/api/jeunes/reseaux/route'
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaTiktok
} from 'react-icons/fa'

const platforms = {
  instagram: { icon: FaInstagram, color: 'text-pink-500 hover:text-pink-600' },
  facebook: { icon: FaFacebook, color: 'text-blue-600 hover:text-blue-700' },
  youtube: { icon: FaYoutube, color: 'text-red-600 hover:text-red-700' },
  tiktok: { icon: FaTiktok, color: 'text-black hover:text-gray-800' }
}

export default function SocialLinks() {
  const [socials, setSocials] = useState<SocialNetwork[]>([])

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const response = await fetch('/api/jeunes/reseaux')
        if (!response.ok) {
          throw new Error('Failed to fetch social networks')
        }
        const data = await response.json()
        setSocials(data.filter((social: SocialNetwork) => social.isActive))
      } catch (error) {
        console.error('Error fetching social networks:', error)
      }
    }

    fetchSocials()
  }, [])

  if (socials.length === 0) return null

  return (
    <div className="flex items-center gap-4">
      {socials.map((social) => {
        const platform = platforms[social.platform as keyof typeof platforms]
        if (!platform) return null

        const Icon = platform.icon
        return (
          <a
            key={social._id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors ${platform.color}`}
            aria-label={`Suivez-nous sur ${social.platform}`}
          >
            <Icon className="h-6 w-6" />
          </a>
        )
      })}
    </div>
  )
} 