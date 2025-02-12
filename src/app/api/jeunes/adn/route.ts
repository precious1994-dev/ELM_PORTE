import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import YouthADN from '@/models/youthADN'
import type { AdnContent } from '@/models/youthADN'

const defaultContent: AdnContent = {
  mainTitle: 'Notre Vision pour les Jeunes',
  subtitle: 'Notre ADN',
  description: 'Nous croyons que chaque jeune a un potentiel unique et un appel spécial de Dieu. Notre mission est de les accompagner dans leur croissance spirituelle.',
  cards: [
    {
      icon: 'Plus',
      title: 'Croissance Spirituelle',
      description: 'Des études bibliques adaptées aux jeunes, des temps de prière dynamiques et des moments de louange contemporains pour grandir dans la foi.',
    },
    {
      icon: 'Users',
      title: 'Communauté & Amitié',
      description: 'Un environnement accueillant où tu peux créer des liens authentiques, partager ta vie et grandir ensemble dans la foi.',
    },
    {
      icon: 'Zap',
      title: 'Leadership & Service',
      description: 'Des opportunités pour découvrir et développer tes dons, prendre des responsabilités et servir dans l\'église et la communauté.',
    },
  ],
}

export async function GET() {
  try {
    await connectToDatabase();
    
    let content = await YouthADN.findOne();
    
    if (!content) {
      content = await YouthADN.create(defaultContent);
    }
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching ADN content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Parse and validate content
    const content = await request.json();

    // Validate content structure
    if (!content || typeof content !== 'object') {
      return NextResponse.json(
        { error: 'Invalid content format' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['mainTitle', 'subtitle', 'description', 'cards'];
    for (const field of requiredFields) {
      if (!(field in content)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate cards array
    if (!Array.isArray(content.cards)) {
      return NextResponse.json(
        { error: 'Cards must be an array' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Update content using findOneAndUpdate
    const updatedContent = await YouthADN.findOneAndUpdate(
      {},  // empty filter to match any document
      content,
      { upsert: true, new: true }  // create if doesn't exist, return updated doc
    );

    if (!updatedContent) {
      throw new Error('Failed to update content');
    }

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating ADN content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
} 