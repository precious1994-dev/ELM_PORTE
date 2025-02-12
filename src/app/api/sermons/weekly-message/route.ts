import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Sermon from '@/models/Sermon'

export async function GET() {
  try {
    await dbConnect()

    // Find the current weekly message
    const weeklyMessage = await Sermon.findOne({ 
      isWeeklyMessage: true,
      weeklyMessageExpiry: { $gt: new Date() }
    })

    if (!weeklyMessage) {
      return NextResponse.json(null)
    }

    return NextResponse.json(weeklyMessage)
  } catch (error) {
    console.error('Error fetching weekly message:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weekly message' },
      { status: 500 }
    )
  }
} 