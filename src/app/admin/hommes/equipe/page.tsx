'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { FiSave, FiArrowLeft, FiUpload, FiX, FiPlus, FiTrash } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Pencil, Trash2, Plus, Loader2, Upload, X } from 'lucide-react'
import { Users } from 'lucide-react'

interface TeamMember {
  _id: string
  name: string
  role: string
  image: string
}

interface TeamContent {
  title: string
  subtitle: string
  members: TeamMember[]
}

const emptyMember: TeamMember = {
  _id: '',
  name: '',
  role: '',
  image: '/images/default-avatar.jpg'
}

export default function HommesTeamPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [team, setTeam] = useState<TeamContent>({
    title: '',
    subtitle: '',
    members: []
  })
  const [currentMember, setCurrentMember] = useState<TeamMember>({ ...emptyMember })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/hommes/equipe')
      if (!response.ok) {
        throw new Error('Failed to fetch team data')
      }
      const data = await response.json()
      setTeam(data)
    } catch (error) {
      console.error('Error fetching team:', error)
      toast.error('Failed to load team data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchMembers()
    }
  }, [status, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (member: TeamMember) => {
    setCurrentMember(member)
    setImagePreview(member.image)
  }

  const resetForm = () => {
    setCurrentMember({ ...emptyMember })
    setSelectedImage(null)
    setImagePreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!currentMember.name || !currentMember.role) {
        toast.error('Le nom et le rôle sont obligatoires')
        setIsLoading(false)
        return
      }

      let imageUrl = currentMember.image

      // Upload new image if selected
      if (selectedImage) {
        const formData = new FormData()
        formData.append('file', selectedImage)

        try {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image')
          }

          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        } catch (error) {
          console.error('Image upload error:', error)
          toast.error('Failed to upload image')
          setIsLoading(false)
          return
        }
      }

      // Prepare member data
      const memberData = {
        name: currentMember.name,
        role: currentMember.role,
        image: imageUrl
      }

      // Determine if we're creating a new member or updating an existing one
      const url = currentMember._id 
        ? `/api/hommes/equipe/${currentMember._id}`
        : '/api/hommes/equipe'
      
      const method = currentMember._id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save team member')
      }

      const savedMember = await response.json()

      // Update local state based on operation type
      if (currentMember._id) {
        // Update existing member
        setTeam(prev => ({
          ...prev,
          members: prev.members.map(member => 
            member._id === currentMember._id ? savedMember : member
          )
        }))
        toast.success('Membre modifié avec succès')
      } else {
        // Add new member
        setTeam(prev => ({
          ...prev,
          members: [savedMember, ...prev.members]
        }))
        toast.success('Membre ajouté avec succès')
      }

      resetForm()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : 'Échec de la sauvegarde du membre')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      const response = await fetch(`/api/hommes/equipe/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete team member')
      }

      setTeam(prev => ({
        ...prev,
        members: prev.members.filter(member => member._id !== id)
      }))
      toast.success('Member deleted successfully')
    } catch (error) {
      console.error('Delete error:', error) // Debug log
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete team member'
      toast.error(errorMessage)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#4C9296]" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Gestion de l'Équipe</h1>
          <p className="text-gray-600">Gérez les membres de l'équipe du ministère des hommes.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Current Members List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl bg-white shadow-lg border-2 border-[#4C9296]/10">
              <div className="border-b-2 border-[#4C9296]/10 bg-[#4C9296]/5 p-6">
                <h2 className="font-serif text-2xl font-bold text-[#4C9296]">Membres de l'équipe</h2>
              </div>
              <div className="divide-y-2 divide-[#4C9296]/10">
                {team.members.map((member) => (
                  <div key={member._id} className="flex items-start gap-6 p-6 hover:bg-[#4C9296]/5 transition-colors">
                    <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border-2 border-[#4C9296]/10 shadow-md">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name || 'Team member'}
                          fill
                          className="object-cover"
                          onError={(e: any) => {
                            e.target.src = '/images/default-avatar.jpg'
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#4C9296]/5">
                          <Users className="h-12 w-12 text-[#4C9296]/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="font-serif text-xl font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-base font-medium text-[#4C9296]">{member.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(member)}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-[#4C9296] hover:text-[#3A7276] hover:bg-[#4C9296]/10 transition-colors rounded-xl"
                      >
                        <Pencil className="h-5 w-5" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button
                        onClick={() => handleDelete(member._id)}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add/Edit Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="rounded-xl bg-white p-6 shadow-lg border-2 border-[#4C9296]/10">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-bold text-[#4C9296]">
                    {currentMember._id ? 'Modifier le membre' : 'Ajouter un membre'}
                  </h2>
                  {currentMember._id && (
                    <Button
                      onClick={resetForm}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors rounded-xl"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Annuler</span>
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium text-gray-900">
                        Photo
                      </Label>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null)
                            setImagePreview('')
                            setCurrentMember(prev => ({ ...prev, image: '/images/default-avatar.jpg' }))
                          }}
                          className="text-sm font-medium text-[#4C9296] hover:text-[#3A7276] transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <div className="flex items-start gap-4">
                      {imagePreview ? (
                        <div className="relative h-36 w-36 overflow-hidden rounded-xl border-2 border-[#4C9296]/10 shadow-md">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            onError={(e: any) => {
                              e.target.src = '/images/default-avatar.jpg'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-[#4C9296]/20 bg-gray-50">
                          <Users className="h-10 w-10 text-[#4C9296]/30" />
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
                          className="inline-flex cursor-pointer items-center rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
                        >
                          <Upload className="mr-2 h-5 w-5" />
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
                      <Label htmlFor="name" className="text-base font-medium text-gray-900">Nom</Label>
                      <Input
                        id="name"
                        value={currentMember.name}
                        onChange={(e) => setCurrentMember(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Entrez le nom"
                        className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-base font-medium text-gray-900">Rôle</Label>
                      <Input
                        id="role"
                        value={currentMember.role}
                        onChange={(e) => setCurrentMember(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Entrez le rôle"
                        className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all rounded-xl py-6 text-base font-medium"
                  >
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {currentMember._id ? 'Enregistrer les modifications' : 'Ajouter le membre'}
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