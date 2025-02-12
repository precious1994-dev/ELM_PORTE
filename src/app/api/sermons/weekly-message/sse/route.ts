import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import Sermon, { ISermon } from '@/models/Sermon';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const headersList = headers();
  
  try {
    // Connect to database before setting up the stream
    await dbConnect();

    const response = new NextResponse(
      new ReadableStream({
        async start(controller) {
          // Send initial connection event
          controller.enqueue('event: connected\ndata: {}\n\n');

          // Function to send sermon data
          const sendSermon = async () => {
            try {
              const weeklyMessage = await Sermon.findOne({ isWeeklyMessage: true })
                .select('-__v')
                .lean();
              
              if (weeklyMessage) {
                controller.enqueue(`event: message\ndata: ${JSON.stringify(weeklyMessage)}\n\n`);
              } else {
                controller.enqueue('event: message\ndata: null\n\n');
              }
            } catch (error) {
              console.error('Error fetching weekly message:', error);
              controller.enqueue(
                `event: error\ndata: ${JSON.stringify({ error: "Error fetching weekly message" })}\n\n`
              );
            }
          };

          // Send initial data
          await sendSermon();

          // Set up interval to check for updates
          const interval = setInterval(sendSermon, 5000);

          // Clean up on close
          req.signal.addEventListener('abort', () => {
            clearInterval(interval);
            controller.close();
          });
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no', // Disable buffering for nginx
        },
      }
    );

    return response;
  } catch (error) {
    console.error('Error setting up SSE:', error);
    return new NextResponse(
      `event: error\ndata: ${JSON.stringify({ error: "Failed to setup event stream" })}\n\n`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      }
    );
  }
} 