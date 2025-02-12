'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2, Upload } from 'lucide-react'
import type { ClassContent } from '@/app/api/enfants/nos-claasse/route'

export default function ChildrenClassesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<ClassContent>({
    title: '',
    subtitle: '',
    description: '',
    classes: []
  })

  // Fetch current classes content on component mount
  useEffect(() => {
    const fetchCurrentClasses = async () => {
      try {
        const response = await fetch('/api/enfants/nos-claasse')
        if (response.ok) {
          const data = await response.json()
          setContent(data)
        }
      } catch (error) {
        console.error('Error fetching current classes:', error)
        toast.error('Failed to fetch current classes')
      } finally {
        setIsFetching(false)
      }
    }

    fetchCurrentClasses()
  }, [])

  const handleContentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setContent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClassChange = (index: number, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      classes: prev.classes.map((cls, i) =>
        i === index ? { ...cls, [field]: value } : cls
      )
    }))
  }

  const handleAddClass = () => {
    setContent(prev => ({
      ...prev,
      classes: [
        ...prev.classes,
        {
          title: '',
          ageRange: '',
          description: '',
          image: '',
          imagePublicId: ''
        }
      ]
    }))
  }

  const handleRemoveClass = (index: number) => {
    setContent(prev => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (index: number, file: File) => {
    try {
      // First, upload the image
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { url, public_id } = await uploadResponse.json()

      // If there was a previous image, delete it
      const previousPublicId = content.classes[index].imagePublicId
      if (previousPublicId) {
        try {
          await fetch('/api/upload', {
            method: 'DELETE',
            body: JSON.stringify({ public_id: previousPublicId }),
            headers: {
              'Content-Type': 'application/json',
            },
          })
        } catch (error) {
          console.error('Failed to delete old image:', error)
        }
      }

      // Update the class with the new image URL and public ID
      handleClassChange(index, 'image', url)
      handleClassChange(index, 'imagePublicId', public_id)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('content', JSON.stringify(content))

      const response = await fetch('/api/enfants/nos-claasse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update classes')
      }

      toast.success('Classes updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update classes')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto max-w-5xl p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#4C9296] mb-2">Classes Section</h1>
        <p className="text-gray-600">Manage the classes content for the children's ministry section.</p>
      </div>

      <Card className="border-2 border-[#4C9296]/10 shadow-lg">
        <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
          <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Main Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Main Content */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-[#4C9296]">Title</Label>
              <Input
                id="title"
                name="title"
                value={content.title}
                onChange={handleContentChange}
                placeholder="Enter title"
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
                placeholder="Enter description"
                rows={4}
                className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Classes */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-t border-[#4C9296]/10 pt-6">
              <Label className="text-lg font-medium text-[#4C9296]">Classes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddClass}
                className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </div>
            <div className="grid gap-6">
              {content.classes.map((cls, index) => (
                <Card key={index} className="border-2 border-[#4C9296]/10 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor={`class-${index}-title`} className="text-sm font-medium text-[#4C9296]">Class Title</Label>
                            <Input
                              id={`class-${index}-title`}
                              value={cls.title}
                              onChange={(e) => handleClassChange(index, 'title', e.target.value)}
                              placeholder="Enter class title"
                              className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`class-${index}-ageRange`} className="text-sm font-medium text-[#4C9296]">Age Range</Label>
                            <Input
                              id={`class-${index}-ageRange`}
                              value={cls.ageRange}
                              onChange={(e) => handleClassChange(index, 'ageRange', e.target.value)}
                              placeholder="e.g., 3-5 ans"
                              className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`class-${index}-description`} className="text-sm font-medium text-[#4C9296]">Class Description</Label>
                          <Textarea
                            id={`class-${index}-description`}
                            value={cls.description}
                            onChange={(e) => handleClassChange(index, 'description', e.target.value)}
                            placeholder="Enter class description"
                            rows={3}
                            className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-[#4C9296] mb-1.5 block">Class Image</Label>
                          <div className="flex items-start gap-4">
                            {cls.image ? (
                              <div className="relative h-32 w-48 overflow-hidden rounded-lg border-2 border-[#4C9296]/10">
                                <Image
                                  src={cls.image}
                                  alt={cls.title || 'Class image'}
                                  fill
                                  className="object-cover"
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
                                id={`class-${index}-image`}
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload(index, file)
                                }}
                                className="hidden"
                              />
                              <label
                                htmlFor={`class-${index}-image`}
                                className="inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                {cls.image ? 'Change Image' : 'Upload Image'}
                              </label>
                              <p className="text-sm text-gray-500">
                                Recommended size: 800x600px
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        onClick={() => handleRemoveClass(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-[#4C9296] hover:bg-[#3A7276] text-white min-w-[200px] shadow-md hover:shadow-lg transition-all"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
} 