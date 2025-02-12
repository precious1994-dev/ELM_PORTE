import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import RefleterAmour from '@/models/RefleterAmour';

export const dynamic = 'force-dynamic';

// GET /api/apropos/refleter-amour
export async function GET() {
  try {
    await dbConnect();
    const content = await RefleterAmour.findOne().sort({ createdAt: -1 });

    if (!content) {
      // Return default data if none exists
      return NextResponse.json({
        title: "Refléter l'Amour du Christ",
        subtitle: "Notre Mission et Notre Engagement",
        description: "En tant que communauté chrétienne, nous nous efforçons de refléter l'amour du Christ dans tout ce que nous faisons.",
        content: [
          {
            title: "Un Accueil Chaleureux",
            description: "Nous croyons en l'importance d'accueillir chaque personne avec amour et bienveillance, comme le Christ nous a accueillis.",
          },
          {
            title: "Le Service aux Autres",
            description: "Suivant l'exemple du Christ, nous nous engageons à servir notre prochain et à répondre aux besoins de notre communauté.",
          },
          {
            title: "La Croissance Spirituelle",
            description: "Nous encourageons chacun à grandir dans sa relation avec Dieu et à développer une foi authentique et vivante.",
          }
        ]
      });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching refleter amour content:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/apropos/refleter-amour
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description || !data.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate content array
    if (!Array.isArray(data.content) || data.content.length === 0) {
      return NextResponse.json(
        { error: 'Content must be a non-empty array' },
        { status: 400 }
      );
    }

    for (const item of data.content) {
      if (!item.title || !item.description) {
        return NextResponse.json(
          { error: 'Each content item must have a title and description' },
          { status: 400 }
        );
      }
    }

    // Update or create content
    const content = await RefleterAmour.findOneAndUpdate(
      {}, // Empty filter to match any document
      {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        content: data.content,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error updating refleter amour content:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 