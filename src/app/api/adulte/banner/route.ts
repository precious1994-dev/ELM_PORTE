import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Define the Banner Schema
const BannerSchema = new mongoose.Schema({
  imageUrl: String,
  imagePublicId: String,
  welcome: String,
  title: String,
  subtitle: String,
  description: String,
  schedule: String,
  location: String,
  updatedAt: { type: Date, default: Date.now }
})

// Get the Banner model (or create if doesn't exist)
const Banner = mongoose.models.AdulteBanner || mongoose.model('AdulteBanner', BannerSchema)

export interface BannerContent {
  imageUrl: string
  welcome: string
  title: string
  subtitle: string
  description: string
  schedule: string
  location: string
}

export async function GET() {
  try {
    await connectToDatabase()
    const banner = await Banner.findOne().lean()

    if (!banner) {
      return NextResponse.json({
        imageUrl: '',
        welcome: '',
        title: '',
        subtitle: '',
        description: '',
        schedule: '',
        location: '',
      })
    }

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banner' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Validate request
    if (!request.body) {
      throw new Error('Request body is empty')
    }

    const formData = await request.formData()
    
    // Connect to database
    try {
      await connectToDatabase()
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      throw new Error('Failed to connect to database')
    }

    let imageUrl = formData.get('currentImageUrl') as string
    let imagePublicId = ''

    // Handle image upload if a new image is provided
    const image = formData.get('image') as File
    if (image) {
      try {
        // Get the current banner to delete old image if it exists
        const currentBanner = await Banner.findOne()
        if (currentBanner?.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(currentBanner.imagePublicId)
          } catch (cloudinaryError) {
            console.error('Error deleting old image:', cloudinaryError)
            // Continue with upload even if delete fails
          }
        }

        // Upload new image
        const arrayBuffer = await image.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = buffer.toString('base64')
        
        // Validate Cloudinary configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          throw new Error('Cloudinary configuration is missing')
        }

        const uploadResponse = await cloudinary.uploader.upload(
          `data:${image.type};base64,${base64Image}`,
          {
            folder: 'adulte',
            resource_type: 'auto',
          }
        )

        imageUrl = uploadResponse.secure_url
        imagePublicId = uploadResponse.public_id
      } catch (imageError) {
        console.error('Image processing error:', imageError)
        throw new Error('Failed to process image upload')
      }
    }

    // Prepare banner data
    const bannerData = {
      imageUrl,
      imagePublicId,
      welcome: formData.get('welcome'),
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: formData.get('description'),
      schedule: formData.get('schedule'),
      location: formData.get('location'),
      updatedAt: new Date(),
    }

    // Validate required fields
    if (!bannerData.imageUrl) {
      throw new Error('Image URL is required')
    }

    // Update or insert banner data
    try {
      const updatedBanner = await Banner.findOneAndUpdate(
        {},
        bannerData,
        { upsert: true, new: true }
      )

      return NextResponse.json(updatedBanner)
    } catch (dbError) {
      console.error('Database update error:', dbError)
      throw new Error('Failed to save banner data to database')
    }
  } catch (error) {
    console.error('Error updating banner:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update banner'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 