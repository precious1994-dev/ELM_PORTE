'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'

interface Activity {
  title: string
  description: string
  imageUrl: string
  schedule: string
  location: string
}

interface ActivitiesContent {
  sectionTitle: string
  subtitle: string
  description: string
  activities: Activity[]
}

export default function HommesActivitesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [content, setContent] = useState<ActivitiesContent>({
    sectionTitle: '',
    subtitle: '',
    description: '',
    activities: []
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchActivities()
    }
  }, [status, router])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/hommes/activites', {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        },
        next: { revalidate: 0 }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }

      const data = await response.json()
      setContent(data)
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Failed to fetch activities')
    } finally {
      setIsFetching(false)
    }
  }

  const handleActivityChange = (index: number, field: keyof Activity, value: string) => {
    setContent(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      )
    }))
  }

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploadingIndex(index)
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

      // Update local state
      const updatedContent = {
        ...content,
        activities: content.activities.map((activity, i) => 
          i === index ? { ...activity, imageUrl: url } : activity
        )
      }
      setContent(updatedContent)

      // Immediately update the database
      const updateFormData = new FormData()
      updateFormData.append('content', JSON.stringify(updatedContent))

      const updateResponse = await fetch('/api/hommes/activites', {
        method: 'POST',
        body: updateFormData,
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update activity with new image')
      }

      // Force revalidation
      await Promise.all([
        fetch('/api/revalidate?path=/hommes', { method: 'POST' }),
        fetch('/api/revalidate?path=/admin/hommes/activites', { method: 'POST' })
      ])

      toast.success('Image uploaded successfully')
      router.refresh()
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      // Refresh content in case of error to ensure consistency
      await fetchActivities()
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleAddActivity = () => {
    setContent(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          title: '',
          description: '',
          imageUrl: '',
          schedule: '',
          location: ''
        }
      ]
    }))
  }

  const handleRemoveActivity = (index: number) => {
    setContent(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('content', JSON.stringify(content))

      const response = await fetch('/api/hommes/activites', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update activities')
      }

      toast.success('Activities updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update activities')
    } finally {
      setIsLoading(false)
    }
  }

  // Update the Image component to prevent caching
  const ActivityImage = ({ activity, index }: { activity: Activity; index: number }) => (
    <div className="flex items-start gap-4">
      {activity.imageUrl ? (
        <div className="relative h-32 w-48 overflow-hidden rounded-lg border-2 border-[#4C9296]/10">
          <Image
            src={`${activity.imageUrl}?t=${Date.now()}`}
            alt={activity.title || 'Activity image'}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>
      ) : (
        <div className="flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-[#4C9296]/20 bg-gray-50">
          <Upload className="h-8 w-8 text-[#4C9296]/40" />
        </div>
      )}
      <div className="space-y-2">
        <input
          type="file"
          id={`activity-${index}-image`}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(index, file)
          }}
          className="hidden"
        />
        <label
          htmlFor={`activity-${index}-image`}
          className="inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
        >
          {uploadingIndex === index ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {activity.imageUrl ? 'Change Image' : 'Upload Image'}
            </>
          )}
        </label>
        <p className="text-sm text-gray-500">
          Recommended size: 800x600px
        </p>
      </div>
    </div>
  )

  if (status === 'loading' || isFetching) {
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/hommes"
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Link>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#4C9296] mb-2">Activities Management</h1>
            <p className="text-gray-600">Manage the activities content for the men's ministry section.</p>
          </div>
        </div>
      </div>

      <Card className="border-2 border-[#4C9296]/10 shadow-lg">
        <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
          <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Activities Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Content Section */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="sectionTitle" className="text-sm font-medium text-[#4C9296]">Section Title</Label>
                <Input
                  id="sectionTitle"
                  value={content.sectionTitle}
                  onChange={(e) => setContent(prev => ({ ...prev, sectionTitle: e.target.value }))}
                  placeholder="Enter section title"
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="subtitle" className="text-sm font-medium text-[#4C9296]">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={content.subtitle}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Enter subtitle"
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-[#4C9296]">Description</Label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Enter description"
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Activities Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-t border-[#4C9296]/10 pt-6">
                <Label className="text-lg font-medium text-[#4C9296]">Activities</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddActivity}
                  className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
              </div>
              
              <div className="grid gap-6">
                {content.activities.map((activity, index) => (
                  <Card key={index} className="border-2 border-[#4C9296]/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-6">
                          <div>
                            <Label htmlFor={`activity-${index}-title`} className="text-sm font-medium text-[#4C9296]">Activity Title</Label>
                            <Input
                              id={`activity-${index}-title`}
                              value={activity.title}
                              onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                              placeholder="Enter activity title"
                              className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`activity-${index}-description`} className="text-sm font-medium text-[#4C9296]">Activity Description</Label>
                            <Textarea
                              id={`activity-${index}-description`}
                              value={activity.description}
                              onChange={(e) => handleActivityChange(index, 'description', e.target.value)}
                              rows={3}
                              placeholder="Enter activity description"
                              className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                            />
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor={`activity-${index}-schedule`} className="text-sm font-medium text-[#4C9296]">Schedule</Label>
                              <Input
                                id={`activity-${index}-schedule`}
                                value={activity.schedule}
                                onChange={(e) => handleActivityChange(index, 'schedule', e.target.value)}
                                placeholder="e.g., Every Tuesday at 7 PM"
                                className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`activity-${index}-location`} className="text-sm font-medium text-[#4C9296]">Location</Label>
                              <Input
                                id={`activity-${index}-location`}
                                value={activity.location}
                                onChange={(e) => handleActivityChange(index, 'location', e.target.value)}
                                placeholder="e.g., Main Hall"
                                className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-[#4C9296] mb-1.5 block">Activity Image</Label>
                            <ActivityImage activity={activity} index={index} />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => handleRemoveActivity(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#4C9296] hover:bg-[#3A7276] text-white min-w-[200px] shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 