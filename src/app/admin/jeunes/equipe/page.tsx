'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { Users } from 'lucide-react'
import { ImageIcon } from 'lucide-react'

interface TeamMember {
  _id: string
  name: string
  role: string
  image: string
  description: string
}

const DEFAULT_IMAGE = '/images/placeholder-member.jpg'

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    image: ''
  })

  // Fetch team members
  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/jeunes/equipe')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch team members')
      }
      const data = await response.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch team members'
      toast.error(errorMessage)
      console.error('Error details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        e.target.value = '' // Reset input
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        e.target.value = '' // Reset input
        return
      }

      setImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleRemoveImage = useCallback(() => {
    setImageFile(null)
    setImagePreview('')
    setFormData(prev => ({ ...prev, image: '' }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Upload image if there's a new one
      let imageUrl = formData.image
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      // Prepare the data with a default description
      const memberData = {
        ...formData,
        image: imageUrl,
        description: formData.description || 'Membre de l\'équipe des jeunes', // Add default description
      }

      // Add or update member
      const url = editingId 
        ? `/api/jeunes/equipe/${editingId}`
        : '/api/jeunes/equipe'

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save team member')
      }

      // Update members list
      if (!editingId) {
        setMembers(prev => [data, ...prev])
      } else {
        setMembers(prev => prev.map(m => m._id === editingId ? data : m))
      }

      toast.success(editingId ? 'Membre modifié avec succès' : 'Membre ajouté avec succès')
      resetForm()
    } catch (error) {
      console.error('Error details:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return

    try {
      const response = await fetch(`/api/jeunes/equipe/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete team member')
      }

      setMembers(prev => prev.filter(member => member._id !== id))
      toast.success('Membre supprimé avec succès')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete team member'
      toast.error(errorMessage)
      console.error('Error details:', error)
    }
  }

  const handleEdit = useCallback((member: TeamMember) => {
    setEditingId(member._id)
    setFormData({
      name: member.name,
      role: member.role,
      description: member.description,
      image: member.image
    })
    setImagePreview(member.image)
  }, [])

  const resetForm = useCallback(() => {
    setEditingId(null)
    setFormData({
      name: '',
      role: '',
      description: '',
      image: ''
    })
    setImageFile(null)
    setImagePreview('')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="container mx-auto max-w-5xl py-8 px-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#4C9296]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <h1 className="font-serif text-4xl font-bold text-[#4C9296] mb-8">Équipe des Jeunes</h1>
        
        {/* Form Section */}
        <div className="rounded-xl bg-white p-6 shadow-lg border-2 border-[#4C9296]/10 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-base font-medium text-black">
                  Nom
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nom du membre"
                  className="rounded-xl border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 text-black"
                />
              </div>
              <div>
                <label htmlFor="role" className="mb-2 block text-base font-medium text-black">
                  Rôle
                </label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  placeholder="Rôle dans l'équipe"
                  className="rounded-xl border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 text-black"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-medium text-black">
                Photo
              </label>
              <div className="mt-1 flex items-center gap-4">
                <label
                  htmlFor="image"
                  className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#4C9296]/20 hover:border-[#4C9296]/40 transition-colors"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={128}
                      height={128}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-[#4C9296]" />
                      <span className="mt-2 block text-sm text-black">
                        Sélectionner une photo
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all rounded-xl px-8 py-6 text-base font-medium min-w-[200px]"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>{editingId ? "Mettre à jour" : "Ajouter"}</span>
                  </div>
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={submitting}
                  className="border-[#4C9296]/20 hover:bg-[#4C9296]/5 text-[#4C9296] rounded-xl px-8"
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Team List */}
        <div className="rounded-xl bg-white p-6 shadow-lg border-2 border-[#4C9296]/10">
          <div className="border-b border-[#4C9296]/10 pb-6 mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#4C9296]">Membres de l'équipe</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-black">Aucun membre n'a été ajouté.</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member._id}
                  className="relative rounded-xl border-2 border-[#4C9296]/10 p-4 hover:border-[#4C9296]/30 transition-colors shadow-sm hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden rounded-lg mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={300}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-black">{member.name}</h3>
                  <p className="text-black mt-1">{member.role}</p>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(member)}
                      className="rounded-lg hover:bg-[#4C9296]/10 text-[#4C9296]"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(member._id)}
                      className="rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 