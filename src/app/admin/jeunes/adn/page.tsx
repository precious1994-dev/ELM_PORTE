'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2, Users, Zap } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AdnContent } from '@/models/youthADN'
import { useSession } from 'next-auth/react'

export default function YouthAdnPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const mounted = useRef(false)
  const [content, setContent] = useState<AdnContent>({
    mainTitle: '',
    subtitle: '',
    description: '',
    cards: [],
  })

  useEffect(() => {
    mounted.current = true
    const fetchContent = async () => {
      try {
        console.log('Fetching ADN content...')
        const response = await fetch('/api/jeunes/adn')
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Server error response:', errorData)
          throw new Error(errorData.details || 'Failed to fetch content')
        }
        
        const data = await response.json()
        console.log('Received data:', data)
        
        if (mounted.current) {
          setContent(data)
        }
      } catch (error) {
        console.error('Detailed error fetching ADN content:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        if (mounted.current) {
          toast.error(error instanceof Error ? error.message : 'Failed to fetch content')
        }
      }
    }

    fetchContent()

    return () => {
      mounted.current = false
    }
  }, [])

  const handleContentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (isLoading) return
    const { name, value } = e.target
    setContent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCardChange = (index: number, field: string, value: string) => {
    if (isLoading) return
    setContent(prev => ({
      ...prev,
      cards: prev.cards.map((card, i) => 
        i === index ? { ...card, [field]: value } : card
      )
    }))
  }

  const addCard = () => {
    if (isLoading) return
    setContent(prev => ({
      ...prev,
      cards: [
        ...prev.cards,
        {
          icon: 'Plus',
          title: '',
          description: ''
        }
      ]
    }))
  }

  const removeCard = (index: number) => {
    if (isLoading) return
    setContent(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (status !== 'authenticated') {
      toast.error('You must be logged in to update content')
      return
    }

    if (isLoading) return

    // Validate content before sending
    if (!content.mainTitle?.trim() || !content.subtitle?.trim() || !content.description?.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!content.cards.length) {
      toast.error('Please add at least one card')
      return
    }

    for (const card of content.cards) {
      if (!card.title?.trim() || !card.description?.trim()) {
        toast.error('Please fill in all card fields')
        return
      }
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/jeunes/adn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again')
          router.push('/admin/login')
          return
        }
        throw new Error(data.message || 'Failed to update content')
      }

      if (mounted.current) {
        const { _id, ...contentWithoutId } = data
        setContent(contentWithoutId)
        toast.success('Content updated successfully')
        router.refresh()
      }
    } catch (error) {
      console.error('Update error:', error)
      if (mounted.current) {
        toast.error(error instanceof Error ? error.message : 'Failed to update content')
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Youth DNA Management</h1>
          <p className="text-gray-600">Manage the DNA content for the youth ministry section.</p>
        </div>

        <Card className="border-2 border-[#4C9296]/10 shadow-lg">
          <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
            <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">DNA Content</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Main Content Section */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="mainTitle" className="text-base font-medium text-gray-900">Main Title</Label>
                  <Input
                    id="mainTitle"
                    name="mainTitle"
                    value={content.mainTitle}
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
              </div>

              {/* Vision Cards Section */}
              <div className="space-y-6 border-t border-[#4C9296]/10 pt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium text-[#4C9296]">Vision Cards</Label>
                  <Button
                    type="button"
                    onClick={addCard}
                    variant="outline"
                    className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors rounded-xl"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Card
                  </Button>
                </div>

                <div className="grid gap-6">
                  {content.cards.map((card, index) => (
                    <Card key={index} className="border-2 border-[#4C9296]/10 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="md:col-span-2">
                                <Label className="text-base font-medium text-gray-900">Title</Label>
                                <Input
                                  value={card.title}
                                  onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                                  placeholder="Enter card title"
                                  className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-base font-medium text-gray-900">Description</Label>
                              <Textarea
                                value={card.description}
                                onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                                placeholder="Enter card description"
                                rows={4}
                                className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl resize-none"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"
                            onClick={() => removeCard(index)}
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
                  className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all rounded-xl px-8 py-6 text-base font-medium min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Content'
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