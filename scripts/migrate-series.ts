import { config } from 'dotenv';
config(); // Load environment variables from .env

import dbConnect from '../src/lib/dbConnect';
import Sermon from '../src/models/Sermon';
import Series from '../src/models/Series';
import mongoose from 'mongoose';

async function migrateSeries() {
  try {
    await dbConnect();

    // Get all sermons
    const sermons = await Sermon.find({});
    const series = await Series.find({});

    let updatedCount = 0;
    let errors = [];

    // Create a map of series IDs to names for faster lookup
    const seriesMap = new Map(series.map(s => [s._id.toString(), s.name]));

    // Update each sermon
    for (const sermon of sermons) {
      try {
        if (sermon.series && mongoose.Types.ObjectId.isValid(sermon.series)) {
          const seriesName = seriesMap.get(sermon.series);
          if (seriesName) {
            await Sermon.updateOne(
              { _id: sermon._id },
              { $set: { series: seriesName } }
            );
            updatedCount++;
            console.log(`Updated sermon ${sermon._id} with series name: ${seriesName}`);
          }
        }
      } catch (error) {
        errors.push({
          sermonId: sermon._id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`Error updating sermon ${sermon._id}:`, error);
      }
    }

    console.log('\nMigration completed:');
    console.log(`- Updated ${updatedCount} sermons`);
    if (errors.length > 0) {
      console.log(`- Encountered ${errors.length} errors:`, errors);
    }
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateSeries(); 