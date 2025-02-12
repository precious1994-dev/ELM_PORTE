import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import ContactInformations from '@/models/ContactInformations'

export async function GET() {
  try {
    await dbConnect()
    let contactInfo = await ContactInformations.findOne()
    
    if (!contactInfo) {
      contactInfo = await ContactInformations.create({})
    }
    
    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error fetching contact information:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact information' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()
    const data = await request.json()

    const contactInfo = await ContactInformations.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true }
    )

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error updating contact information:', error)
    return NextResponse.json(
      { error: 'Failed to update contact information' },
      { status: 500 }
    )
  }
} 