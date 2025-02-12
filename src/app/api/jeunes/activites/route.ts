import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import mongoose from 'mongoose'

// Create interface for Activity
export interface YouthActivity {
  _id?: string
  title: string
  description: string
  image: string
  order?: number
}

// Create Mongoose schema for Youth Activities
const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  order: { type: Number, required: true, default: 0 }
});

// Get or create model
const YouthActivity = mongoose.models.YouthActivity || mongoose.model('YouthActivity', activitySchema);

// Function to migrate data from old collection
async function migrateOldData() {
  try {
    const db = await mongoose.connection.db;
    if (!db) {
      console.error('Database connection not established');
      return;
    }

    // Check if we have data in the new collection
    const newCollectionCount = await YouthActivity.countDocuments();
    if (newCollectionCount > 0) {
      return; // Already migrated
    }

    // Check if old collection exists and has data
    const oldCollection = db.collection('youthActivities');
    const oldData = await oldCollection.find({}).sort({ order: 1 }).toArray();
    
    if (oldData && oldData.length > 0) {
      console.log('Migrating old activities data...');
      
      // Map old data to new schema
      const activitiesToMigrate = oldData.map((activity: any, index: number) => ({
        title: activity.title || '',
        description: activity.description || '',
        image: activity.image || '',
        order: activity.order || index
      }));

      // Insert into new collection
      await YouthActivity.create(activitiesToMigrate);
      console.log('Migration completed successfully');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // Try to migrate old data first
    await migrateOldData();
    
    const activities = await YouthActivity.find().sort({ order: 1 });
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching youth activities:', error);
    return NextResponse.json(
      { error: 'Error fetching youth activities' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const activities = data.activities;

    // Validate activities
    if (!Array.isArray(activities)) {
      return NextResponse.json(
        { error: 'Activities must be an array' },
        { status: 400 }
      );
    }

    // Delete all existing activities
    await YouthActivity.deleteMany({});

    // Insert new activities
    if (activities.length > 0) {
      const activitiesWithOrder = activities.map((activity: YouthActivity, index: number) => ({
        title: activity.title || '',
        description: activity.description || '',
        image: activity.image || '',
        order: index
      }));

      await YouthActivity.create(activitiesWithOrder);
    }

    // Fetch and return updated activities
    const updatedActivities = await YouthActivity.find().sort({ order: 1 });
    return NextResponse.json(updatedActivities);
  } catch (error) {
    console.error('Error updating youth activities:', error);
    return NextResponse.json(
      { error: 'Error updating youth activities' },
      { status: 500 }
    );
  }
} 