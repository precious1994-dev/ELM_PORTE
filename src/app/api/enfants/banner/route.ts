import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import mongoose from 'mongoose'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const bannerSchema = new mongoose.Schema({
  imageUrl: String,
  imagePublicId: String,
  welcome: String,
  title: String,
  subtitle: String,
  description: String,
  schedule: String,
  location: String
}, { timestamps: true })

let Banner = mongoose.models.EnfantsBanner || mongoose.model('EnfantsBanner', bannerSchema)

export interface BannerContent {
  imageUrl: string
  imagePublicId?: string
  welcome: string
  title: string
  subtitle: string
  description: string
  schedule: string
  location: string
}

export async function GET() {
  try {
    await dbConnect()
    const banner = await Banner.findOne().lean()
    
    return NextResponse.json(banner || {
      imageUrl: '',
      imagePublicId: '',
      welcome: '',
      title: '',
      subtitle: '',
      description: '',
      schedule: '',
      location: ''
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banner content' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!request.body) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 })
    }

    // Connect to database
    try {
      await dbConnect()
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({ error: 'Failed to connect to database' }, { status: 500 })
    }

    // Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error('Error parsing form data:', error)
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 })
    }

    let imageUrl = formData.get('currentImageUrl') as string
    let imagePublicId = formData.get('currentImagePublicId') as string || ''

    // Handle image upload if a new image is provided
    const image = formData.get('image') as File
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

      try {
        // Convert image to base64
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`

        // Validate Cloudinary configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          throw new Error('Cloudinary configuration is missing')
        }

        // Delete old image if it exists
        if (imagePublicId) {
          try {
            await cloudinary.uploader.destroy(imagePublicId)
          } catch (deleteError) {
            console.error('Error deleting old image:', deleteError)
            // Continue with upload even if delete fails
          }
        }

        // Upload to Cloudinary with optimization
        const uploadResponse = await cloudinary.uploader.upload(base64Image, {
          folder: 'enfants',
          resource_type: 'image',
          transformation: [
            { width: 1920, height: 600, crop: 'fill', gravity: 'auto' },
            { quality: 'auto:good', fetch_format: 'auto' },
            { flags: 'progressive' }
          ]
        })

        imageUrl = uploadResponse.secure_url
        imagePublicId = uploadResponse.public_id
      } catch (uploadError) {
        console.error('Image upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload image to Cloudinary' }, { status: 500 })
      }
    }

    // Prepare banner data
    const content: BannerContent = {
      imageUrl: imageUrl || '',
      imagePublicId: imagePublicId,
      welcome: formData.get('welcome') as string || '',
      title: formData.get('title') as string || '',
      subtitle: formData.get('subtitle') as string || '',
      description: formData.get('description') as string || '',
      schedule: formData.get('schedule') as string || '',
      location: formData.get('location') as string || '',
    }

    try {
      // Update or insert the banner content
      const banner = await Banner.findOneAndUpdate(
        {},
        { $set: content },
        { upsert: true, new: true, runValidators: true }
      ).lean()

      if (!banner) {
        throw new Error('Failed to update banner content')
      }

      return NextResponse.json(banner)
    } catch (dbError) {
      console.error('Database update error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update banner in database' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update banner' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' 