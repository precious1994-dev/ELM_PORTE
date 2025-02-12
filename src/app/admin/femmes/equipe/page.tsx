'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ITeamMember } from '@/models/FemmesEquipe'
import Image from 'next/image'

interface EquipeContent {
  sectionTitle: string
  subtitle: string
  description: string
  members: {
    name: string
    role: string
    imageUrl: string
  }[]
}

export default function FemmesEquipePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [content, setContent] = useState<EquipeContent>({
    sectionTitle: 'Notre Équipe',
    subtitle: 'Leadership',
    description: 'Une équipe dévouée au service et à l\'accompagnement spirituel des femmes.',
    members: [
      {
        name: 'Claire Dubois',
        role: 'Responsable du Ministère',
        imageUrl: '/images/team/claire.jpg'
      },
      {
        name: 'Marie-Anne Laurent',
        role: 'Coordinatrice des Activités',
        imageUrl: '/images/team/marie-anne.jpg'
      },
      {
        name: 'Sophie Martin',
        role: 'Responsable des Études Bibliques',
        imageUrl: '/images/team/sophie.jpg'
      }
    ]
  })

  useEffect(() => {
    const fetchEquipe = async () => {
      try {
        const response = await fetch('/api/femmes/equipe')
        if (response.ok) {
          const data = await response.json()
          if (data && Object.keys(data).length > 0) {
            setContent(prev => ({
              ...prev,
              ...data,
              members: data.members || prev.members
            }))
          }
        }
      } catch (error) {
        console.error('Error fetching equipe:', error)
        toast.error('Failed to fetch equipe content')
      } finally {
        setIsFetching(false)
      }
    }

    fetchEquipe()
  }, [])

  const handleMemberChange = (index: number, field: keyof ITeamMember, value: string) => {
    setContent(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploadingIndex(index)
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await uploadResponse.json()
      handleMemberChange(index, 'imageUrl', url)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleAddMember = () => {
    setContent(prev => ({
      ...prev,
      members: [
        ...prev.members,
        {
          name: '',
          role: '',
          imageUrl: ''
        }
      ]
    }))
  }

  const handleRemoveMember = (index: number) => {
    setContent(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/femmes/equipe', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (!response.ok) {
        throw new Error('Failed to update equipe')
      }

      toast.success('Equipe updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Error updating equipe:', error)
      toast.error('Failed to update equipe')
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#4C9296] mb-2">Team Management</h1>
        <p className="text-gray-600">Manage the team members for the women's ministry section.</p>
      </div>

      <Card className="border-2 border-[#4C9296]/10 shadow-lg">
        <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
          <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">Team Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Content Section */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="sectionTitle" className="text-sm font-medium text-[#4C9296]">Section Title</Label>
                <Input
                  id="sectionTitle"
                  value={content.sectionTitle}
                  onChange={(e) => setContent(prev => ({ ...prev, sectionTitle: e.target.value }))}
                  placeholder="Enter section title"
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="subtitle" className="text-sm font-medium text-[#4C9296]">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={content.subtitle}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Enter subtitle"
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-[#4C9296]">Description</Label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Enter description"
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Team Members Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-t border-[#4C9296]/10 pt-6">
                <Label className="text-lg font-medium text-[#4C9296]">Team Members</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMember}
                  className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
              
              <div className="grid gap-6">
                {content.members.map((member, index) => (
                  <Card key={index} className="border-2 border-[#4C9296]/10 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor={`member-${index}-name`} className="text-sm font-medium text-[#4C9296]">Member Name</Label>
                              <Input
                                id={`member-${index}-name`}
                                value={member.name}
                                onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                                placeholder="Enter member name"
                                className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`member-${index}-role`} className="text-sm font-medium text-[#4C9296]">Member Role</Label>
                              <Input
                                id={`member-${index}-role`}
                                value={member.role}
                                onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                                placeholder="Enter member role"
                                className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-[#4C9296] mb-1.5 block">Member Photo</Label>
                            <div className="flex items-start gap-4">
                              {member.imageUrl ? (
                                <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-[#4C9296]/10">
                                  <Image
                                    src={member.imageUrl}
                                    alt={member.name || 'Team member'}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-[#4C9296]/20 bg-gray-50">
                                  <Upload className="h-8 w-8 text-[#4C9296]/40" />
                                </div>
                              )}
                              <div className="space-y-2">
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
                                <label
                                  htmlFor={`member-${index}-image`}
                                  className="inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  {member.imageUrl ? 'Change Photo' : 'Upload Photo'}
                                </label>
                                <p className="text-sm text-gray-500">
                                  Recommended size: 800x800px
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="ml-4 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => handleRemoveMember(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#4C9296] hover:bg-[#3A7276] text-white min-w-[200px] shadow-md hover:shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 