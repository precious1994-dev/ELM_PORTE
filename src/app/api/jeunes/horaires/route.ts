import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import YouthSchedule from "@/models/youthSchedule";

export async function POST(request: Request) {
  try {
    const { title, day, time, description } = await request.json();
    await connectToDatabase();
    const schedule = await YouthSchedule.create({ title, day, time, description });
    return NextResponse.json({ message: "Schedule Created", schedule }, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating schedule" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const schedules = await YouthSchedule.find().sort({ order: 1 });
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    const deletedSchedule = await YouthSchedule.findByIdAndDelete(id);
    
    if (!deletedSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "Schedule deleted", schedule: deletedSchedule }, { status: 200 });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error deleting schedule" },
      { status: 500 }
    );
  }
} 