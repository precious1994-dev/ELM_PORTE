import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Sermon from '@/models/Sermon';

// GET /api/sermons/[id] - Get a single sermon
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const sermon = await Sermon.findById(id);
    
    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sermon);
  } catch (error) {
    console.error('Error fetching sermon:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la prédication' },
      { status: 500 }
    );
  }
}

// PUT /api/sermons/[id] - Update a sermon
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'speaker', 'date', 'passage', 'description', 'duration', 'image', 'youtubeUrl'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const updatedSermon = await Sermon.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    );

    if (!updatedSermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSermon);
  } catch (error) {
    console.error('Error updating sermon:', error);
    return NextResponse.json(
      { error: 'Failed to update sermon' },
      { status: 500 }
    );
  }
}

// PATCH /api/sermons/[id] - Update video URL only
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();

    // Only allow updating videoUrl
    const updatedSermon = await Sermon.findByIdAndUpdate(
      id,
      { youtubeUrl: body.youtubeUrl },
      { new: true }
    );

    if (!updatedSermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSermon);
  } catch (error) {
    console.error('Error updating sermon:', error);
    return NextResponse.json(
      { error: 'Failed to update sermon' },
      { status: 500 }
    );
  }
}

// DELETE /api/sermons/[id] - Delete a sermon
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await context.params;
    const deletedSermon = await Sermon.findByIdAndDelete(id);

    if (!deletedSermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Sermon deleted successfully' });
  } catch (error) {
    console.error('Error deleting sermon:', error);
    return NextResponse.json(
      { error: 'Failed to delete sermon' },
      { status: 500 }
    );
  }
} 