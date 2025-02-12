import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/lib/mongodb';
import Horaire from '@/models/Horaire';
import mongoose from 'mongoose';

interface LeanHoraire {
  _id: mongoose.Types.ObjectId;
  day: string;
  time: string;
  description: string;
  order: number;
  __v?: number;
}

type SSEClient = {
  id: string;
  controller: ReadableStreamController<any>;
  cleanup: NodeJS.Timeout;
};

const clients = new Map<string, SSEClient>();

function createSSEMessage(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function safelySendMessage(client: SSEClient, message: string): boolean {
  try {
    client.controller.enqueue(new TextEncoder().encode(message));
    return true;
  } catch (error) {
    cleanupClient(client.id);
    return false;
  }
}

function cleanupClient(id: string): void {
  const client = clients.get(id);
  if (client) {
    clearInterval(client.cleanup);
    clients.delete(id);
  }
}

function cleanupClosedClients(): void {
  Array.from(clients.entries()).forEach(([id, client]) => {
    try {
      if (!safelySendMessage(client, createSSEMessage('ping', { status: 'alive' }))) {
        cleanupClient(id);
      }
    } catch {
      cleanupClient(id);
    }
  });
}

async function sendInitialData(controller: ReadableStreamController<any>) {
  try {
    await connectToDatabase();
    const horaires = await Horaire.find().sort({ order: 1 }).lean() as LeanHoraire[];

    // Transform MongoDB documents to match frontend interface
    const transformedHoraires = horaires.map(horaire => ({
      id: horaire._id.toString(),
      day: horaire.day,
      time: horaire.time,
      description: horaire.description,
      order: horaire.order
    }));

    const message = createSSEMessage('initial', transformedHoraires);
    controller.enqueue(new TextEncoder().encode(message));
  } catch (error) {
    console.error('Error sending initial data:', error);
    const errorMessage = createSSEMessage('error', { message: 'Failed to load initial data' });
    controller.enqueue(new TextEncoder().encode(errorMessage));
  }
}

// Internal function for broadcasting updates
function _broadcastUpdate(data: any): void {
  console.log('Broadcasting update to clients:', data);
  
  // Transform MongoDB documents if they're being passed directly
  const transformedData = Array.isArray(data) ? data.map(item => ({
    id: item._id?.toString() || item.id,
    day: item.day,
    time: item.time,
    description: item.description,
    order: item.order
  })) : data;

  console.log('Transformed data:', transformedData);
  console.log('Number of connected clients:', clients.size);

  const message = createSSEMessage('update', transformedData);
  
  Array.from(clients.entries()).forEach(([id, client]) => {
    try {
      console.log(`Sending update to client ${id}`);
      if (!safelySendMessage(client, message)) {
        console.log(`Failed to send to client ${id}, cleaning up`);
        cleanupClient(id);
      }
    } catch (error) {
      console.error(`Error sending to client ${id}:`, error);
      cleanupClient(id);
    }
  });
}

export async function GET() {
  const clientId = crypto.randomUUID();
  const cleanup = setInterval(cleanupClosedClients, 30000);

  const stream = new ReadableStream({
    async start(controller) {
      const client: SSEClient = { 
        id: clientId, 
        controller,
        cleanup 
      };
      clients.set(clientId, client);

      // Send initial connection confirmation
      const message = createSSEMessage('connected', { clientId, timestamp: new Date().toISOString() });
      controller.enqueue(new TextEncoder().encode(message));

      // Send initial data
      await sendInitialData(controller);
    },
    cancel() {
      cleanupClient(clientId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Accel-Buffering': 'no' // Disable buffering in Nginx
    },
  });
}

// POST endpoint for broadcasting updates
export async function POST(request: Request) {
  try {
    const data = await request.json();
    _broadcastUpdate(data);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to broadcast update' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export const dynamic = 'force-dynamic'; 