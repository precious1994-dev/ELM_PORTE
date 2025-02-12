import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { BaptemeTeam } from '@/models/BaptemeModels'

export interface TeamMemberContent {
  name: string
  role: string
  imageUrl: string
  description: string
  order: number
  isActive: boolean
}

export async function GET() {
  try {
    await connectToDatabase()
    const team = await BaptemeTeam.find({ isActive: true }).sort({ order: 1 })
    return NextResponse.json(team || [])
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await connectToDatabase()
    
    const member = await BaptemeTeam.create(body)
    return NextResponse.json(member)
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    await connectToDatabase()
    
    const member = await BaptemeTeam.findByIdAndUpdate(body._id, body, { new: true })
    return NextResponse.json(member)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    await connectToDatabase()
    await BaptemeTeam.findByIdAndDelete(id)
    
    return NextResponse.json({ message: 'Team member deleted successfully' })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 