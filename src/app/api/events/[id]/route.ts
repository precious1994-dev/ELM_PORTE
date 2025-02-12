import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

// Add dynamic flag for Next.js API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Create Event Schema
const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  description: String,
  imageUrl: String,
  location: String,
  category: String
});

// Get or create model
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

type Props = {
  params: {
    id: string;
  };
};

export async function GET(
  _req: NextRequest,
  props: Props
) {
  const { id } = props.params;
  if (!id) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  props: Props
) {
  const { id } = props.params;
  if (!id) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    );
  }

  try {
    const data = await req.json();
    await connectToDatabase();
    
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  props: Props
) {
  const { id } = props.params;
  if (!id) {
    return NextResponse.json(
      { error: 'Event ID is required' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 