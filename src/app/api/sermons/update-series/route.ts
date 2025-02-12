import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Sermon from '@/models/Sermon';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { oldSeriesName, newSeriesName } = await request.json();

    if (!oldSeriesName || !newSeriesName) {
      return NextResponse.json(
        { error: 'Les noms de série sont requis' },
        { status: 400 }
      );
    }

    // Update all sermons that have the old series name
    const result = await Sermon.updateMany(
      { series: oldSeriesName },
      { $set: { series: newSeriesName } }
    );

    return NextResponse.json({
      message: 'Sermons mis à jour avec succès',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating sermons series:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des sermons' },
      { status: 500 }
    );
  }
} 