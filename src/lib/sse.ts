// Store active clients
const clients = new Map<string, ReadableStreamDefaultController>();

// Helper function to create SSE message
export function createSSEMessage(event: string, data: any) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// Function to add a new client
export function addClient(clientId: string, controller: ReadableStreamDefaultController) {
  clients.set(clientId, controller);
  console.log(`Client ${clientId} connected. Total clients: ${clients.size}`);
}

// Function to remove client
export function removeClient(clientId: string) {
  clients.delete(clientId);
  console.log(`Client ${clientId} disconnected. Total clients: ${clients.size}`);
}

// Function to broadcast updates to all clients
export function broadcastUpdate(data: any) {
  const message = createSSEMessage('update', data);
  clients.forEach((controller) => {
    try {
      controller.enqueue(message);
    } catch (error) {
      console.error('Error broadcasting update:', error);
    }
  });
}

// Function to send keepalive messages
export function startKeepAlive(clientId: string) {
  return setInterval(() => {
    const controller = clients.get(clientId);
    if (controller) {
      const keepAliveMessage = createSSEMessage('keepalive', { timestamp: Date.now() });
      controller.enqueue(keepAliveMessage);
    }
  }, 30000); // Send keepalive every 30 seconds
}

// Function to clean up all clients
export function cleanupClients() {
  clients.clear();
}

// Function to get total number of clients
export function getClientCount() {
  return clients.size;
} 