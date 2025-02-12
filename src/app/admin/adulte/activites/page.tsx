'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface Activity {
  title: string
  description: string
  image: string
  icon: string
}

interface ActivitiesContent {
  title: string
  subtitle: string
  description: string
  activities: Activity[]
}

export default function AdultActivitiesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<ActivitiesContent>({
    title: '',
    subtitle: '',
    description: '',
    activities: []
  })
  const [imageFiles, setImageFiles] = useState<{ [key: number]: File | null }>({})
  const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>({})

  // Fetch current activities content on component mount
  useEffect(() => {
    const fetchCurrentActivities = async () => {
      try {
        const response = await fetch('/api/adulte/activites')
        if (response.ok) {
          const data = await response.json()
          setContent(data)
        }
      } catch (error) {
        console.error('Error fetching current activities:', error)
        toast.error('Failed to fetch current activities')
      } finally {
        setIsFetching(false)
      }
    }

    fetchCurrentActivities()
  }, [])

  // Initialize image previews when content changes
  useEffect(() => {
    const previews: { [key: number]: string } = {}
    content.activities.forEach((activity: Activity, index: number) => {
      if (activity.image) {
        previews[index] = activity.image
      }
    })
    setImagePreviews(previews)
  }, [content.activities])

  const handleContentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setContent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleActivityChange = (index: number, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) =>
        i === index ? { ...activity, [field]: value } : activity
      )
    }))
  }

  const handleImageUpload = (index: number, file: File) => {
    // Update the file state
    setImageFiles(prev => ({
      ...prev,
      [index]: file
    }))

    // Create and set preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreviews(prev => ({
      ...prev,
      [index]: previewUrl
    }))

    // Update the content state with a temporary path
    handleActivityChange(index, 'image', file.name)
  }

  const handleRemoveImage = (index: number) => {
    // Clean up preview URL
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index])
    }

    // Remove image from states
    setImageFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[index]
      return newFiles
    })

    setImagePreviews(prev => {
      const newPreviews = { ...prev }
      delete newPreviews[index]
      return newPreviews
    })

    // Clear image path in content
    handleActivityChange(index, 'image', '')
  }

  const handleAddActivity = () => {
    setContent(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        { title: '', description: '', image: '', icon: '' }
      ]
    }))
  }

  const handleRemoveActivity = (index: number) => {
    // Clean up image preview if exists
    handleRemoveImage(index)

    setContent(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, upload all images and get their URLs
      const uploadPromises = Object.entries(imageFiles).map(async ([index, file]) => {
        if (!file) return null

        const formData = new FormData()
        formData.append('file', file)

        try {
          console.log(`Uploading image for activity ${index}...`)
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text()
            console.error(`Upload failed for activity ${index}:`, errorText)
            throw new Error(`Failed to upload image for activity ${parseInt(index) + 1}: ${errorText || uploadResponse.statusText}`)
          }

          let uploadData
          try {
            const responseText = await uploadResponse.text()
            if (!responseText) {
              throw new Error('Empty response')
            }
            uploadData = JSON.parse(responseText)
            console.log(`Upload response for activity ${index}:`, uploadData)
          } catch (parseError) {
            console.error(`Error parsing upload response for activity ${index}:`, parseError)
            throw new Error(`Invalid response format for activity ${parseInt(index) + 1}`)
          }

          if (!uploadData?.url) {
            throw new Error(`No URL in response for activity ${parseInt(index) + 1}`)
          }

          return { index: parseInt(index), url: uploadData.url }
        } catch (uploadError) {
          console.error(`Error uploading image ${index}:`, uploadError)
          throw uploadError
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      console.log('All upload results:', uploadResults)

      // Update content with new image URLs
      const updatedContent = {
        ...content,
        activities: content.activities.map((activity, index) => {
          const uploadResult = uploadResults.find(result => result?.index === index)
          return {
            ...activity,
            image: uploadResult?.url || activity.image
          }
        })
      }

      console.log('Sending updated content to API:', updatedContent)

      // Save updated content
      const saveResponse = await fetch('/api/adulte/activites', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContent),
      })

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text()
        console.error('Save response error:', errorText)
        throw new Error(`Failed to update activities: ${errorText || saveResponse.statusText}`)
      }

      let saveData
      try {
        const responseText = await saveResponse.text()
        if (!responseText) {
          throw new Error('Empty response')
        }
        saveData = JSON.parse(responseText)
        console.log('Save response data:', saveData)
      } catch (parseError) {
        console.error('Error parsing save response:', parseError)
        throw new Error('Invalid response format from server')
      }

      toast.success('Activities updated successfully')
      
      // Update local state with the saved data
      if (saveData) {
        setContent(saveData)
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update activities')
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
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Gestion des Activités</h1>
          <p className="text-gray-600">Gérez le contenu des activités pour la section des adultes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-2 border-[#4C9296]/10 shadow-lg">
            <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
              <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Contenu Principal</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-base font-medium text-gray-900">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={content.title}
                    onChange={handleContentChange}
                    placeholder="Entrez le titre"
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
              </div>
            </CardContent>
          </Card>

          {/* Activities */}
          <Card className="border-2 border-[#4C9296]/10 shadow-lg">
            <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Activités</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddActivity}
                  className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une activité
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6">
                {content.activities.map((activity, index) => (
                  <Card key={index} className="border-2 border-[#4C9296]/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-6">
                          <div>
                            <Label htmlFor={`activity-${index}-title`} className="text-base font-medium text-gray-900">Titre de l'Activité</Label>
                            <Input
                              id={`activity-${index}-title`}
                              value={activity.title}
                              onChange={(e) => handleActivityChange(index, 'title', e.target.value)}
                              placeholder="Entrez le titre de l'activité"
                              className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`activity-${index}-description`} className="text-base font-medium text-gray-900">Description de l'Activité</Label>
                            <Textarea
                              id={`activity-${index}-description`}
                              value={activity.description}
                              onChange={(e) => handleActivityChange(index, 'description', e.target.value)}
                              placeholder="Entrez la description de l'activité"
                              rows={3}
                              className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl resize-none"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`activity-${index}-image`} className="text-base font-medium text-gray-900">Image de l'Activité</Label>
                            <div className="mt-2 space-y-2">
                              {imagePreviews[index] ? (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-[#4C9296]/10">
                                  <Image
                                    src={imagePreviews[index]}
                                    alt={`Preview for ${activity.title || 'activity'}`}
                                    fill
                                    className="object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 text-gray-700 rounded-xl"
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="relative">
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
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-48 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-[#4C9296]/20 rounded-xl hover:bg-[#4C9296]/5 transition-colors"
                                    onClick={() => document.getElementById(`activity-${index}-image`)?.click()}
                                  >
                                    <Upload className="h-8 w-8 text-[#4C9296]" />
                                    <span className="text-sm text-gray-600">Cliquez pour télécharger une image</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`activity-${index}-icon`} className="text-base font-medium text-gray-900">Icône de l'Activité</Label>
                            <Input
                              id={`activity-${index}-icon`}
                              value={activity.icon}
                              onChange={(e) => handleActivityChange(index, 'icon', e.target.value)}
                              placeholder="Entrez le nom de l'icône (ex: book, pray, serve)"
                              className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"
                          onClick={() => handleRemoveActivity(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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