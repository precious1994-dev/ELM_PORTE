import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Sermon from '@/models/Sermon';
import Series from '@/models/Series';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all sermons
    const sermons = await Sermon.find({});
    const series = await Series.find({});

    let updatedCount = 0;
    let errors = [];

    // Create a map of series IDs to names for faster lookup
    const seriesMap = new Map(series.map(s => [s._id.toString(), s.name]));

    // Update each sermon
    for (const sermon of sermons) {
      try {
        if (sermon.series && mongoose.Types.ObjectId.isValid(sermon.series)) {
          const seriesName = seriesMap.get(sermon.series);
          if (seriesName) {
            await Sermon.updateOne(
              { _id: sermon._id },
              { $set: { series: seriesName } }
            );
            updatedCount++;
          }
        }
      } catch (error) {
        errors.push({
          sermonId: sermon._id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Migration completed',
      updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error during migration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 