import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Sermon from '@/models/Sermon';
import Series from '@/models/Series';
import mongoose from 'mongoose';

interface SeriesDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

// GET /api/series
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug log

    if (!session) {
      console.log('No session found'); // Debug log
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    console.log('Connecting to database...'); // Debug log
    await dbConnect();
    console.log('Connected to database'); // Debug log
    
    // Get all series with type assertion
    const allSeries = (await Series.find({}).lean()) as unknown as SeriesDocument[];
    console.log('Found series:', allSeries); // Debug log
    
    // Get sermon counts for each series
    const seriesWithCounts = await Promise.all(
      allSeries.map(async (serie) => {
        const count = await Sermon.countDocuments({ series: serie.name });
        return {
          _id: serie._id.toString(),
          name: serie.name,
          description: serie.description,
          sermonCount: count
        };
      })
    );
    
    console.log('Series with counts:', seriesWithCounts); // Debug log
    return NextResponse.json(seriesWithCounts);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors du chargement des séries' },
      { status: 500 }
    );
  }
}

// POST /api/series
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await dbConnect();

    let data;
    try {
      data = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    const { name } = data;
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Le nom de la série est requis et doit être une chaîne de caractères' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: 'Le nom de la série ne peut pas être vide' },
        { status: 400 }
      );
    }

    try {
      // Check for case-insensitive duplicate
      const existingSeries = await Series.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
      });

      if (existingSeries) {
        return NextResponse.json(
          { 
            error: 'Une série avec ce nom existe déjà',
            existingName: existingSeries.name
          },
          { status: 400 }
        );
      }

      // Create the new series
      const newSeries = await Series.create({
        name: trimmedName,
        description: data.description || '',
      });

      return NextResponse.json({ 
        _id: newSeries._id.toString(),
        name: newSeries.name,
        description: newSeries.description,
      });
    } catch (error: any) {
      console.error('Database operation error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        codeName: error.codeName,
      });

      if (error.code === 11000) {
        return NextResponse.json(
          { error: 'Une série avec ce nom existe déjà' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `Erreur lors de l'opération sur la base de données: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating series:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
    });

    return NextResponse.json(
      { error: 'Erreur lors de la création de la série' },
      { status: 500 }
    );
  }
} 