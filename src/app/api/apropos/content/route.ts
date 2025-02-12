import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Create schema for about page content
const aboutSchema = new mongoose.Schema({
  banner: {
    title: {
      type: String,
      required: true,
      default: "À Propos de Nous"
    },
    subtitle: {
      type: String,
      required: true,
      default: "Notre Mission et Notre Vision"
    },
    description: {
      type: String,
      required: true,
      default: "Découvrez notre histoire, notre équipe et notre engagement envers la communauté."
    },
    imageUrl: {
      type: String,
      required: true,
      default: "/images/about-banner.jpg"
    }
  },
  team: {
    title: {
      type: String,
      required: true,
      default: "Notre Équipe"
    },
    subtitle: {
      type: String,
      required: true,
      default: "Des Mentors Passionnés pour Guider nos Enfants"
    },
    description: {
      type: String,
      required: true,
      default: "Une équipe dévouée qui s'engage à servir et à guider notre communauté."
    },
    members: [{
      name: { type: String, required: true },
      role: { type: String, required: true },
      description: { type: String, required: true },
      imageUrl: { type: String, required: true }
    }]
  }
}, {
  timestamps: true
});

// Initialize model
const About = mongoose.models.About || mongoose.model('About', aboutSchema);

export async function GET() {
  try {
    await connectToDatabase();

    let content = await About.findOne().lean();
    
    if (!content) {
      const defaultContent = {
        banner: {
          title: "À Propos de Nous",
          subtitle: "Notre Mission et Notre Vision",
          description: "Découvrez notre histoire, notre équipe et notre engagement envers la communauté.",
          imageUrl: "/images/about-banner.jpg"
        },
        team: {
          title: "Notre Équipe",
          subtitle: "Des Mentors Passionnés pour Guider nos Enfants",
          description: "Une équipe dévouée qui s'engage à servir et à guider notre communauté.",
          members: []
        }
      };

      content = await About.create(defaultContent);
    }

    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch about content',
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

    const content = await About.findOneAndUpdate(
      {},
      { $set: updatedContent },
      {
        new: true,
        upsert: true,
        runValidators: true,
        lean: true
      }
    );

    if (!content) {
      throw new Error('Failed to update about content');
    }

    return NextResponse.json(content, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Error updating about content:', error);
    return NextResponse.json(
      {
        error: 'Failed to update about content',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 