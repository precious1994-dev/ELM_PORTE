import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose, { Document } from 'mongoose';
import Horaire from '@/models/Horaire';

interface HoraireDocument extends Document {
  day: string;
  time: string;
  description: string;
  order: number;
}

interface LeanHoraire {
  _id: mongoose.Types.ObjectId;
  day: string;
  time: string;
  description: string;
  order: number;
  __v?: number;
}

// Add dynamic flag for Next.js API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/horaires
export async function GET() {
  try {
    await connectToDatabase();
    const horaires = (await Horaire.find().sort({ order: 1 }).lean()) as LeanHoraire[];

    // Transform the data to match frontend interface
    const transformedHoraires = horaires.map((horaire) => ({
      id: horaire._id.toString(),
      day: horaire.day,
      time: horaire.time,
      description: horaire.description,
      order: horaire.order
    }));

    return NextResponse.json(transformedHoraires || []);
  } catch (error: any) {
    console.error('Error fetching horaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des horaires' },
      { status: 500 }
    );
  }
}

// POST /api/horaires
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const json = await request.json();
    const { day, time, description, order } = json;

    // Validate required fields
    if (!day || !time || !description) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const newHoraire = new Horaire({
      day,
      time,
      description,
      order: order || 0
    });

    await newHoraire.save();

    const responseHoraire = {
      id: newHoraire._id.toString(),
      day,
      time,
      description,
      order: order || 0
    };

    return NextResponse.json(responseHoraire);
  } catch (error: any) {
    console.error('Error creating horaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'horaire' },
      { status: 500 }
    );
  }
}

// PUT /api/horaires
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { id, day, time, description, order } = await request.json();

    if (!id || !day || !time || !description) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const updatedHoraire = await Horaire.findByIdAndUpdate(
      id,
      { day, time, description, order },
      { new: true, runValidators: true }
    ).lean() as LeanHoraire;

    if (!updatedHoraire) {
      return NextResponse.json(
        { error: 'Horaire non trouvé' },
        { status: 404 }
      );
    }

    const responseHoraire = {
      id: updatedHoraire._id.toString(),
      day: updatedHoraire.day,
      time: updatedHoraire.time,
      description: updatedHoraire.description,
      order: updatedHoraire.order
    };

    return NextResponse.json(responseHoraire);
  } catch (error: any) {
    console.error('Error updating horaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'horaire' },
      { status: 500 }
    );
  }
}

// DELETE /api/horaires
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }

    const deletedHoraire = await Horaire.findByIdAndDelete(id);

    if (!deletedHoraire) {
      return NextResponse.json(
        { error: 'Horaire non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting horaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'horaire' },
      { status: 500 }
    );
  }
} 