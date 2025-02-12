'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Upload, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface BannerContent {
  imageUrl: string
  title: string
  subtitle: string
  description: string
}

export default function BaptismBannerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<BannerContent>({
    imageUrl: '',
    title: '',
    subtitle: '',
    description: ''
  })

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch('/api/bapteme/banner')
        if (response.ok) {
          const data = await response.json()
          if (data && Object.keys(data).length > 0) {
            setContent(prev => ({
              ...prev,
              ...data
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching banner:', error)
        toast.error('Erreur lors du chargement de la bannière')
      } finally {
        setIsFetching(false)
      }
    }

    fetchBanner()
  }, [])

  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await uploadResponse.json()
      setContent(prev => ({ ...prev, imageUrl: url }))
      toast.success('Image téléchargée avec succès')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Erreur lors du téléchargement de l\'image')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/bapteme/banner', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (!response.ok) {
        throw new Error('Failed to update banner')
      }

      toast.success('Bannière mise à jour avec succès')
      router.refresh()
    } catch (error) {
      console.error('Error updating banner:', error)
      toast.error('Erreur lors de la mise à jour de la bannière')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4C9296]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 py-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#4C9296]">Bannière du Baptême</h1>
          <p className="mt-2 text-black">
            Personnalisez la bannière de la page baptême.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Section */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <ImageIcon className="h-5 w-5" />
                Image de la Bannière
              </h2>
            </div>
            <CardContent className="p-6">
              {/* Current Banner Display */}
              {content.imageUrl && (
                <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-lg border-2 border-[#4C9296]/10">
                  <Image
                    src={content.imageUrl}
                    alt="Banner"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="banner-image" className="text-[#4C9296]">Sélectionner une nouvelle image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleImageUpload(file)
                      }
                    }}
                    className="hidden"
                  />
                  <Label
                    htmlFor="banner-image"
                    className="flex cursor-pointer items-center gap-2 rounded-md bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296] hover:bg-[#4C9296]/20"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {content.imageUrl ? 'Changer l\'image' : 'Télécharger une image'}
                  </Label>
                </div>
                <p className="text-sm text-gray-500">
                  Taille maximale : 5MB. Formats supportés : JPG, PNG, WebP
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Text Content Section */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                Contenu de la Bannière
              </h2>
            </div>
            <CardContent className="grid gap-6 p-6">
              <div>
                <Label htmlFor="title" className="text-[#4C9296]">Titre</Label>
                <Input
                  id="title"
                  value={content.title}
                  onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1.5 text-black placeholder:text-gray-400"
                  placeholder="Entrez le titre"
                />
              </div>

              <div>
                <Label htmlFor="subtitle" className="text-[#4C9296]">Sous-titre</Label>
                <Input
                  id="subtitle"
                  value={content.subtitle}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="mt-1.5 text-black placeholder:text-gray-400"
                  placeholder="Entrez le sous-titre"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[#4C9296]">Description</Label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1.5 text-black placeholder:text-gray-400"
                  placeholder="Entrez la description"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#4C9296] hover:bg-[#3A7276] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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