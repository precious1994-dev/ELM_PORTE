'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import Image from 'next/image'

interface TeamMember {
  name: string
  role: string
  image: string
}

interface TeamContent {
  title: string
  subtitle: string
  description: string
  members: TeamMember[]
}

const CLOUD_NAME = 'dzxhxv2sd'
const DEFAULT_AVATAR = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/v1710935040/team-members/default-avatar.jpg`

export default function AdultTeamPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [content, setContent] = useState<TeamContent>({
    title: '',
    subtitle: '',
    description: '',
    members: []
  })
  const [imageFiles, setImageFiles] = useState<{ [key: number]: File | null }>({})
  const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>({})

  // Fetch current team content on component mount
  useEffect(() => {
    const fetchCurrentTeam = async () => {
      try {
        const response = await fetch('/api/adulte/equipe')
        if (response.ok) {
          const data = await response.json()
          setContent(data)
        }
      } catch (error) {
        toast.error('Failed to fetch current team')
      } finally {
        setIsFetching(false)
      }
    }

    fetchCurrentTeam()
  }, [])

  // Initialize image previews when content changes
  useEffect(() => {
    const previews: { [key: number]: string } = {}
    content.members.forEach((member: TeamMember, index: number) => {
      if (member.image) {
        previews[index] = member.image
      }
    })
    setImagePreviews(previews)
  }, [content.members])

  const handleContentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setContent(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMemberChange = (index: number, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      members: prev.members.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  const uploadToServer = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      throw error
    }
  }

  const handleImageUpload = async (index: number, file: File) => {
    try {
      // Show loading state
      toast.loading('Uploading image...')

      // Update the file state
      setImageFiles(prev => ({
        ...prev,
        [index]: file
      }))

      // Create and set preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreviews(prev => ({
        ...prev,
        [index]: previewUrl
      }))

      // Upload to server
      const imageUrl = await uploadToServer(file)

      // Update the content state with the image URL
      handleMemberChange(index, 'image', imageUrl)

      toast.dismiss()
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')

      // Clean up preview on error
      handleRemoveImage(index)
    }
  }

  const handleRemoveImage = (index: number) => {
    // Clean up preview URL
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index])
    }

    // Remove image from states
    setImageFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[index]
      return newFiles
    })

    setImagePreviews(prev => {
      const newPreviews = { ...prev }
      delete newPreviews[index]
      return newPreviews
    })

    // Clear image path in content
    handleMemberChange(index, 'image', '')
  }

  const handleAddMember = () => {
    setContent(prev => ({
      ...prev,
      members: [
        ...prev.members,
        { name: '', role: '', image: '' }
      ]
    }))
  }

  const handleRemoveMember = (index: number) => {
    // Clean up image preview if exists
    handleRemoveImage(index)

    setContent(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Save updated content
      const response = await fetch('/api/adulte/equipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update team')
      }

      toast.success('Team updated successfully')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update team')
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
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Gestion de l'Équipe</h1>
          <p className="text-gray-600">Gérez les membres de l'équipe des adultes.</p>
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

          {/* Team Members */}
          <Card className="border-2 border-[#4C9296]/10 shadow-lg">
            <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Membres de l'Équipe</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddMember}
                  className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un membre
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6">
                {content.members.map((member, index) => (
                  <Card key={index} className="border-2 border-[#4C9296]/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-6">
                          <div>
                            <Label htmlFor={`member-${index}-name`} className="text-base font-medium text-gray-900">Nom</Label>
                            <Input
                              id={`member-${index}-name`}
                              value={member.name}
                              onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                              placeholder="Entrez le nom"
                              className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`member-${index}-role`} className="text-base font-medium text-gray-900">Rôle</Label>
                            <Input
                              id={`member-${index}-role`}
                              value={member.role}
                              onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                              placeholder="Entrez le rôle"
                              className="mt-2 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`member-${index}-image`} className="text-base font-medium text-gray-900">Photo</Label>
                            <div className="mt-2 space-y-2">
                              {imagePreviews[index] ? (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-[#4C9296]/10">
                                  <Image
                                    src={imagePreviews[index]}
                                    alt={`Preview for ${member.name || 'member'}`}
                                    fill
                                    className="object-cover"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 text-gray-700 rounded-xl"
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="file"
                                    id={`member-${index}-image`}
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleImageUpload(index, file)
                                    }}
                                    className="hidden"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-48 flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-[#4C9296]/20 rounded-xl hover:bg-[#4C9296]/5 transition-colors"
                                    onClick={() => document.getElementById(`member-${index}-image`)?.click()}
                                  >
                                    <Upload className="h-8 w-8 text-[#4C9296]" />
                                    <span className="text-sm text-gray-600">Cliquez pour télécharger une photo</span>
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl"
                          onClick={() => handleRemoveMember(index)}
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