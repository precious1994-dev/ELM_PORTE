'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { FiSave, FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Feature {
  title: string
  description: string
}

interface VisionContent {
  title: string
  subtitle: string
  description: string
  features: Feature[]
}

export default function HommesVisionPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [vision, setVision] = useState<VisionContent>({
    title: '',
    subtitle: '',
    description: '',
    features: [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' }
    ]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    } else if (status === 'authenticated') {
      fetchVision()
    }
  }, [status, router])

  const fetchVision = async () => {
    try {
      const response = await fetch('/api/hommes/vision')
      if (response.ok) {
        const data = await response.json()
        setVision(data)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch vision')
      }
    } catch (error) {
      console.error('Error fetching vision:', error)
      toast.error('Error fetching current vision')
    }
  }

  const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
    setVision(prev => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/hommes/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vision),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update vision')
      }

      toast.success('Vision updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update vision')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4C9296] border-t-transparent"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/hommes"
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-[#4C9296] shadow-sm ring-1 ring-inset ring-[#4C9296]/20 hover:bg-[#4C9296]/10 transition-colors"
            >
              <FiArrowLeft className="h-4 w-4" />
              <span>Retour</span>
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#4C9296]">Vision Management</h1>
              <p className="mt-1 text-gray-600">Manage the vision content for the men's ministry section.</p>
            </div>
          </div>
          <Button
            type="submit"
            form="vision-form"
            disabled={isLoading}
            className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>

        <form id="vision-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Main Content Section */}
          <div className="rounded-lg border-2 border-[#4C9296]/10 bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-serif font-bold text-[#4C9296]">Main Content</h2>
            <div className="grid gap-6">
              <div>
                <label htmlFor="title" className="text-sm font-medium text-[#4C9296]">
                  Title
                </label>
                <Input
                  id="title"
                  value={vision.title}
                  onChange={(e) => setVision(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="text-sm font-medium text-[#4C9296]">
                  Subtitle
                </label>
                <Input
                  id="subtitle"
                  value={vision.subtitle}
                  onChange={(e) => setVision(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  placeholder="Enter subtitle"
                />
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-medium text-[#4C9296]">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={vision.description}
                  onChange={(e) => setVision(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  placeholder="Enter description"
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="rounded-lg border-2 border-[#4C9296]/10 bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-serif font-bold text-[#4C9296]">Features</h2>
            <div className="grid gap-6">
              {vision.features.map((feature, index) => (
                <div key={index} className="rounded-lg border-2 border-[#4C9296]/10 p-6 shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="mb-4 text-lg font-medium text-[#4C9296]">Feature {index + 1}</h3>
                  <div className="grid gap-6">
                    <div>
                      <label className="text-sm font-medium text-[#4C9296]">
                        Title
                      </label>
                      <Input
                        value={feature.title}
                        onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                        className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                        placeholder="Enter feature title"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[#4C9296]">
                        Description
                      </label>
                      <Textarea
                        value={feature.description}
                        onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                        rows={3}
                        className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                        placeholder="Enter feature description"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 