'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface HistoryItem {
  id: string
  title: string
  description: string
  year: string
}

interface HistorySection {
  mainTitle: string
  subtitle: string
  description: string
  items: HistoryItem[]
}

const emptyHistory: HistorySection = {
  mainTitle: '',
  subtitle: '',
  description: '',
  items: []
}

export default function HistoireManager() {
  const [historyData, setHistoryData] = useState<HistorySection>(emptyHistory)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/apropos/histoire')
        if (!response.ok) throw new Error('Failed to fetch history')
        const data = await response.json()
        if (mounted.current) {
          setHistoryData({
            mainTitle: data.mainTitle || '',
            subtitle: data.subtitle || '',
            description: data.description || '',
            items: Array.isArray(data.items) ? data.items : []
          })
        }
      } catch (error) {
        console.error('Error fetching history:', error)
        if (mounted.current) {
          toast.error('Erreur lors du chargement des données')
          setHistoryData(emptyHistory)
        }
      } finally {
        if (mounted.current) {
          setIsLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      mounted.current = false
    }
  }, [])

  const handleSave = async () => {
    if (isSaving) return // Prevent multiple simultaneous saves
    
    // Validate data before sending
    if (!historyData.mainTitle?.trim() || !historyData.subtitle?.trim() || !historyData.description?.trim()) {
      toast.error('Veuillez remplir tous les champs requis')
      return
    }

    setIsSaving(true)
    
    try {
      const response = await fetch('/api/apropos/histoire', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(historyData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save history')
      }

      if (mounted.current) {
        setHistoryData({
          mainTitle: data.mainTitle || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          items: Array.isArray(data.items) ? data.items : []
        })
        toast.success('Modifications enregistrées')
      }
    } catch (error) {
      console.error('Error saving history:', error)
      if (mounted.current) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
      }
    } finally {
      if (mounted.current) {
        setIsSaving(false)
      }
    }
  }

  const handleInputChange = (field: keyof Omit<HistorySection, 'items'>, value: string) => {
    setHistoryData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addItem = () => {
    if (isSaving) return // Prevent modifications while saving
    
    const newItem = {
      id: uuidv4(),
      title: '',
      description: '',
      year: ''
    }
    
    setHistoryData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (id: string) => {
    if (isSaving) return // Prevent modifications while saving
    
    setHistoryData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const updateItem = (id: string, field: keyof HistoryItem, value: string) => {
    if (isSaving) return // Prevent modifications while saving
    
    setHistoryData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <AdminPageHeader 
        title="Notre Histoire" 
        description="Gérez le contenu de la section histoire."
        onSave={handleSave}
        isSaving={isSaving}
      />

      <Section>
        <Container>
          {/* Main Content Form */}
          <Card className="mb-8 overflow-hidden border-2 border-[#4C9296]/10 shadow-lg">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-8 py-6">
              <h3 className="text-2xl font-serif font-bold text-[#4C9296]">
                Contenu Principal
              </h3>
            </div>

            <div className="space-y-6 bg-white px-8 py-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-base font-medium text-[#4C9296]">
                    Titre Principal
                  </label>
                  <Input
                    value={historyData.mainTitle}
                    onChange={(e) => handleInputChange('mainTitle', e.target.value)}
                    placeholder="Notre Histoire"
                    className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-base font-medium text-[#4C9296]">
                    Sous-titre
                  </label>
                  <Input
                    value={historyData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Notre Parcours"
                    className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium text-[#4C9296]">
                  Description
                </label>
                <Textarea
                  value={historyData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Découvrez l'histoire de notre église..."
                  rows={4}
                  className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Timeline Items */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-8 py-6">
              <h3 className="text-2xl font-serif font-bold text-[#4C9296]">
                Événements Historiques
              </h3>
              <Button 
                onClick={addItem} 
                className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors gap-2 rounded-xl"
              >
                <FaPlus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>

            <div className="divide-y divide-[#4C9296]/10 bg-white">
              {isLoading ? (
                <div className="p-8 text-center text-[#4C9296]">
                  Chargement des événements...
                </div>
              ) : (
                <>
                  {historyData.items.map((item, index) => (
                    <div key={item.id} className="p-8 hover:bg-[#4C9296]/5 transition-colors">
                      <div className="mb-6 flex items-center justify-between">
                        <h4 className="text-lg font-medium text-[#4C9296]">
                          Événement {index + 1}
                        </h4>
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 focus:ring-red-500 rounded-xl"
                        >
                          <FaTrash className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-base font-medium text-[#4C9296]">
                            Titre
                          </label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                            placeholder="Les Débuts"
                            className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-base font-medium text-[#4C9296]">
                            Année
                          </label>
                          <Input
                            value={item.year}
                            onChange={(e) => updateItem(item.id, 'year', e.target.value)}
                            placeholder="1990"
                            className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="mt-6 space-y-2">
                        <label className="text-base font-medium text-[#4C9296]">
                          Description
                        </label>
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Description de l'événement..."
                          rows={3}
                          className="text-black border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl resize-none"
                        />
                      </div>
                    </div>
                  ))}

                  {historyData.items.length === 0 && (
                    <div className="px-8 py-12 text-center text-[#4C9296]">
                      Aucun événement ajouté. Cliquez sur "Ajouter" pour commencer.
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  )
} 