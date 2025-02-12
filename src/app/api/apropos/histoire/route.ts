import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import History from '@/lib/models/History';

// Ensure route is not cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HistoryItem {
  id: string;
  title: string;
  description: string;
  year: string;
}

interface HistorySection {
  mainTitle: string;
  subtitle: string;
  description: string;
  items: HistoryItem[];
}

// GET /api/apropos/histoire
export async function GET() {
  try {
    await connectToDatabase();

    let history = await History.findOne().lean();
    
    if (!history) {
      const defaultHistory = {
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

    // Transform old data structure if needed
    const transformedHistory = {
      mainTitle: history.mainTitle,
      subtitle: history.subtitle,
      description: history.description,
      items: history.items || []
    };

    return NextResponse.json(transformedHistory, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch history data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// PUT /api/apropos/histoire
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();

    const updatedContent = await request.json();

    if (!updatedContent || typeof updatedContent !== 'object') {
      throw new Error('Invalid update data provided');
    }

    // Ensure the data structure is correct
    const sanitizedContent = {
      mainTitle: updatedContent.mainTitle,
      subtitle: updatedContent.subtitle,
      description: updatedContent.description,
      items: updatedContent.items?.map((item: HistoryItem) => ({
        id: item.id,
        year: item.year,
        title: item.title,
        description: item.description
      }))
    };

    const history = await History.findOneAndUpdate(
      {},
      { $set: sanitizedContent },
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

    // Transform the response to match the expected structure
    const transformedHistory = {
      mainTitle: history.mainTitle,
      subtitle: history.subtitle,
      description: history.description,
      items: history.items || []
    };

    return NextResponse.json(transformedHistory, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Error updating history:', error);
    return NextResponse.json(
      {
        error: 'Failed to update history data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 