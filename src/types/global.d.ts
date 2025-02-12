import { Mongoose } from 'mongoose';

declare global {
  interface Window {
    horairesEventSource: EventSource | null;
  }
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
} 