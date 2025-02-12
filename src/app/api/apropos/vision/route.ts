import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Vision from '@/lib/models/Vision';

// GET /api/apropos/vision
export async function GET() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Try to find existing content
    let vision = await Vision.findOne().lean();
    console.log('Existing content:', vision);

    // If no content exists, create default content
    if (!vision) {
      console.log('No existing content found, creating default content');
      const defaultContent = {
        mainTitle: "Notre Vision",
        subtitle: "Notre Vision pour l'Avenir",
        description: "Notre vision est de créer un environnement où chaque personne peut grandir spirituellement et s'épanouir dans sa relation avec Dieu.",
        points: [
          {
            id: "1",
            title: "Une Communauté Vibrante",
            description: "Construire une communauté dynamique où chacun peut trouver sa place et grandir dans sa foi."
          },
          {
            id: "2",
            title: "Formation Spirituelle",
            description: "Offrir une formation biblique solide pour équiper chaque membre dans sa marche avec Dieu."
          },
          {
            id: "3",
            title: "Impact Local",
            description: "Être une lumière dans notre communauté locale à travers des actions concrètes d'amour et de service."
          }
        ]
      };

      try {
        vision = await Vision.create(defaultContent);
        console.log('Created default content:', JSON.stringify(vision, null, 2));
      } catch (createError) {
        console.error('Error creating default content:', createError);
        throw createError;
      }
    }

    // Transform the response to match the expected structure
    const transformedData = {
      mainTitle: vision.mainTitle,
      subtitle: vision.subtitle,
      description: vision.description,
      points: vision.points || []
    };

    console.log('Sending response:', JSON.stringify(transformedData, null, 2));

    return NextResponse.json(transformedData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Error in GET endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch/create data',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT /api/apropos/vision
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    const updatedContent = await request.json();
    console.log('Received content:', updatedContent);

    if (!updatedContent || typeof updatedContent !== 'object') {
      throw new Error('Invalid update data provided');
    }

    // Validate the content structure
    if (!updatedContent.mainTitle || !updatedContent.subtitle || !updatedContent.description) {
      throw new Error('Missing required fields');
    }

    if (!Array.isArray(updatedContent.points)) {
      throw new Error('Points must be an array');
    }

    // Ensure each point has the required fields
    updatedContent.points.forEach((point: any, index: number) => {
      if (!point.id || !point.title || !point.description) {
        throw new Error(`Point at index ${index} is missing required fields`);
      }
    });

    // Ensure points are properly formatted
    const sanitizedContent = {
      mainTitle: updatedContent.mainTitle,
      subtitle: updatedContent.subtitle,
      description: updatedContent.description,
      points: updatedContent.points.map((point: any) => ({
        id: point.id,
        title: point.title,
        description: point.description
      }))
    };

    console.log('Sanitized content:', sanitizedContent);

    // Update or create the document
    const vision = await Vision.findOneAndUpdate(
      {},
      sanitizedContent,
      {
        new: true,
        upsert: true,
        runValidators: true,
        lean: true
      }
    );

    if (!vision) {
      throw new Error('Failed to update content');
    }

    console.log('Updated content in database:', vision);

    // Transform the response
    const transformedData = {
      mainTitle: vision.mainTitle,
      subtitle: vision.subtitle,
      description: vision.description,
      points: vision.points || []
    };

    console.log('Sending response:', transformedData);

    return NextResponse.json(transformedData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Error in PUT endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to update data',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 