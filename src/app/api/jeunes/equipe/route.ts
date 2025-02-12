import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TeamMember from "../../../../models/TeamMember";

export async function GET() {
  try {
    await connectToDatabase();
    const members = await TeamMember.find().sort({ createdAt: -1 });
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, role, image, description } = await request.json();
    
    await connectToDatabase();
    
    const newMember = await TeamMember.create({
      name,
      role,
      image,
      description
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create team member" },
      { status: 500 }
    );
  }
} 