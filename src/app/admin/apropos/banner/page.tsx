'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { toast } from 'sonner'
import { FiSave, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface BannerContent {
  imageUrl: string
  welcome: string
  title: string
  subtitle: string
  description: string
  schedule: string
  location: string
}

export default function AboutBannerPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [currentBanner, setCurrentBanner] = useState<BannerContent>({
    imageUrl: '',
    welcome: '',
    title: '',
    subtitle: '',
    description: '',
    schedule: '',
    location: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchCurrentBanner()
    }
  }, [status, router])

  const fetchCurrentBanner = async () => {
    try {
      const response = await fetch('/api/apropos/banner')
      if (response.ok) {
        const data = await response.json()
        setCurrentBanner(data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch banner')
      }
    } catch (error) {
      console.error('Error fetching banner:', error)
      toast.error('Error fetching current banner')
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    if (selectedImage) {
      formData.append('image', selectedImage)
    } else {
      formData.append('currentImageUrl', currentBanner.imageUrl)
    }

    // Append other banner content
    formData.append('welcome', currentBanner.welcome)
    formData.append('title', currentBanner.title)
    formData.append('subtitle', currentBanner.subtitle)
    formData.append('description', currentBanner.description)
    formData.append('schedule', currentBanner.schedule)
    formData.append('location', currentBanner.location)

    try {
      const response = await fetch('/api/apropos/banner', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload banner')
      }

      const data = await response.json()
      setCurrentBanner(data)
      setSelectedImage(null)
      setPreviewUrl('')
      toast.success('Banner updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update banner')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4C9296]" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">À propos Banner Management</h1>
          <p className="text-gray-600">Gérez le contenu de la bannière pour la section à propos.</p>
        </div>

        <form id="banner-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Banner Content Section */}
          <div className="rounded-xl bg-white p-6 shadow-lg border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 p-4 -mx-6 -mt-6 mb-6 rounded-t-xl">
              <h2 className="text-2xl font-serif font-bold text-[#4C9296]">Contenu du Banner</h2>
            </div>
            <div className="grid gap-6">
              <div>
                <label htmlFor="welcome" className="block text-base font-medium text-[#4C9296] mb-1.5">
                  Message de Bienvenue
                </label>
                <Input
                  id="welcome"
                  value={currentBanner.welcome}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, welcome: e.target.value }))}
                  className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-base font-medium text-[#4C9296] mb-1.5">
                  Titre
                </label>
                <Input
                  id="title"
                  value={currentBanner.title}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, title: e.target.value }))}
                  className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="block text-base font-medium text-[#4C9296] mb-1.5">
                  Sous-titre
                </label>
                <Input
                  id="subtitle"
                  value={currentBanner.subtitle}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-base font-medium text-[#4C9296] mb-1.5">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={currentBanner.description}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl resize-none"
                />
              </div>

              <div>
                <label htmlFor="schedule" className="block text-base font-medium text-[#4C9296] mb-1.5">
                  Horaires
                </label>
                <Input
                  id="schedule"
                  value={currentBanner.schedule}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, schedule: e.target.value }))}
                  className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-base font-medium text-[#4C9296] mb-1.5">
                  Lieu
                </label>
                <Input
                  id="location"
                  value={currentBanner.location}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, location: e.target.value }))}
                  className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="rounded-xl bg-white p-6 shadow-lg border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 p-4 -mx-6 -mt-6 mb-6 rounded-t-xl">
              <h2 className="text-2xl font-serif font-bold text-[#4C9296]">Image du Banner</h2>
            </div>
            
            {/* Current Banner Display */}
            {currentBanner.imageUrl && !previewUrl && (
              <div className="mb-6">
                <h3 className="mb-2 text-base font-medium text-[#4C9296]">Image Actuelle</h3>
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border-2 border-[#4C9296]/10 shadow-md">
                  <Image
                    src={currentBanner.imageUrl}
                    alt="Current banner"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="mb-6">
                <h3 className="mb-2 text-base font-medium text-[#4C9296]">Aperçu</h3>
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border-2 border-[#4C9296]/10 shadow-md">
                  <Image
                    src={previewUrl}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Upload Input */}
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#4C9296]/20 p-6 hover:border-[#4C9296]/40 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className="flex cursor-pointer flex-col items-center"
              >
                <div className="rounded-full bg-[#4C9296]/5 p-4">
                  <svg
                    className="h-6 w-6 text-[#4C9296]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="mt-2 text-base font-medium text-[#4C9296]">
                  Cliquez pour télécharger une image
                </span>
                <span className="mt-1 text-sm text-gray-500">
                  PNG, JPG, GIF jusqu'à 5MB
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all rounded-xl py-6 text-base font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <FiSave className="mr-2 h-5 w-5" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
} 