'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, GripVertical, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'
import { Separator } from '@/components/ui/separator'

interface Activity {
  _id?: string
  title: string
  description: string
  image: string
  order?: number
}

export default function YouthActivitiesPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jeunes/activites')
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setActivities(data)
      } else {
        console.error('Invalid data format:', data)
        toast.error('Invalid data format received')
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Error fetching activities')
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = () => {
    setActivities([
      ...activities,
      {
        title: '',
        description: '',
        image: '',
      },
    ])
  }

  const handleRemoveActivity = (index: number) => {
    const newActivities = [...activities]
    newActivities.splice(index, 1)
    setActivities(newActivities)
  }

  const handleActivityChange = (
    index: number,
    field: keyof Activity,
    value: string
  ) => {
    const newActivities = [...activities]
    newActivities[index] = {
      ...newActivities[index],
      [field]: value,
    }
    setActivities(newActivities)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(activities)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setActivities(items)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/jeunes/activites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities }),
      })

      if (!response.ok) {
        throw new Error('Failed to update activities')
      }

      const updatedActivities = await response.json()
      if (Array.isArray(updatedActivities)) {
        setActivities(updatedActivities)
        toast.success('Activities updated successfully')
        router.refresh()
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error updating activities:', error)
      toast.error('Error updating activities')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUploadError = (error: string) => {
    toast.error(error)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#4C9296]" />
          <span className="text-[#4C9296]">Loading activities...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Youth Activities Management</h1>
        <p className="text-gray-600">Manage and organize youth ministry activities.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-2 border-[#4C9296]/10 shadow-lg">
          <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Activities List</CardTitle>
                <CardDescription className="mt-1.5 text-gray-600">
                  Drag and drop to reorder activities. All changes are saved automatically.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddActivity}
                className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="activities">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-6"
                    >
                      {activities.map((activity, index) => (
                        <Draggable
                          key={activity._id || index}
                          draggableId={activity._id || index.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="relative border-2 border-[#4C9296]/10 hover:border-[#4C9296]/30 transition-colors shadow-md hover:shadow-lg"
                            >
                              <div className="absolute right-4 top-4 flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move rounded-md hover:bg-[#4C9296]/10 p-2 transition-colors"
                                >
                                  <GripVertical className="h-5 w-5 text-[#4C9296]" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveActivity(index)}
                                  className="rounded-md hover:bg-red-50 p-2 text-red-500 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                              <CardContent className="p-6">
                                <div className="grid gap-6 lg:grid-cols-2">
                                  <div className="space-y-6">
                                    <div>
                                      <Label htmlFor={`title-${index}`} className="text-base font-medium text-gray-900">
                                        Activity Title
                                      </Label>
                                      <Input
                                        id={`title-${index}`}
                                        value={activity.title}
                                        onChange={(e) =>
                                          handleActivityChange(
                                            index,
                                            'title',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter activity title"
                                        className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                                      />
                                    </div>

                                    <div>
                                      <Label htmlFor={`description-${index}`} className="text-base font-medium text-gray-900">
                                        Description
                                      </Label>
                                      <Textarea
                                        id={`description-${index}`}
                                        value={activity.description}
                                        onChange={(e) =>
                                          handleActivityChange(
                                            index,
                                            'description',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Describe the activity"
                                        rows={4}
                                        className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl resize-none"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-base font-medium text-gray-900">
                                      Activity Image
                                    </Label>
                                    <div className="mt-2">
                                      <ImageUpload
                                        value={activity.image}
                                        onChange={(url) =>
                                          handleActivityChange(index, 'image', url)
                                        }
                                        onUploadError={handleImageUploadError}
                                        className="border-2 border-[#4C9296]/20 hover:border-[#4C9296]/40 rounded-xl"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all rounded-xl px-8 py-6 text-base font-medium min-w-[200px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving Changes...
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
    </div>
  )
} 