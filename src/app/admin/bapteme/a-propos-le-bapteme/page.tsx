'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, BookOpen, ScrollText, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AboutBaptemeContent {
  mainTitle: string
  subtitle: string
  description: string
  cards: {
    title: string
    description: string
  }[]
}

const initialContent: AboutBaptemeContent = {
  mainTitle: 'Le Baptême',
  subtitle: 'À Propos',
  description: 'Le baptême est un acte d\'obéissance et un témoignage public de notre foi en Jésus-Christ. C\'est une étape importante dans la vie de tout croyant.',
  cards: [
    {
      title: 'Signification',
      description: 'Le baptême symbolise notre identification à la mort, l\'ensevelissement et la résurrection de Christ.'
    },
    {
      title: 'Engagement',
      description: 'C\'est un engagement public à suivre Christ et à vivre selon Ses enseignements.'
    },
    {
      title: 'Témoignage',
      description: 'Une déclaration publique de notre foi et de notre nouvelle vie en Christ.'
    }
  ]
}

export default function BaptemeAboutPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<AboutBaptemeContent>(initialContent)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/bapteme/a-propos-le-bapteme')
        if (!response.ok) throw new Error('Failed to fetch content')
        const data = await response.json()
        if (data && Object.keys(data).length > 0) {
          setContent(data)
        }
      } catch (error) {
        console.error('Error fetching content:', error)
        toast.error('Failed to load content')
      } finally {
        setIsFetching(false)
      }
    }

    fetchContent()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/bapteme/a-propos-le-bapteme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      })

      if (!response.ok) throw new Error('Failed to update content')
      
      const data = await response.json()
      setContent(data)
      toast.success('Content updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating content:', error)
      toast.error('Failed to update content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardChange = (index: number, field: string, value: string) => {
    const newCards = [...content.cards]
    newCards[index] = { ...newCards[index], [field]: value }
    setContent({ ...content, cards: newCards })
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
        <div className="mb-8">
          <Link
            href="/admin/bapteme"
            className="inline-flex items-center gap-2 text-sm text-[#4C9296] hover:text-[#3A7276] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#4C9296]">À Propos - Le Baptême</h1>
          <p className="mt-2 text-black">
            Gérez le contenu de la section À Propos du Baptême.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Content Section */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <BookOpen className="h-5 w-5" />
                Contenu Principal
              </h2>
            </div>
            <CardContent className="grid gap-6 p-6">
              <div>
                <Label htmlFor="mainTitle" className="text-[#4C9296]">Titre Principal</Label>
                <Input
                  id="mainTitle"
                  value={content.mainTitle}
                  onChange={(e) => setContent({ ...content, mainTitle: e.target.value })}
                  placeholder="Titre principal"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="subtitle" className="text-[#4C9296]">Sous-titre</Label>
                <Input
                  id="subtitle"
                  value={content.subtitle}
                  onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                  placeholder="Sous-titre"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[#4C9296]">Description</Label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => setContent({ ...content, description: e.target.value })}
                  placeholder="Description générale"
                  rows={3}
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cards Section */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <ScrollText className="h-5 w-5" />
                Points Principaux
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6">
                {content.cards.map((card, index) => (
                  <Card key={index} className="overflow-hidden border-2 border-[#4C9296]/10">
                    <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-4 py-3">
                      <h3 className="flex items-center gap-2 font-medium text-[#4C9296]">
                        <FileText className="h-4 w-4" />
                        Point {index + 1}
                      </h3>
                    </div>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label htmlFor={`card-${index}-title`} className="text-[#4C9296]">Titre</Label>
                        <Input
                          id={`card-${index}-title`}
                          value={card.title}
                          onChange={(e) => handleCardChange(index, 'title', e.target.value)}
                          placeholder="Titre de la carte"
                          className="mt-1.5 text-black placeholder:text-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`card-${index}-description`} className="text-[#4C9296]">Description</Label>
                        <Textarea
                          id={`card-${index}-description`}
                          value={card.description}
                          onChange={(e) => handleCardChange(index, 'description', e.target.value)}
                          placeholder="Description de la carte"
                          rows={2}
                          className="mt-1.5 text-black placeholder:text-gray-400"
                        />
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
              className="bg-[#4C9296] hover:bg-[#3A7276] text-white min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
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