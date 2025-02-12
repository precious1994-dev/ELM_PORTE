import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import ChildrenTeam from '@/models/childrenTeam'

// GET /api/enfants/equipe
export async function GET() {
  try {
    await dbConnect()
    console.log('Connected to MongoDB')
    
    const members = await ChildrenTeam.find().sort({ createdAt: -1 })
    console.log('Fetched team members:', members)
    
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching team members" },
      { status: 500 }
    )
  }
}

// POST /api/enfants/equipe
export async function POST(request: Request) {
  try {
    const { name, role, image } = await request.json()
    await dbConnect()
    
    const member = await ChildrenTeam.create({
      name,
      role,
      image,
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating team member" },
      { status: 500 }
    )
  }
}

// PUT /api/enfants/equipe/[id]
export async function PUT(request: Request) {
  try {
    await dbConnect()
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { error: "L'ID du membre est requis" },
        { status: 400 }
      );
    }

    // Find the team document
    const team = await ChildrenTeam.findOne();
    if (!team) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    // Find and update the member in the array
    const memberIndex = team.members.findIndex(
      (member: any) => member._id.toString() === data.id
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Update the member's data
    team.members[memberIndex] = {
      ...team.members[memberIndex].toObject(),
      name: data.name,
      role: data.role,
      image: data.image,
    };

    await team.save();

    return NextResponse.json(team.members[memberIndex]);
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

// DELETE /api/enfants/equipe
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "L'ID du membre est requis" },
        { status: 400 }
      );
    }

    await dbConnect();
    const team = await ChildrenTeam.findOne();

    if (!team) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    // Find the member index
    const memberIndex = team.members.findIndex(
      (member: any) => member._id.toString() === id
    );

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    // Remove the member from the array
    team.members.splice(memberIndex, 1);
    await team.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du membre" },
      { status: 500 }
    );
  }
} 