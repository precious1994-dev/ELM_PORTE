'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, BookOpen, ListChecks, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

interface ProcessStep {
  title: string
  description: string
}

interface ProcessContent {
  mainTitle: string
  subtitle: string
  description: string
  steps: ProcessStep[]
}

const initialContent: ProcessContent = {
  mainTitle: 'Processus du Baptême',
  subtitle: 'Les Étapes',
  description: 'Découvrez le cheminement vers le baptême dans notre église. Un parcours spirituel guidé pour vous préparer à cette étape importante.',
  steps: [
    {
      title: 'Rencontre Initiale',
      description: 'Une première rencontre avec un responsable pour discuter de votre désir de baptême et répondre à vos questions.'
    },
    {
      title: 'Formation Biblique',
      description: 'Participation à des sessions d\'enseignement sur la signification du baptême et ses implications dans la vie chrétienne.'
    },
    {
      title: 'Témoignage Personnel',
      description: 'Préparation et partage de votre témoignage personnel de foi devant l\'église.'
    }
  ]
}

export default function BaptismProcessPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<ProcessContent>(initialContent)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/bapteme/process-bapteme')
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
      const response = await fetch('/api/bapteme/process-bapteme', {
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

  const handleStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...content.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setContent({ ...content, steps: newSteps })
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
          <h1 className="font-serif text-3xl font-bold text-[#4C9296]">Processus du Baptême</h1>
          <p className="mt-2 text-black">
            Gérez le contenu de la section Processus du Baptême.
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

          {/* Steps Section */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <ListChecks className="h-5 w-5" />
                Étapes du Processus
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="grid gap-6">
                {content.steps.map((step, index) => (
                  <Card key={index} className="overflow-hidden border-2 border-[#4C9296]/10">
                    <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-4 py-3">
                      <h3 className="flex items-center gap-2 font-medium text-[#4C9296]">
                        <FileText className="h-4 w-4" />
                        Étape {index + 1}
                      </h3>
                    </div>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label htmlFor={`step-${index}-title`} className="text-[#4C9296]">Titre</Label>
                        <Input
                          id={`step-${index}-title`}
                          value={step.title}
                          onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                          placeholder="Titre de l'étape"
                          className="mt-1.5 text-black placeholder:text-gray-400"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`step-${index}-description`} className="text-[#4C9296]">Description</Label>
                        <Textarea
                          id={`step-${index}-description`}
                          value={step.description}
                          onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                          placeholder="Description de l'étape"
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