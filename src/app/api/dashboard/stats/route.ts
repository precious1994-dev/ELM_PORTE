import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Sermon from '@/models/Sermon';
import Team from '@/models/Team';
import TeamMember from '@/models/TeamMember';
import ChildrenTeam from '@/models/childrenTeam';
import YouthTeam from '@/models/youthTeam';
import FemmesEquipe from '@/models/FemmesEquipe';
import mongoose from 'mongoose';

// Get the Event model
const Event = mongoose.models.Event || mongoose.model('Event', new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '/images/event-default.jpg' },
  location: { type: String, required: true },
  category: { type: String }
}, { timestamps: true }));

export async function GET() {
  try {
    await dbConnect();

    // Fetch counts and recent items from different collections
    const [
      sermonsCount,
      teamCount,
      teamMemberCount,
      childrenTeamCount,
      youthTeamCount,
      femmesEquipeCount,
      eventsCount,
      recentEvents,
      recentSermons,
      recentTeamMembers
    ] = await Promise.all([
      Sermon.countDocuments({}),
      Team.countDocuments({}),
      TeamMember.countDocuments({}),
      ChildrenTeam.countDocuments({}),
      YouthTeam.countDocuments({}),
      FemmesEquipe.countDocuments({}),
      Event.countDocuments({}),
      Event.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title date time createdAt updatedAt')
        .lean(),
      Sermon.find({})
        .sort({ date: -1 })
        .limit(3)
        .select('title date speaker')
        .lean(),
      TeamMember.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name role createdAt updatedAt')
        .lean()
    ]);

    // Calculate total members across all team collections
    const totalMembers = teamCount + teamMemberCount + childrenTeamCount + youthTeamCount + femmesEquipeCount;

    // Get current date for comparison
    const now = new Date();

    // Combine and sort recent activities
    const recentActivities = [
      ...recentEvents.map(event => ({
        type: 'event',
        title: event.title,
        date: event.date,
        time: event.time,
        timestamp: new Date(event.createdAt || now).getTime(),
        createdAt: event.createdAt || now
      })),
      ...recentSermons.map(sermon => ({
        type: 'sermon',
        title: sermon.title,
        speaker: sermon.speaker,
        date: sermon.date,
        timestamp: new Date(sermon.date).getTime(),
        createdAt: sermon.date
      })),
      ...recentTeamMembers.map(member => ({
        type: 'member',
        name: member.name,
        role: member.role,
        timestamp: new Date(member.createdAt || now).getTime(),
        createdAt: member.createdAt || now
      }))
    ]
    .map(activity => ({
      ...activity,
      // Ensure the timestamp is valid and not in the future
      timestamp: Math.min(new Date(activity.timestamp).getTime(), now.getTime())
    }))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

    const response = NextResponse.json({
      success: true,
      data: {
        sermons: sermonsCount,
        members: totalMembers,
        events: eventsCount,
        recentActivities
      }
    });

    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 