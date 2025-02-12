import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Activity {
  title: string;
  description: string;
  imageUrl: string;
  schedule: string;
  location: string;
}

interface ActivitiesData {
  sectionTitle: string;
  subtitle: string;
  description: string;
  activities: Activity[];
  updatedAt?: Date;
}

// Define the Activities schema
const ActivitiesSchema = new mongoose.Schema<ActivitiesData>({
  sectionTitle: String,
  subtitle: String,
  description: String,
  activities: [{
    title: String,
    description: String,
    imageUrl: String,
    schedule: String,
    location: String
  }],
  updatedAt: { type: Date, default: Date.now }
})

// Get the Activities model (create it if it doesn't exist)
const Activities = mongoose.models.HommesActivities || mongoose.model<ActivitiesData>('HommesActivities', ActivitiesSchema)

export async function GET() {
  try {
    await connectToDatabase()
    const activities = await Activities.findOne().lean() as ActivitiesData | null
    
    // Debug log
    console.log('Raw activities from DB:', activities)
    
    // Ensure we return a consistent data structure even if no data exists
    const response: ActivitiesData = {
      sectionTitle: activities?.sectionTitle || '',
      subtitle: activities?.subtitle || '',
      description: activities?.description || '',
      activities: activities?.activities?.map(activity => ({
        ...activity,
        imageUrl: activity.imageUrl || '',
        title: activity.title || '',
        description: activity.description || '',
        schedule: activity.schedule || '',
        location: activity.location || ''
      })) || []
    }

    // Debug log
    console.log('Processed activities response:', response)

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
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
    const contentStr = formData.get('content')

    if (!contentStr || typeof contentStr !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content data' },
        { status: 400 }
      )
    }

    const content = JSON.parse(contentStr) as ActivitiesData

    const result = await Activities.findOneAndUpdate(
      {},
      {
        sectionTitle: content.sectionTitle,
        subtitle: content.subtitle,
        description: content.description,
        activities: content.activities,
        updatedAt: new Date()
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    ).lean() as ActivitiesData | null

    if (!result) {
      throw new Error('Failed to save activities')
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error updating activities:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update activities' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    )
  }
}

export const dynamic = 'force-dynamic' 