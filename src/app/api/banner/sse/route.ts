import { NextRequest } from 'next/server';

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const clients = new Map<string, SSEClient>();

function createSSEMessage(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function safelySendMessage(client: SSEClient, message: string): boolean {
  try {
    client.controller.enqueue(new TextEncoder().encode(message));
    return true;
  } catch {
    cleanupClient(client.id);
    return false;
  }
}

function cleanupClient(id: string): void {
  clients.delete(id);
}

// Internal function for broadcasting updates
function _broadcastUpdate(data: any): void {
  const message = createSSEMessage('message', data);
  
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

export async function GET(request: NextRequest) {
  const clientId = crypto.randomUUID();

  try {
    const stream = new ReadableStream({
      start(controller) {
        const client: SSEClient = {
          id: clientId,
          controller,
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
        'X-Accel-Buffering': 'no', // Disable buffering for nginx
      },
    });
  } catch (error) {
    console.error('Error setting up SSE:', error);
    return new Response(
      createSSEMessage('error', { error: 'Failed to setup event stream' }),
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