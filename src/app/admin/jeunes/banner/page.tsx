'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import type { BannerContent } from '@/models/youth-banner'

export default function YouthBannerPage() {
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
        const response = await fetch('/api/jeunes/banner')
        if (response.ok) {
          const data = await response.json()
          // Ensure we set all fields from the response
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
    setContent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Don't submit if still loading initial data
    if (isFetching) {
      toast.error('Please wait for the current data to load')
      return
    }

    setIsLoading(true)

    try {
      // Validate required fields
      const requiredFields = ['welcome', 'title', 'subtitle', 'description'] as const
      const missingFields = requiredFields.filter(field => !content[field]?.trim())
      
      // Separate validation for imageUrl since it's handled differently
      if (!content.imageUrl && !selectedImage) {
        toast.error('Please provide a banner image')
        setIsLoading(false)
        return
      }
      
      if (missingFields.length > 0) {
        setIsLoading(false)
        toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`)
        return
      }

      let imageUrl = content.imageUrl

      // Handle image upload if a new image is selected
      if (selectedImage) {
        const formData = new FormData()
        formData.append('file', selectedImage)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          throw new Error(error.error || 'Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      // Send updated content with the new image URL
      const response = await fetch('/api/jeunes/banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...content,
          imageUrl,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update banner')
      }

      const data = await response.json()
      // Update content with the banner data from the response
      setContent(prev => ({
        ...prev,
        ...(data.banner || data),
      }))
      setSelectedImage(null)
      setPreviewUrl('')
      toast.success('Banner updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update banner')
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Youth Banner Management</h1>
          <p className="text-gray-600">Manage the banner content for the youth ministry section.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Banner Image Section */}
          <Card className="border-2 border-[#4C9296]/10 shadow-lg">
            <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
              <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Banner Image</CardTitle>
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
                <Label className="text-base font-medium text-gray-900">Select New Image</Label>
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
                    {content.imageUrl || previewUrl ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Recommended size: 1920x820px. Maximum file size: 5MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Banner Content Section */}
          <Card className="border-2 border-[#4C9296]/10 shadow-lg">
            <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
              <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Banner Content</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6">
                <div>
                  <Label htmlFor="welcome" className="text-base font-medium text-gray-900">Welcome Text</Label>
                  <Input
                    id="welcome"
                    name="welcome"
                    value={content.welcome}
                    onChange={handleContentChange}
                    placeholder="Enter welcome text"
                    className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="text-base font-medium text-gray-900">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={content.title}
                    onChange={handleContentChange}
                    placeholder="Enter main title"
                    className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle" className="text-base font-medium text-gray-900">Subtitle</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={content.subtitle}
                    onChange={handleContentChange}
                    placeholder="Enter subtitle"
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
                    placeholder="Enter description"
                    rows={4}
                    className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="schedule" className="text-base font-medium text-gray-900">Schedule</Label>
                    <Input
                      id="schedule"
                      name="schedule"
                      value={content.schedule}
                      onChange={handleContentChange}
                      placeholder="Enter meeting schedule"
                      className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-base font-medium text-gray-900">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={content.location}
                      onChange={handleContentChange}
                      placeholder="Enter meeting location"
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
                  Updating...
                </>
              ) : (
                'Update Banner'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 