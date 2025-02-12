import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import History from '@/lib/models/History';
import type { IHistory } from '@/lib/models/History';

// Create schema for history
const historySchema = new mongoose.Schema({
  mainTitle: {
    type: String,
    required: true,
    default: "Notre Histoire"
  },
  subtitle: {
    type: String,
    required: true,
    default: "Un Héritage de Foi et d'Amour"
  },
  description: {
    type: String,
    required: true,
    default: "Depuis notre création, nous nous engageons à nourrir la foi des plus jeunes à travers un enseignement biblique adapté et des activités enrichissantes."
  },
  items: [{
    id: { type: String, required: true },
    year: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  }]
}, {
  timestamps: true,
  strict: true,
  collection: 'histories'
});

// Initialize model
const HistoryModel = mongoose.models.History || mongoose.model('History', historySchema);

export async function GET() {
  try {
    await connectToDatabase();

    let history = await History.findOne().lean();
    
    if (!history) {
      const defaultHistory: IHistory = {
        mainTitle: "Notre Histoire",
        subtitle: "Un Héritage de Foi et d'Amour",
        description: "Depuis notre création, nous nous engageons à nourrir la foi des plus jeunes à travers un enseignement biblique adapté et des activités enrichissantes.",
        items: [
          {
            id: "1",
            year: "2020",
            title: "Création du Ministère",
            description: "Lancement de notre ministère des enfants avec une vision claire pour l'éducation chrétienne."
          },
          {
            id: "2",
            year: "2021",
            title: "Développement des Programmes",
            description: "Mise en place de programmes adaptés à chaque groupe d'âge."
          },
          {
            id: "3",
            year: "2022",
            title: "Formation des Moniteurs",
            description: "Renforcement de notre équipe avec des formations spécialisées."
          },
          {
            id: "4",
            year: "2023",
            title: "Innovation et Croissance",
            description: "Introduction de nouvelles méthodes d'enseignement et expansion des activités."
          }
        ]
      };

      history = await History.create(defaultHistory);
    }

    return NextResponse.json(history, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Error in history GET route:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch history data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();

    const updatedContent = await request.json();

    if (!updatedContent || typeof updatedContent !== 'object') {
      throw new Error('Invalid update data provided');
    }

    const history = await History.findOneAndUpdate(
      {},
      { $set: updatedContent },
      {
        new: true,
        upsert: true,
        runValidators: true,
        lean: true
      }
    );

    if (!history) {
      throw new Error('Failed to update history data');
    }

    return NextResponse.json(history, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Error in history PUT route:', error);
    return NextResponse.json(
      {
        error: 'Failed to update history data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 