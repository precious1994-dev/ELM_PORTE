import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Horaire, { IHoraire } from '@/models/Horaire';
import mongoose from 'mongoose';

interface TransformedHoraire {
  id: string;
  day: string;
  time: string;
  description: string;
  order: number;
}

type MongoHoraire = {
  _id: mongoose.Types.ObjectId;
  day: string;
  time: string;
  description: string;
  order: number;
};

function assertIsMongoHoraire(obj: unknown): asserts obj is MongoHoraire {
  if (typeof obj !== 'object' || obj === null) throw new Error('Not a Horaire object');
  const horaire = obj as any;
  if (!horaire._id || !horaire.day || !horaire.time || !horaire.description || typeof horaire.order !== 'number') {
    throw new Error('Invalid Horaire object structure');
  }
}

// PUT /api/horaires/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json(
      { error: 'Schedule ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectToDatabase();
    
    const updatedSchedule = await Horaire.findByIdAndUpdate(
      params.id,
      data,
      { new: true }
    ).lean();

    if (!updatedSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    assertIsMongoHoraire(updatedSchedule);

    // Fetch all horaires to broadcast the updated list
    const rawHoraires = await Horaire.find().sort({ order: 1 }).lean();
    const updatedHoraires = rawHoraires.map(horaire => {
      assertIsMongoHoraire(horaire);
      return horaire;
    });

    // Transform the data for broadcasting
    const transformedHoraires: TransformedHoraire[] = updatedHoraires.map(horaire => ({
      id: horaire._id.toString(),
      day: horaire.day,
      time: horaire.time,
      description: horaire.description,
      order: horaire.order
    }));

    // Broadcast the update to all connected clients
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/horaires/sse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedHoraires),
      });

      if (!response.ok) {
        console.error('Failed to broadcast horaires update');
      }
    } catch (error) {
      console.error('Error broadcasting horaires update:', error);
    }

    return NextResponse.json({
      id: updatedSchedule._id.toString(),
      day: updatedSchedule.day,
      time: updatedSchedule.time,
      description: updatedSchedule.description,
      order: updatedSchedule.order
    } as TransformedHoraire);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// DELETE /api/horaires/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json(
      { error: 'Schedule ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const deletedSchedule = await Horaire.findByIdAndDelete(params.id).lean();

    if (!deletedSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    assertIsMongoHoraire(deletedSchedule);

    // Fetch all horaires to broadcast the updated list
    const rawHoraires = await Horaire.find().sort({ order: 1 }).lean();
    const updatedHoraires = rawHoraires.map(horaire => {
      assertIsMongoHoraire(horaire);
      return horaire;
    });

    // Transform the data for broadcasting
    const transformedHoraires: TransformedHoraire[] = updatedHoraires.map(horaire => ({
      id: horaire._id.toString(),
      day: horaire.day,
      time: horaire.time,
      description: horaire.description,
      order: horaire.order
    }));

    // Broadcast the update to all connected clients
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/horaires/sse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedHoraires),
      });

      if (!response.ok) {
        console.error('Failed to broadcast horaires update');
      }
    } catch (error) {
      console.error('Error broadcasting horaires update:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
} 