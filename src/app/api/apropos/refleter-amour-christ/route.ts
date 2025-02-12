import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import RefleterAmour from '@/lib/models/RefleterAmour';

// Ensure route is not cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Value {
  id: string;
  title: string;
  description: string;
}

interface RefleterAmourSection {
  mainTitle: string;
  subtitle: string;
  description: string;
  values: Value[];
}

// GET /api/apropos/refleter-amour-christ
export async function GET() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Try to find existing content
    let refleterAmour = await RefleterAmour.findOne().lean();
    console.log('Existing content:', refleterAmour);

    // If no content exists, create default content
    if (!refleterAmour) {
      console.log('No existing content found, creating default content');
      const defaultContent = {
        mainTitle: "Refléter l'Amour du Christ",
        subtitle: "Notre Mission",
        description: "Notre engagement est de refléter l'amour du Christ dans tout ce que nous faisons, en créant un environnement bienveillant où chaque enfant peut grandir dans sa foi.",
        values: [
          {
            id: "1",
            title: "Un Accueil Chaleureux",
            description: "Nous croyons en l'importance d'accueillir chaque personne avec amour et bienveillance, comme le Christ nous a accueillis."
          },
          {
            id: "2",
            title: "Le Service aux Autres",
            description: "Suivant l'exemple du Christ, nous nous engageons à servir notre prochain et à répondre aux besoins de notre communauté."
          },
          {
            id: "3",
            title: "La Croissance Spirituelle",
            description: "Nous encourageons chacun à grandir dans sa relation avec Dieu et à développer une foi authentique et vivante."
          }
        ]
      };

      try {
        refleterAmour = await RefleterAmour.create(defaultContent);
        console.log('Created default content:', JSON.stringify(refleterAmour, null, 2));
      } catch (createError) {
        console.error('Error creating default content:', createError);
        throw createError;
      }
    }

    // Transform the response to match the expected structure
    const transformedData = {
      mainTitle: refleterAmour.mainTitle,
      subtitle: refleterAmour.subtitle,
      description: refleterAmour.description,
      values: refleterAmour.values || []
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

// PUT /api/apropos/refleter-amour-christ
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
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

    if (!Array.isArray(updatedContent.values)) {
      throw new Error('Values must be an array');
    }

    // Ensure each value has the required fields
    updatedContent.values.forEach((value: any, index: number) => {
      if (!value.id || !value.title || !value.description) {
        throw new Error(`Value at index ${index} is missing required fields`);
      }
    });

    // Ensure values are properly formatted
    const sanitizedContent = {
      mainTitle: updatedContent.mainTitle,
      subtitle: updatedContent.subtitle,
      description: updatedContent.description,
      values: updatedContent.values.map((value: any) => ({
        id: value.id,
        title: value.title,
        description: value.description
      }))
    };

    console.log('Sanitized content:', sanitizedContent);

    // Update or create the document
    const refleterAmour = await RefleterAmour.findOneAndUpdate(
      {},
      sanitizedContent,
      {
        new: true,
        upsert: true,
        runValidators: true,
        lean: true
      }
    );

    if (!refleterAmour) {
      throw new Error('Failed to update content');
    }

    console.log('Updated content in database:', refleterAmour);

    // Transform the response
    const transformedData = {
      mainTitle: refleterAmour.mainTitle,
      subtitle: refleterAmour.subtitle,
      description: refleterAmour.description,
      values: refleterAmour.values || []
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