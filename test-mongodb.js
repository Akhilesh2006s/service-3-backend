import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('Environment variables loaded:');
    console.log('MONGODB_URI exists:', !!mongoURI);
    console.log('MONGODB_URI preview:', mongoURI ? mongoURI.substring(0, 50) + '...' : 'NOT SET');
    
    if (!mongoURI) {
      console.log('❌ MONGODB_URI not found in environment variables');
      return;
    }

    console.log('\n🔄 Attempting to connect to MongoDB Atlas...');
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Ready State: ${conn.connection.readyState}`);

    // Test a simple operation
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    collections.forEach(col => console.log(`- ${col.name}`));

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');

  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error('Error:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if username/password are correct');
      console.log('2. Verify the user has proper permissions in MongoDB Atlas');
      console.log('3. Check if IP address is whitelisted in MongoDB Atlas');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running');
      console.log('3. Check if cluster URL is correct');
    }
  }
};

testConnection();
