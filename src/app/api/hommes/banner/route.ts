import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

// Define the Banner schema
const BannerSchema = new mongoose.Schema({
  imageUrl: String,
  welcome: String,
  title: String,
  subtitle: String,
  description: String,
  schedule: String,
  location: String,
  updatedAt: { type: Date, default: Date.now }
})

// Get the Banner model (create it if it doesn't exist)
const Banner = mongoose.models.HommesBanner || mongoose.model('HommesBanner', BannerSchema)

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
        location: ''
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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const formData = await req.formData()
    
    let imageUrl = formData.get('currentImageUrl') as string

    // Handle image upload if a new image is provided
    const image = formData.get('image') as File
    if (image) {
      // Delete old image if it exists
      if (imageUrl) {
        await deleteImage(imageUrl)
      }
      // Upload new image
      const uploadResult = await uploadImage(image)
      imageUrl = uploadResult.secure_url
    }

    const bannerData = {
      imageUrl,
      welcome: formData.get('welcome'),
      title: formData.get('title'),
      subtitle: formData.get('subtitle'),
      description: formData.get('description'),
      schedule: formData.get('schedule'),
      location: formData.get('location'),
      updatedAt: new Date()
    }

    const banner = await Banner.findOneAndUpdate(
      {},
      bannerData,
      { upsert: true, new: true }
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