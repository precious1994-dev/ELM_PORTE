import { NextResponse } from 'next/server';

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
      if (!safelySendMessage(client, createSSEMessage('ping', 'heartbeat'))) {
        cleanupClient(id);
      }
    } catch {
      cleanupClient(id);
    }
  });
}

// Internal function for broadcasting updates
function _broadcastUpdate(data: any): void {
  const message = createSSEMessage('update', data);
  
  Array.from(clients.entries()).forEach(([id, client]) => {
    try {
      if (!safelySendMessage(client, message)) {
        cleanupClient(id);
      }
    } catch {
      cleanupClient(id);
    }
  });
}

export async function GET() {
  const clientId = crypto.randomUUID();
  const cleanup = setInterval(cleanupClosedClients, 30000);

  const stream = new ReadableStream({
    start(controller) {
      const client: SSEClient = { 
        id: clientId, 
        controller,
        cleanup 
      };
      clients.set(clientId, client);

      // Send initial connection confirmation
      const message = createSSEMessage('connected', { clientId });
      controller.enqueue(new TextEncoder().encode(message));
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