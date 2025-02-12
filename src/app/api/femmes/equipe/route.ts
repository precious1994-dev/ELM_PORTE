import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import FemmesEquipe from '@/models/FemmesEquipe'

export async function GET() {
  try {
    await dbConnect()
    const equipe = await FemmesEquipe.findOne({})
    return NextResponse.json(equipe || {})
  } catch (error) {
    console.error('Error in GET /api/femmes/equipe:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const data = await request.json()

    const equipe = await FemmesEquipe.findOneAndUpdate(
      {},
      { ...data },
      { upsert: true, new: true }
    )

    return NextResponse.json(equipe)
  } catch (error) {
    console.error('Error in PUT /api/femmes/equipe:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 