import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Sermon from '@/models/Sermon';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
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

    // Get and validate the sermon ID
    const { id } = await Promise.resolve(context.params);
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid sermon ID' },
        { status: 400 }
      );
    }

    // First, unset any existing weekly message
    await Sermon.updateMany(
      { isWeeklyMessage: true },
      { 
        $set: { 
          isWeeklyMessage: false,
          weeklyMessageExpiry: null
        } 
      }
    );

    // Set the new weekly message
    const sermon = await Sermon.findByIdAndUpdate(
      id,
      {
        $set: {
          isWeeklyMessage: true,
          weeklyMessageExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      },
      { 
        new: true,
        runValidators: true // Ensure mongoose validation runs
      }
    );

    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Weekly message updated successfully', data: sermon },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting weekly message:', error);
    return NextResponse.json(
      { error: 'Failed to set weekly message' },
      { status: 500 }
    );
  }
} 