'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X } from 'lucide-react'
import type { BannerContent } from '@/app/api/adulte/banner/route'

interface ExtendedBannerContent extends BannerContent {
  imagePublicId?: string
}

export default function AdultBannerPage() {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<ExtendedBannerContent>({
    imageUrl: '',
    imagePublicId: '',
    welcome: '',
    title: '',
    subtitle: '',
    description: '',
    schedule: '',
    location: ''
  })

  // Fetch current banner on component mount
  useEffect(() => {
    const fetchCurrentBanner = async () => {
      try {
        const response = await fetch('/api/adulte/banner')
        if (response.ok) {
          const data = await response.json()
          setContent(data)
        }
      } catch (error) {
        console.error('Error fetching current banner:', error)
        toast.error('Failed to fetch current banner')
      } finally {
        setIsFetching(false)
      }
    }

    fetchCurrentBanner()
  }, [])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        event.target.value = '' // Reset input
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        event.target.value = '' // Reset input
        return
      }

      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleContentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setContent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      
      // Add text content
      Object.entries(content).forEach(([key, value]) => {
        if (key !== 'imagePublicId') { // Don't send imagePublicId to API
          formData.append(key, value.toString()) // Ensure value is string
        }
      })

      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage)
      } else if (!content.imageUrl) {
        toast.error('Please select an image')
        setIsLoading(false)
        return
      } else {
        formData.append('currentImageUrl', content.imageUrl)
      }

      const response = await fetch('/api/adulte/banner', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update banner')
      }

      setContent(data)
      setSelectedImage(null)
      setPreviewUrl('')
      toast.success('Banner updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update banner'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Gestion de la Bannière</h1>
          <p className="text-gray-600">Gérez le contenu de la bannière pour la section des adultes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Banner Image Section */}
          <Card className="border-2 border-[#4C9296]/10 shadow-lg">
            <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
              <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Image de la Bannière</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Current Banner Display */}
              {(content.imageUrl || previewUrl) && (
                <div className="space-y-4">
                  <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border-2 border-[#4C9296]/10 shadow-md">
                    <Image
                      src={previewUrl || content.imageUrl}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-base font-medium text-gray-900">Sélectionner une nouvelle image</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="banner-image"
                    className="inline-flex cursor-pointer items-center rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    {content.imageUrl || previewUrl ? 'Changer l\'image' : 'Ajouter une image'}
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Format recommandé : 1920x820px. Taille maximale : 5MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Banner Content Section */}
          <Card className="border-2 border-[#4C9296]/10 shadow-lg">
            <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
              <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Contenu de la Bannière</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="welcome" className="text-base font-medium text-gray-900">Message de Bienvenue</Label>
                  <Input
                    id="welcome"
                    name="welcome"
                    value={content.welcome}
                    onChange={handleContentChange}
                    placeholder="Entrez le message de bienvenue"
                    className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="text-base font-medium text-gray-900">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={content.title}
                    onChange={handleContentChange}
                    placeholder="Entrez le titre principal"
                    className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle" className="text-base font-medium text-gray-900">Sous-titre</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={content.subtitle}
                    onChange={handleContentChange}
                    placeholder="Entrez le sous-titre"
                    className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-base font-medium text-gray-900">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={content.description}
                    onChange={handleContentChange}
                    placeholder="Entrez la description"
                    rows={4}
                    className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="schedule" className="text-base font-medium text-gray-900">Horaire</Label>
                    <Input
                      id="schedule"
                      name="schedule"
                      value={content.schedule}
                      onChange={handleContentChange}
                      placeholder="Entrez l'horaire des rencontres"
                      className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-base font-medium text-gray-900">Lieu</Label>
                    <Input
                      id="location"
                      name="location"
                      value={content.location}
                      onChange={handleContentChange}
                      placeholder="Entrez le lieu des rencontres"
                      className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all rounded-xl px-8 py-6 text-base font-medium min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 