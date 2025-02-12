import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import YouthSocials from '@/models/youthSocials'

export interface SocialNetwork {
  _id?: string
  platform: string
  url: string
  isActive: boolean
}

export async function GET() {
  try {
    await connectToDatabase()
    const socials = await YouthSocials.find()
    return NextResponse.json(socials)
  } catch (error) {
    console.error('Error fetching social networks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social networks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { platform, url, isActive } = await request.json()
    await connectToDatabase()
    
    const social = await YouthSocials.create({
      platform,
      url,
      isActive
    })

    return NextResponse.json(
      { message: 'Social network added', social },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating social network:', error)
    return NextResponse.json(
      { error: 'Failed to create social network' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { _id, platform, url, isActive } = await request.json()
    await connectToDatabase()
    
    const social = await YouthSocials.findByIdAndUpdate(
      _id,
      { platform, url, isActive },
      { new: true }
    )

    if (!social) {
      return NextResponse.json(
        { error: 'Social network not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Social network updated', social },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating social network:', error)
    return NextResponse.json(
      { error: 'Failed to update social network' },
      { status: 500 }
    )
  }
} 