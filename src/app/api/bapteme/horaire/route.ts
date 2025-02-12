import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { BaptemeSchedule } from '@/models/BaptemeModels'

export interface ScheduleContent {
  title: string
  date: Date
  time: string
  location: string
  description: string
  maxParticipants: number
  currentParticipants: number
  isActive: boolean
}

export async function GET() {
  try {
    await connectToDatabase()
    const schedules = await BaptemeSchedule.find({ isActive: true }).sort({ date: 1 })
    return NextResponse.json(schedules || [])
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await connectToDatabase()
    
    const schedule = await BaptemeSchedule.create(body)
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    await connectToDatabase()
    
    const schedule = await BaptemeSchedule.findByIdAndUpdate(body._id, body, { new: true })
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    await connectToDatabase()
    await BaptemeSchedule.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 