import { toast } from 'sonner';

type SSEOptions = {
  endpoint: string;
  onMessage?: (data: any) => void;
  onError?: (error: any) => void;
  onConnected?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  enableLogging?: boolean;
};

export const setupSSE = ({
  endpoint,
  onMessage,
  onError,
  onConnected,
  maxRetries = 5,
  retryDelay = 5000,
  enableLogging = false,
}: SSEOptions) => {
  let retryCount = 0;
  let eventSource: EventSource | null = null;
  let retryTimeout: NodeJS.Timeout | null = null;

  const log = (...args: any[]) => {
    if (enableLogging) {
      console.log('[SSE]', ...args);
    }
  };

  const cleanup = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
  };

  const connect = () => {
    try {
      cleanup(); // Clean up existing connection if any

      log('Connecting to SSE endpoint:', endpoint);
      eventSource = new EventSource(endpoint);

      // Handle successful connection
      eventSource.onopen = () => {
        log('Connection established');
        retryCount = 0;
        onConnected?.();
      };

      // Handle messages
      eventSource.onmessage = (event) => {
        try {
          const data = event.data === 'null' ? null : JSON.parse(event.data);
          log('Received message:', data);
          onMessage?.({ type: 'message', data });
        } catch (error) {
          log('Error parsing SSE data:', error);
          toast.error('Error receiving data from server');
        }
      };

      // Handle specific events
      eventSource.addEventListener('update', (event: MessageEvent) => {
        try {
          const data = event.data === 'null' ? null : JSON.parse(event.data);
          log('Received update:', data);
          onMessage?.({ type: 'update', data });
        } catch (error) {
          log('Error parsing SSE update data:', error);
          toast.error('Error receiving update from server');
        }
      });

      eventSource.addEventListener('connected', (event: MessageEvent) => {
        try {
          const data = event.data === 'null' ? null : JSON.parse(event.data);
          log('Connected event received:', data);
          retryCount = 0;
          onConnected?.();
        } catch (error) {
          log('Error parsing connected event data:', error);
        }
      });

      // Handle errors
      eventSource.onerror = (error) => {
        // Create a more detailed error object
        const errorDetails = {
          timestamp: new Date().toISOString(),
          url: endpoint,
          retryCount,
          readyState: eventSource?.readyState,
          connectionState: {
            online: navigator.onLine,
            connectionType: (navigator as any).connection?.type || 'unknown',
            effectiveType: (navigator as any).connection?.effectiveType || 'unknown'
          }
        };

        log('Connection error:', errorDetails);
        
        if (eventSource?.readyState === EventSource.CLOSED) {
          eventSource = null;
        }

        // Call error callback if provided
        onError?.(errorDetails);

        // If browser is offline, wait for online event before retrying
        if (!navigator.onLine) {
          log('Browser is offline, waiting for connection...');
          const handleOnline = () => {
            log('Browser is back online, reconnecting...');
            window.removeEventListener('online', handleOnline);
            connect();
          };
          window.addEventListener('online', handleOnline);
          return;
        }

        // Attempt to reconnect if under max retries
        if (retryCount < maxRetries) {
          retryCount++;
          const currentDelay = retryDelay * Math.pow(2, retryCount - 1);
          log(`Retrying connection in ${currentDelay}ms (attempt ${retryCount}/${maxRetries})`);
          
          cleanup();
          
          retryTimeout = setTimeout(connect, currentDelay);
        } else {
          log('Max retry attempts reached');
          cleanup();
          toast.error('Real-time connection unavailable. Please refresh the page.');
        }
      };
    } catch (error) {
      log('Error setting up SSE:', error);
      toast.error('Error setting up real-time connection');
      
      if (retryCount < maxRetries) {
        retryCount++;
        retryTimeout = setTimeout(connect, retryDelay);
      }
    }
  };

  // Initial connection
  connect();

  // Return cleanup function
  return () => {
    log('Cleaning up SSE connection');
    cleanup();
  };
}; 