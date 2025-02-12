'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import type { VisionContent } from '@/app/api/adulte/vision/route'

export default function AdulteVisionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<VisionContent>({
    title: '',
    subtitle: '',
    description: '',
    cards: []
  })

  // Fetch current vision content on component mount
  useEffect(() => {
    const fetchCurrentVision = async () => {
      try {
        const response = await fetch('/api/adulte/vision')
        if (response.ok) {
          const data = await response.json()
          setContent(data)
        }
      } catch (error) {
        console.error('Error fetching current vision:', error)
        toast.error('Failed to fetch current vision')
      } finally {
        setIsFetching(false)
      }
    }

    fetchCurrentVision()
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

  const handleCardChange = (index: number, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      )
    }))
  }

  const handleAddCard = () => {
    setContent(prev => ({
      ...prev,
      cards: [
        ...prev.cards,
        { title: '', description: '', icon: '' }
      ]
    }))
  }

  const handleRemoveCard = (index: number) => {
    setContent(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/adulte/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update vision')
      }

      toast.success('Vision updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update vision')
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
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Gestion de la Vision</h1>
          <p className="text-gray-600">Gérez le contenu de la vision pour la section des adultes.</p>
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

          {/* Vision Cards */}
          <Card className="border-2 border-[#4C9296]/10 shadow-lg">
            <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Cartes de Vision</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCard}
                  className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une carte
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6">
                {content.cards.map((card, index) => (
                  <Card key={index} className="border-2 border-[#4C9296]/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-6">
                          <div>
                            <Label htmlFor={`card-${index}-title`} className="text-base font-medium text-gray-900">Titre de la Carte</Label>
                            <Input
                              id={`card-${index}-title`}
                              value={card.title}
                              onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                              placeholder="Entrez le titre de la carte"
                              className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`card-${index}-description`} className="text-base font-medium text-gray-900">Description de la Carte</Label>
                            <Textarea
                              id={`card-${index}-description`}
                              value={card.description}
                              onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                              placeholder="Entrez la description de la carte"
                              rows={3}
                              className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl resize-none"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`card-${index}-icon`} className="text-base font-medium text-gray-900">Icône de la Carte</Label>
                            <Input
                              id={`card-${index}-icon`}
                              value={card.icon}
                              onChange={(e) => handleCardChange(index, 'icon', e.target.value)}
                              placeholder="Entrez le nom de l'icône (ex: heart, book, smile)"
                              className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"
                          onClick={() => handleRemoveCard(index)}
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