import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Testing MongoDB connection...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Test connection
const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Set connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds
      socketTimeoutMS: 45000, // 45 seconds
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Connection host:', mongoose.connection.host);
    console.log('Database name:', mongoose.connection.name);
    
    // Test creating a simple collection
    const testCollection = mongoose.connection.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Test document inserted successfully');
    
    // Clean up test document
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Test document cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.code === 8000) {
      console.error('🔐 Authentication failed. Please check your MongoDB Atlas credentials.');
      console.error('Make sure your username and password are correct.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network error. Please check your internet connection.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timeout. Please check your MongoDB URI.');
    }
    
    return false;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    }
  }
};

// Run test
testConnection();
