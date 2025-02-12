import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import YouthSchedule from "@/models/youthSchedule";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { title, day, time, description } = await request.json();
    await connectToDatabase();
    
    const schedule = await YouthSchedule.findByIdAndUpdate(
      id,
      { title, day, time, description },
      { new: true }
    );

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Schedule Updated", schedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectToDatabase();
    
    const schedule = await YouthSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Schedule Deleted" });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error deleting schedule" },
      { status: 500 }
    );
  }
} 