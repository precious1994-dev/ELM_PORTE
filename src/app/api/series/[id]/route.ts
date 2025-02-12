import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Series from '@/models/Series';
import Sermon from '@/models/Sermon';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/series/[id] - Get a single series
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const series = await Series.findById(params.id);
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }
    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ error: 'Error fetching series' }, { status: 500 });
  }
}

// PUT /api/series/[id] - Update a series
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const series = await Series.findByIdAndUpdate(params.id, data, { new: true });
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    return NextResponse.json(series);
  } catch (error) {
    console.error('Error updating series:', error);
    return NextResponse.json({ error: 'Error updating series' }, { status: 500 });
  }
}

// DELETE /api/series/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const series = await Series.findByIdAndDelete(params.id);

    if (!series) {
      return NextResponse.json(
        { error: 'Series not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Series deleted successfully' });
  } catch (error) {
    console.error('Error deleting series:', error);
    return NextResponse.json(
      { error: 'Error deleting series' },
      { status: 500 }
    );
  }
} 