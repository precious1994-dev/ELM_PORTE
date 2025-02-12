'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ImageUpload } from '@/components/ui/image-upload'
import { Loader2 } from 'lucide-react'

export default function EventsBannerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [bannerData, setBannerData] = useState({
    imageUrl: '',
  })

  useEffect(() => {
    fetchBanner()
  }, [])

  const fetchBanner = async () => {
    try {
      const response = await fetch('/api/events/banner')
      if (!response.ok) {
        throw new Error('Failed to fetch banner')
      }
      const data = await response.json()
      if (data) {
        setBannerData({
          imageUrl: data.imageUrl || '',
        })
      }
    } catch (error) {
      console.error('Error fetching banner:', error)
      toast.error('Failed to fetch banner data')
    } finally {
      setIsFetching(false)
    }
  }

  const handleImageChange = (url: string) => {
    setBannerData(prev => ({
      ...prev,
      imageUrl: url
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/events/banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update banner')
      }

      // Update local state with the response data
      if (data.imageUrl) {
        setBannerData({
          imageUrl: data.imageUrl
        })
      }

      toast.success('Banner updated successfully')
      router.refresh()
      await fetchBanner() // Refetch to ensure we have the latest data
    } catch (error) {
      console.error('Error updating banner:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update banner')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Events Banner Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              value={bannerData.imageUrl}
              onChange={handleImageChange}
              onUploadError={(error) => toast.error(error)}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Banner'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 