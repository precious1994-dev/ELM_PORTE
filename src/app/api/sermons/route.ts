import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Sermon from '@/models/Sermon';

// GET /api/sermons - Get all sermons with pagination
export async function GET(request: Request) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get query parameters
    const url = new URL(request.url);
    const speaker = url.searchParams.get('speaker');
    const series = url.searchParams.get('series');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '9');
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    // Validate pagination parameters
    const validPage = page > 0 ? page : 1;
    const validLimit = limit > 0 && limit <= 100 ? limit : 9;
    const skip = (validPage - 1) * validLimit;

    // Build query object
    const query: any = {};
    if (speaker) query.speaker = speaker;
    if (series) query.series = series;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { speaker: { $regex: search, $options: 'i' } },
        { passage: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Executing query with parameters:', {
      query,
      skip,
      limit: validLimit,
      page: validPage,
      sortOrder
    });

    try {
      // Execute queries
      const [sermons, totalSermons] = await Promise.all([
        Sermon.find(query)
          .sort({ date: sortOrder === 'desc' ? -1 : 1 })
          .skip(skip)
          .limit(validLimit)
          .lean()
          .exec(),
        Sermon.countDocuments(query)
      ]);

      console.log('Query results:', {
        sermonsCount: sermons?.length || 0,
        totalSermons,
        isArray: Array.isArray(sermons)
      });

      // Ensure sermons is always an array and handle null/undefined
      const sermonsArray = Array.isArray(sermons) ? sermons : [];
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalSermons / validLimit);

      // Prepare response
      const response = {
        sermons: sermonsArray,
        currentPage: validPage,
        totalPages: Math.max(1, totalPages),
        totalSermons,
        itemsPerPage: validLimit
      };

      console.log('Sending response with metadata:', {
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalSermons: response.totalSermons,
        itemsPerPage: response.itemsPerPage,
        actualItemsCount: response.sermons.length
      });

      return NextResponse.json(response);
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Return empty array with metadata instead of throwing
      return NextResponse.json({
        sermons: [],
        currentPage: validPage,
        totalPages: 1,
        totalSermons: 0,
        itemsPerPage: validLimit,
        error: 'Database query failed'
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      sermons: [],
      currentPage: 1,
      totalPages: 1,
      totalSermons: 0,
      itemsPerPage: 9,
      error: 'Internal Server Error'
    }, {
      status: 500
    });
  }
}

// POST /api/sermons - Create a new sermon
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();
    
    console.log('Received sermon data:', data); // Debug log

    // Validate required fields
    const requiredFields = ['title', 'speaker', 'date', 'passage', 'description', 'duration', 'image', 'youtubeUrl'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields); // Debug log
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create new sermon
    try {
      const sermon = await Sermon.create({
        ...data,
        date: new Date(data.date), // Ensure date is properly formatted
      });
      console.log('Created sermon:', sermon); // Debug log
      return NextResponse.json(sermon);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      if (dbError.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Validation Error', details: dbError.message },
          { status: 400 }
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating sermon:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
} 