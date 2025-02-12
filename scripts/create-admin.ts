import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';

// Load environment variables from .env.local first
dotenv.config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;

const options = {
  bufferCommands: true,
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

// Define Admin Schema
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'Password should be at least 8 characters long']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

async function createAdmin() {
  try {
    // Connect to MongoDB with improved options
    console.log('Connecting to MongoDB Atlas...');
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB Atlas');

    // Create Admin model
    const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

    const adminData = {
      email: 'admin@eglise.com',
      password: 'Admin@Eglise2024',
      name: 'Eglise Admin',
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(adminData.password, 12);

    // Create the admin user
    const admin = new Admin({
      ...adminData,
      password: hashedPassword,
    });

    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('----------------------------------------');
    console.log('Please save these credentials securely:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('----------------------------------------');
    console.log('You can now log in at http://localhost:3000/admin/login');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Close the MongoDB connection
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB Atlas');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
    process.exit();
  }
}

createAdmin(); 