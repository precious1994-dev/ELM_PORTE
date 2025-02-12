import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import TeamMember from "../../../../../models/TeamMember";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { name, role, image, description } = await request.json();
    
    await connectToDatabase();
    
    const updatedMember = await TeamMember.findByIdAndUpdate(
      id,
      { name, role, image, description },
      { new: true }
    );

    if (!updatedMember) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    
    const deletedMember = await TeamMember.findByIdAndDelete(id);

    if (!deletedMember) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
} 