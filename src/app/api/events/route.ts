import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

// Add dynamic flag for Next.js API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Create Event Schema
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '/images/event-default.jpg' },
  location: { type: String, required: true },
  category: { type: String }
});

// Get or create model
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export async function GET() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    console.log('Fetching events...');
    const events = await Event.find({}).sort({ date: 1, time: 1 });
    console.log('Raw events from database:', events);

    // Get current date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Transform and filter the events to include only future events
    const transformedEvents = events
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .map(event => ({
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        imageUrl: event.imageUrl || '/images/event-default.jpg',
        category: event.category
      }));

    console.log('Transformed events:', transformedEvents);
    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log('Creating new event with data:', data);
    
    await connectToDatabase();
    const event = new Event(data);
    await event.save();
    
    const transformedEvent = {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl || '/images/event-default.jpg',
      category: event.category
    };
    
    console.log('Created event:', transformedEvent);
    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    console.log('Updating event with id:', id, 'and data:', updateData);

    await connectToDatabase();
    const event = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const transformedEvent = {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl || '/images/event-default.jpg',
      category: event.category
    };

    console.log('Updated event:', transformedEvent);
    return NextResponse.json(transformedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
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