'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus, Loader2, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { Users } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface TeamMember {
  _id: string
  name: string
  role: string
  image: string
}

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
    image: ''
  })

  // Fetch team members
  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/enfants/equipe')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch team members')
      }
      const data = await response.json()
      console.log('Fetched members:', data) // Debug log
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
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

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

      // Prepare the data
      const memberData = {
        ...formData,
        image: imageUrl,
      }

      // Add or update member
      const url = editingId 
        ? `/api/enfants/equipe/${editingId}`
        : '/api/enfants/equipe'

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

      // If it's a new member, add it to the list
      if (!editingId) {
        setMembers(prev => [data, ...prev])
      } else {
        // If updating, update the member in the list
        setMembers(prev => prev.map(m => m._id === editingId ? data : m))
      }

      toast.success(editingId ? 'Membre modifié avec succès' : 'Membre ajouté avec succès')
      resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error(errorMessage)
      console.error('Error details:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const response = await fetch(`/api/enfants/equipe/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete team member')
      }

      setMembers(prevMembers => prevMembers.filter(member => member._id !== id))
      toast.success('Member deleted successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete team member'
      toast.error(errorMessage)
      console.error('Error details:', error)
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingId(member._id)
    setFormData({
      name: member.name,
      role: member.role,
      image: member.image
    })
    setImagePreview(member.image)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      role: '',
      image: ''
    })
    setImageFile(null)
    setImagePreview('')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4C9296]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#4C9296] mb-2">Gestion de l'Équipe</h1>
        <p className="text-gray-600">Gérez les membres de l'équipe du ministère des enfants.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Current Members List */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white shadow-lg border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 p-4">
              <h2 className="font-serif text-xl font-semibold text-[#4C9296]">Membres de l'équipe</h2>
            </div>
            <div className="divide-y divide-[#4C9296]/10">
              {members && members.length > 0 ? (
                members.map((member) => (
                  <div key={member._id} className="flex items-start gap-4 p-6 hover:bg-[#4C9296]/5 transition-colors">
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border-2 border-[#4C9296]/10 shadow-md">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-serif text-lg font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm font-medium text-[#4C9296]">{member.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(member)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#4C9296] hover:text-[#3A7276] hover:bg-[#4C9296]/10 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button
                        onClick={() => handleDelete(member._id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-[#4C9296]/40" />
                  <h3 className="mt-2 font-medium text-gray-900">Aucun membre</h3>
                  <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un membre à l'équipe.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="rounded-lg bg-white p-6 shadow-lg border-2 border-[#4C9296]/10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold text-[#4C9296]">
                  {editingId ? 'Modifier le membre' : 'Ajouter un membre'}
                </h2>
                {editingId && (
                  <Button
                    onClick={resetForm}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Annuler</span>
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-[#4C9296]">
                      Photo
                    </Label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                          setFormData(prev => ({ ...prev, image: '' }))
                        }}
                        className="text-sm text-[#4C9296] hover:text-[#3A7276] transition-colors"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  <div className="flex items-start gap-4">
                    {imagePreview ? (
                      <div className="relative h-32 w-48 overflow-hidden rounded-lg border-2 border-[#4C9296]/10 shadow-md">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-[#4C9296]/20 bg-gray-50">
                        <Upload className="h-8 w-8 text-[#4C9296]/40" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image"
                        className="inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {imagePreview ? 'Changer la photo' : 'Ajouter une photo'}
                      </label>
                      <p className="text-sm text-gray-500">
                        Format recommandé : 800x800px
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-[#4C9296]">Nom</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Entrez le nom"
                      className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-sm font-medium text-[#4C9296]">Rôle</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Entrez le rôle"
                      className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Enregistrer les modifications' : 'Ajouter le membre'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 