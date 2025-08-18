import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.log('MongoDB URI not configured - using in-memory database for development');
      console.log('To use a real database, set MONGODB_URI in your environment variables');
      console.log('You can use MongoDB Atlas (free tier) or install MongoDB locally');
      return;
    }

    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', mongoURI.substring(0, 50) + '...');

    // Configure mongoose options for better connection stability
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Ready State: ${conn.connection.readyState}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected - attempting to reconnect...');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect to MongoDB...');
        connectDB();
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.error('Error details:', error.message);
    console.log('Continuing without database connection...');
  }
};

export default connectDB; 