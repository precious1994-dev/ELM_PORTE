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

interface BannerContent {
  imageUrl: string
  welcome: string
  title: string
  subtitle: string
  description: string
}

export default function HommesBannerPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [currentBanner, setCurrentBanner] = useState<BannerContent>({
    imageUrl: '',
    welcome: '',
    title: '',
    subtitle: '',
    description: ''
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
      const response = await fetch('/api/hommes/banner')
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

    try {
      const response = await fetch('/api/hommes/banner', {
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
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4C9296] border-t-transparent"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/hommes"
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
            >
              <FiArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#4C9296]">Banner Management</h1>
              <p className="mt-1 text-gray-600">Manage the banner content for the men's ministry section.</p>
            </div>
          </div>
          <Button
            type="submit"
            form="banner-form"
            disabled={isLoading}
            className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>

        <form id="banner-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Banner Content Section */}
          <div className="rounded-lg border-2 border-[#4C9296]/10 bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-serif font-bold text-[#4C9296]">Banner Content</h2>
            <div className="grid gap-6">
              <div>
                <label htmlFor="welcome" className="text-sm font-medium text-[#4C9296]">
                  Welcome Message
                </label>
                <Input
                  id="welcome"
                  value={currentBanner.welcome}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, welcome: e.target.value }))}
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  placeholder="Enter welcome message"
                />
              </div>

              <div>
                <label htmlFor="title" className="text-sm font-medium text-[#4C9296]">
                  Title
                </label>
                <Input
                  id="title"
                  value={currentBanner.title}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="text-sm font-medium text-[#4C9296]">
                  Subtitle
                </label>
                <Input
                  id="subtitle"
                  value={currentBanner.subtitle}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  placeholder="Enter subtitle"
                />
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-medium text-[#4C9296]">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={currentBanner.description}
                  onChange={(e) => setCurrentBanner(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  placeholder="Enter description"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="rounded-lg border-2 border-[#4C9296]/10 bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-serif font-bold text-[#4C9296]">Banner Image</h2>
            
            {/* Current Banner Display */}
            {currentBanner.imageUrl && !previewUrl && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-[#4C9296]">Current Image</h3>
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border-2 border-[#4C9296]/10 shadow-md">
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
                <h3 className="mb-2 text-sm font-medium text-[#4C9296]">Preview</h3>
                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border-2 border-[#4C9296]/10 shadow-md">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Upload Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#4C9296]">
                New Image
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#4C9296]/10 file:text-[#4C9296] hover:file:bg-[#4C9296]/20 file:cursor-pointer"
                />
              </div>
              <p className="text-sm text-gray-500">
                Recommended size: 1920x820px. Maximum file size: 5MB
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 