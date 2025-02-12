import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { BaptemeBanner } from '@/models/BaptemeModels'
import { v2 as cloudinary } from 'cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface BannerContent {
  title: string
  subtitle: string
  description: string
  imageUrl: string
  isActive: boolean
}

export async function GET() {
  try {
    const mongoose = await connectToDatabase()
    const banner = await BaptemeBanner.findOne({ isActive: true }).lean()
    return NextResponse.json(banner || {})
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const mongoose = await connectToDatabase()
    
    const formData = await request.formData()
    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const description = formData.get('description') as string
    const currentImageUrl = formData.get('currentImageUrl') as string
    const image = formData.get('image') as File | null
    
    let imageUrl = currentImageUrl

    // Handle image upload if a new image is provided
    if (image) {
      // Validate file type
      if (!image.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'File must be an image' },
          { status: 400 }
        )
      }

      // Validate file size (5MB limit)
      if (image.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image size should be less than 5MB' },
          { status: 400 }
        )
      }

      // Convert image to base64
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`

      // Upload to Cloudinary with optimization
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: 'bapteme',
        public_id: 'banner',
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 600, crop: 'fill', gravity: 'auto' },
          { quality: 'auto:good', fetch_format: 'auto' },
          { flags: 'progressive' }
        ]
      })

      imageUrl = uploadResponse.secure_url
    }

    // Update or create banner
    const banner = await BaptemeBanner.findOneAndUpdate(
      { isActive: true },
      {
        title,
        subtitle,
        description,
        imageUrl,
        isActive: true,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true 
      }
    ).lean()

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const mongoose = await connectToDatabase()
    
    const banner = await BaptemeBanner.findByIdAndUpdate(
      body._id,
      { ...body, updatedAt: new Date() },
      { new: true }
    ).lean()
    
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    const mongoose = await connectToDatabase()
    await BaptemeBanner.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Banner deleted successfully' })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 