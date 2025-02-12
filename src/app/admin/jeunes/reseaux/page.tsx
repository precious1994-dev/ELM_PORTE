'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import type { SocialNetwork } from '@/app/api/jeunes/reseaux/route'
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaTiktok
} from 'react-icons/fa'

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'text-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, color: 'text-red-600' },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: 'text-black' }
]

export default function SocialNetworksPage() {
  const [socials, setSocials] = useState<SocialNetwork[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    isActive: true
  })

  // Fetch social networks
  useEffect(() => {
    fetchSocials()
  }, [])

  const fetchSocials = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/jeunes/reseaux')
      if (!response.ok) {
        throw new Error('Failed to fetch social networks')
      }
      const data = await response.json()
      setSocials(data)
    } catch (error) {
      toast.error('Failed to fetch social networks')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate URL format
      const urlPattern = /^https?:\/\/.+/i
      if (!urlPattern.test(formData.url)) {
        toast.error('Please enter a valid URL starting with http:// or https://')
        setSubmitting(false)
        return
      }

      // Ensure platform is selected
      if (!formData.platform) {
        toast.error('Please select a platform')
        setSubmitting(false)
        return
      }

      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { ...formData, _id: editingId } : formData

      const response = await fetch('/api/jeunes/reseaux', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      if (editingId) {
        setSocials(prev => prev.map(social => 
          social._id === editingId ? data.social : social
        ))
        toast.success('Réseau social mis à jour avec succès')
      } else {
        setSocials(prev => [...prev, data.social])
        toast.success('Réseau social ajouté avec succès')
      }

      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec de la sauvegarde du réseau social')
      console.error('Error saving social network:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (social: SocialNetwork) => {
    if (!social._id) {
      toast.error('Invalid social network ID')
      return
    }
    setEditingId(social._id)
    setFormData({
      platform: social.platform,
      url: social.url,
      isActive: social.isActive
    })
    // Scroll to form
    const formElement = document.querySelector('.social-form')
    formElement?.scrollIntoView({ behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      platform: '',
      url: '',
      isActive: true
    })
  }

  const toggleActive = async (social: SocialNetwork) => {
    try {
      const response = await fetch('/api/jeunes/reseaux', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: social._id,
          platform: social.platform,
          url: social.url,
          isActive: !social.isActive
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      setSocials(prev => prev.map(s => 
        s._id === social._id ? data.social : s
      ))
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4C9296]" />
      </div>
    )
  }

  const getPlatformIcon = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    if (!platform) return null
    const Icon = platform.icon
    return <Icon className={`h-5 w-5 ${platform.color}`} />
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Réseaux Sociaux</h1>
          <p className="text-gray-600">Gérez les liens des réseaux sociaux pour la section jeunesse.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Current Social Networks List */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white shadow-lg border-2 border-[#4C9296]/10">
              <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 p-6">
                <h2 className="font-serif text-2xl font-bold text-[#4C9296]">Réseaux actifs</h2>
              </div>
              <div className="divide-y divide-[#4C9296]/10">
                {socials.map((social) => (
                  <div key={social._id} className="flex items-center gap-4 p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4C9296]/5">
                      {getPlatformIcon(social.platform)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium capitalize text-gray-900">{social.platform}</h3>
                      <a 
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#4C9296] hover:text-[#3A7276] hover:underline"
                      >
                        {social.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={social.isActive}
                        onCheckedChange={() => toggleActive(social)}
                        className="data-[state=checked]:bg-[#4C9296]"
                      />
                      <Button
                        onClick={() => handleEdit(social)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-[#4C9296] hover:bg-[#4C9296]/10 rounded-lg"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                    </div>
                  </div>
                ))}
                {socials.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-[#4C9296]/5 p-3">
                      <FaInstagram className="h-6 w-6 text-[#4C9296]" />
                    </div>
                    <h3 className="mt-2 font-medium text-gray-900">Aucun réseau social</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un réseau social.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="rounded-xl bg-white p-6 shadow-lg border-2 border-[#4C9296]/10">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-bold text-[#4C9296]">
                    {editingId ? 'Modifier le réseau' : 'Ajouter un réseau'}
                  </h2>
                  {editingId && (
                    <Button
                      onClick={resetForm}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Annuler</span>
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 social-form">
                  {/* Platform Select */}
                  <div>
                    <label className="mb-2 block text-base font-medium text-gray-900">
                      Plateforme
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {platforms.map((platform) => (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                          className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                            formData.platform === platform.id
                              ? 'border-[#4C9296] bg-[#4C9296]/5 text-[#4C9296]'
                              : 'border-[#4C9296]/20 hover:border-[#4C9296]/40 text-gray-900'
                          }`}
                        >
                          <platform.icon className={`h-5 w-5 ${platform.color}`} />
                          <span className="text-sm font-medium">{platform.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* URL Input */}
                  <div>
                    <label htmlFor="url" className="mb-2 block text-base font-medium text-gray-900">
                      URL
                    </label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      required
                      placeholder="https://..."
                      className="text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                    />
                  </div>

                  {/* Active Switch */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="isActive" className="text-base font-medium text-gray-900">
                      Actif
                    </label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      className="data-[state=checked]:bg-[#4C9296]"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting || !formData.platform || !formData.url}
                    className="w-full bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all rounded-xl py-6 text-base font-medium"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {editingId ? 'Mise à jour...' : 'Ajout...'}
                      </>
                    ) : (
                      <>{editingId ? 'Mettre à jour' : 'Ajouter'} le réseau</>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 