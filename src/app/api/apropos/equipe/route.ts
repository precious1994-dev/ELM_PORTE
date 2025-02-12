import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Team from '@/models/Team';

export const dynamic = 'force-dynamic';

// GET /api/apropos/equipe
export async function GET() {
  try {
    await dbConnect();
    const team = await Team.find().sort({ order: 1 });
    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/apropos/equipe
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé - Veuillez vous connecter' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();

    // Validate required fields with specific messages
    const requiredFields = {
      name: 'Le nom',
      role: 'Le rôle',
      image: "L'image"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${label} est requis`, field },
          { status: 400 }
        );
      }
    }

    // Get the highest order value
    const lastMember = await Team.findOne().sort({ order: -1 });
    const newOrder = lastMember ? lastMember.order + 1 : 0;

    // Create new team member
    const teamMember = await Team.create({
      ...data,
      order: newOrder,
    });

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error creating team member:', error);
    const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création du membre d'équipe";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/apropos/equipe
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json(
        { error: "L'ID du membre est requis" },
        { status: 400 }
      );
    }

    // Update team member
    const teamMember = await Team.findByIdAndUpdate(
      data.id,
      {
        name: data.name,
        role: data.role,
        image: data.image,
        order: data.order,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!teamMember) {
      return NextResponse.json(
        { error: "Membre d'équipe non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du membre d'équipe" },
      { status: 500 }
    );
  }
}

// DELETE /api/apropos/equipe
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "L'ID du membre est requis" },
        { status: 400 }
      );
    }

    await dbConnect();
    const teamMember = await Team.findByIdAndDelete(id);

    if (!teamMember) {
      return NextResponse.json(
        { error: "Membre d'équipe non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du membre d'équipe" },
      { status: 500 }
    );
  }
} 