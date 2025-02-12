import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
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
const Banner = mongoose.models.AboutBanner || mongoose.model('AboutBanner', BannerSchema)

export interface BannerContent {
  imageUrl: string
  welcome: string
  title: string
  subtitle: string
  description: string
  schedule: string
  location: string
}

// GET current banner
export async function GET() {
  try {
    await connectToDatabase()
    const banner = await Banner.findOne().lean()

    if (!banner) {
      return NextResponse.json({
        imageUrl: '/images/about-banner.jpg',
        welcome: 'Découvrez Notre Histoire',
        title: 'À Propos de Nous',
        subtitle: 'Notre Mission et Notre Vision',
        description: 'Découvrez notre histoire, notre équipe et notre engagement envers la communauté.',
        schedule: 'Horaires des Services',
        location: 'Notre Église'
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

// POST new banner
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    
    // Connect to database
    await connectToDatabase()

    let imageUrl = formData.get('currentImageUrl') as string
    let imagePublicId = ''

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

      // Convert image to base64
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`

      // Upload to Cloudinary with optimization
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: 'apropos',
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
      imagePublicId = uploadResponse.public_id
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
      updatedAt: new Date()
    }

    // Update or create banner
    const banner = await Banner.findOneAndUpdate(
      {},
      bannerData,
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true 
      }
    ).lean()

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic' 