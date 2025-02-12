import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Homepage from '@/models/Homepage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';

interface Slide {
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET homepage content
export async function GET() {
  try {
    await dbConnect();
    const homepage = await Homepage.findOne().sort({ createdAt: -1 });
    
    if (!homepage) {
      // Return default data if none exists
      return NextResponse.json({
        // Vision Section
        mainTitle: 'Notre Vision',
        subtitle: 'Foi · Communauté · Service',
        description: 'Ancrés dans la Parole de Dieu, nous aspirons à être une communauté vibrante qui inspire, équipe et mobilise chaque personne à vivre pleinement sa foi et à avoir un impact transformateur dans notre société.',
        items: [
          {
            icon: 'FaPrayingHands',
            title: 'Foi',
            description: 'Grandir ensemble dans la connaissance de Dieu et dans notre relation avec Lui.',
          },
          {
            icon: 'FaUsers',
            title: 'Communauté',
            description: 'Créer des liens authentiques et soutenir chacun dans son parcours de vie.',
          },
          {
            icon: 'FaHandsHelping',
            title: 'Service',
            description: "S'engager à servir notre prochain et à faire une différence dans notre société.",
          },
        ],
        // Slider Section
        slides: [
          {
            title: 'Bienvenue à Notre Église',
            description: 'Un lieu de foi, d\'espérance et d\'amour',
            imageUrl: '/images/church1.jpg',
            buttonText: 'En savoir plus',
            buttonLink: '/a-propos'
          },
          {
            title: 'Rejoignez Notre Communauté',
            description: 'Découvrez une communauté vivante et accueillante',
            imageUrl: '/images/church2.jpg',
            buttonText: 'Nos activités',
            buttonLink: '/evenements'
          },
          {
            title: 'Grandir Dans La Foi',
            description: 'Des enseignements inspirants pour votre vie spirituelle',
            imageUrl: '/images/church3.jpg',
            buttonText: 'Nos prédications',
            buttonLink: '/predications'
          }
        ]
      });
    }

    return NextResponse.json(homepage);
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT homepage content
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
    
    // Handle slider section update
    if (data.sliderSection) {
      // Validate slides
      if (!Array.isArray(data.sliderSection.slides)) {
        return NextResponse.json(
          { error: 'Invalid slides data' },
          { status: 400 }
        );
      }

      for (const slide of data.sliderSection.slides) {
        if (!slide.title || !slide.description || !slide.imageUrl) {
          return NextResponse.json(
            { error: 'Missing required fields in slide' },
            { status: 400 }
          );
        }
      }

      // Update slider section
      const homepage = await Homepage.findOneAndUpdate(
        {}, // Empty filter to match any document
        {
          'sliderSection.slides': data.sliderSection.slides
        },
        {
          new: true, // Return the updated document
          upsert: true, // Create if doesn't exist
          setDefaultsOnInsert: true,
        }
      );

      return NextResponse.json(homepage);
    }

    // Handle full homepage update
    if (!data.mainTitle || !data.description || !data.items || !data.slides) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update or create homepage data
    const homepage = await Homepage.findOneAndUpdate(
      {}, // Empty filter to match any document
      {
        // Vision Section
        mainTitle: data.mainTitle,
        subtitle: data.subtitle,
        description: data.description,
        items: data.items,
        // Slider Section
        slides: data.slides,
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if doesn't exist
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json(homepage);
  } catch (error) {
    console.error('Error updating homepage data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 