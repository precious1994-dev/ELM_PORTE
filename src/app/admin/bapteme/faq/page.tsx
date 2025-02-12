'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Plus, Trash2, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FAQContent } from '@/app/api/bapteme/faq/route'

const initialContent: FAQContent = {
  questions: [
    {
      question: '',
      answer: ''
    }
  ]
}

export default function FAQPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<FAQContent>(initialContent)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/bapteme/faq')
        if (!response.ok) throw new Error('Failed to fetch content')
        const data = await response.json()
        if (data) {
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

  const handleQuestionChange = (index: number, field: 'question' | 'answer', value: string) => {
    setContent(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const addQuestion = () => {
    setContent(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { question: '', answer: '' }
      ]
    }))
  }

  const removeQuestion = (index: number) => {
    setContent(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/bapteme/faq', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })

      if (!response.ok) throw new Error('Failed to update content')
      
      toast.success('Content updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update content')
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
          <h1 className="font-serif text-3xl font-bold text-[#4C9296]">FAQ du Baptême</h1>
          <p className="mt-2 text-black">
            Gérez les questions fréquemment posées sur le baptême.
          </p>
        </div>

        <Card className="overflow-hidden border-2 border-[#4C9296]/10">
          <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <HelpCircle className="h-5 w-5" />
                Questions & Réponses
              </h2>
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                className="text-[#4C9296] border-[#4C9296]/20 hover:bg-[#4C9296]/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une Question
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {content.questions.map((item, index) => (
                <Card key={index} className="overflow-hidden border-2 border-[#4C9296]/10">
                  <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-medium text-[#4C9296]">
                      Question {index + 1}
                    </h3>
                    <Button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label htmlFor={`question-${index}`} className="text-[#4C9296]">
                        Question
                      </Label>
                      <Input
                        id={`question-${index}`}
                        value={item.question}
                        onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                        className="mt-1.5 text-black placeholder:text-gray-400"
                        placeholder="Entrez la question"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`answer-${index}`} className="text-[#4C9296]">
                        Réponse
                      </Label>
                      <Textarea
                        id={`answer-${index}`}
                        value={item.answer}
                        onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                        rows={3}
                        className="mt-1.5 text-black placeholder:text-gray-400"
                        placeholder="Entrez la réponse"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {content.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">Aucune question ajoutée. Cliquez sur "Ajouter une Question" pour commencer.</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 