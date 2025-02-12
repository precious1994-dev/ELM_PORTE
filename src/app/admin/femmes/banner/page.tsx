'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

interface BannerContent {
  imageUrl: string
  welcome: string
  title: string
  subtitle: string
  description: string
  schedule: string
  location: string
}

export default function FemmesBannerPage() {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<BannerContent>({
    imageUrl: '',
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
        const response = await fetch('/api/femmes/banner')
        if (response.ok) {
          const data = await response.json()
          setContent(prev => ({
            ...prev,
            ...data,
            imageUrl: data.imageUrl || prev.imageUrl,
            welcome: data.welcome || prev.welcome,
            title: data.title || prev.title,
            subtitle: data.subtitle || prev.subtitle,
            description: data.description || prev.description,
            schedule: data.schedule || prev.schedule,
            location: data.location || prev.location,
          }))
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
    setContent(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = content.imageUrl

      // Upload new image if selected
      if (selectedImage) {
        const formData = new FormData()
        formData.append('file', selectedImage)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      // Update banner content
      const response = await fetch('/api/femmes/banner', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...content,
          imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update banner')
      }

      toast.success('Banner updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating banner:', error)
      toast.error('Failed to update banner')
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#4C9296] mb-2">Banner Management</h1>
        <p className="text-gray-600">Manage the banner content for the women's ministry section.</p>
      </div>

      <Card className="border-2 border-[#4C9296]/10 shadow-lg">
        <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
          <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Banner Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#4C9296]">Banner Image</h3>
              </div>
              
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
                <Label htmlFor="banner-image" className="text-sm font-medium text-[#4C9296]">Select New Image</Label>
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
                    className="inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {content.imageUrl || previewUrl ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Recommended size: 1920x820px. Maximum file size: 5MB. Supported formats: JPG, PNG, WebP
                </p>
              </div>
            </div>

            {/* Text Content Section */}
            <div className="space-y-6 border-t border-[#4C9296]/10 pt-6">
              <h3 className="text-lg font-medium text-[#4C9296]">Banner Content</h3>
              
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="welcome" className="text-sm font-medium text-[#4C9296]">Welcome Text</Label>
                  <Input
                    id="welcome"
                    name="welcome"
                    value={content.welcome}
                    onChange={handleContentChange}
                    placeholder="Enter welcome text"
                    className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-[#4C9296]">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={content.title}
                    onChange={handleContentChange}
                    placeholder="Enter main title"
                    className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle" className="text-sm font-medium text-[#4C9296]">Subtitle</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={content.subtitle}
                    onChange={handleContentChange}
                    placeholder="Enter subtitle"
                    className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-[#4C9296]">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={content.description}
                    onChange={handleContentChange}
                    placeholder="Enter banner description"
                    rows={3}
                    className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="schedule" className="text-sm font-medium text-[#4C9296]">Schedule</Label>
                    <Input
                      id="schedule"
                      name="schedule"
                      value={content.schedule}
                      onChange={handleContentChange}
                      placeholder="Enter meeting schedule"
                      className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-[#4C9296]">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={content.location}
                      onChange={handleContentChange}
                      placeholder="Enter meeting location"
                      className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Banner'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 