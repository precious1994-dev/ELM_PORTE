'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IVisionPoint } from '@/models/FemmesVision'

interface VisionContent {
  subtitle: string
  title: string
  description: string
  points: {
    title: string
    description: string
  }[]
}

export default function FemmesVisionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<VisionContent>({
    subtitle: 'Notre Vision',
    title: 'Notre Mission',
    description: 'Encourager chaque femme à découvrir son identité en Christ et à vivre pleinement son appel.',
    points: [
      {
        title: 'Croissance Spirituelle',
        description: 'Approfondir sa relation avec Dieu à travers la prière et l\'étude de la Parole.'
      },
      {
        title: 'Soutien Mutuel',
        description: 'Créer un environnement bienveillant où chaque femme peut trouver écoute et encouragement.'
      },
      {
        title: 'Développement Personnel',
        description: 'Accompagner chaque femme dans son épanouissement spirituel et personnel.'
      }
    ]
  })

  useEffect(() => {
    const fetchVision = async () => {
      try {
        const response = await fetch('/api/femmes/vision')
        if (response.ok) {
          const data = await response.json()
          if (data && Object.keys(data).length > 0) {
            setContent(prev => ({
              ...prev,
              ...data,
              points: data.points || prev.points
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching vision:', error)
        toast.error('Failed to fetch vision content')
      } finally {
        setIsFetching(false)
      }
    }

    fetchVision()
  }, [])

  const handlePointChange = (index: number, field: keyof IVisionPoint, value: string) => {
    setContent(prev => ({
      ...prev,
      points: prev.points.map((point, i) => 
        i === index ? { ...point, [field]: value } : point
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/femmes/vision', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (!response.ok) {
        throw new Error('Failed to update vision')
      }

      toast.success('Vision updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating vision:', error)
      toast.error('Failed to update vision')
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
        <h1 className="text-3xl font-serif font-bold text-[#4C9296] mb-2">Vision Management</h1>
        <p className="text-gray-600">Manage the vision content for the women's ministry section.</p>
      </div>

      <Card className="border-2 border-[#4C9296]/10 shadow-lg">
        <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
          <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Vision Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Content Section */}
            <div className="space-y-6">
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
                <Label htmlFor="title" className="text-sm font-medium text-[#4C9296]">Title</Label>
                <Input
                  id="title"
                  value={content.title}
                  onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-[#4C9296]">Description</Label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Enter description"
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Vision Points Section */}
            <div className="space-y-6 border-t border-[#4C9296]/10 pt-6">
              <h3 className="text-lg font-medium text-[#4C9296]">Vision Points</h3>
              
              <div className="grid gap-6">
                {content.points.map((point, index) => (
                  <Card key={index} className="border-2 border-[#4C9296]/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor={`point-${index}-title`} className="text-sm font-medium text-[#4C9296]">Point {index + 1} Title</Label>
                          <Input
                            id={`point-${index}-title`}
                            value={point.title}
                            onChange={(e) => handlePointChange(index, 'title', e.target.value)}
                            placeholder="Enter point title"
                            className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`point-${index}-description`} className="text-sm font-medium text-[#4C9296]">Point {index + 1} Description</Label>
                          <Textarea
                            id={`point-${index}-description`}
                            value={point.description}
                            onChange={(e) => handlePointChange(index, 'description', e.target.value)}
                            rows={2}
                            placeholder="Enter point description"
                            className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                  'Update Vision'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 