import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

console.log('Setting up MongoDB connection...');

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.log('\n❌ MONGODB_URI is not set in your environment variables.');
  console.log('\n📝 To set up MongoDB, you have two options:');
  console.log('\n1. MongoDB Atlas (Recommended - Free tier available):');
  console.log('   - Go to https://www.mongodb.com/atlas');
  console.log('   - Create a free account');
  console.log('   - Create a new cluster');
  console.log('   - Get your connection string');
  console.log('   - Set MONGODB_URI in your .env file');
  console.log('\n2. Local MongoDB:');
  console.log('   - Install MongoDB locally');
  console.log('   - Start MongoDB service');
  console.log('   - Set MONGODB_URI=mongodb://localhost:27017/telugu-learning');
  console.log('\n📄 Example .env file:');
  console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority');
  console.log('JWT_SECRET=your-secret-key');
  console.log('JWT_EXPIRE=7d');
  
  process.exit(1);
}

// Test the connection
const testConnection = async () => {
  try {
    console.log('🔗 Testing MongoDB connection...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected:', conn.connection.host);
    console.log('✅ Database:', conn.connection.name);
    console.log('✅ Ready to use MongoDB for evaluators and students!');
    
    // Test creating a collection
    const User = mongoose.model('User', new mongoose.Schema({}));
    await User.createCollection();
    console.log('✅ User collection created/verified');
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your MONGODB_URI format');
    console.log('2. Ensure your IP is whitelisted (for Atlas)');
    console.log('3. Verify your username/password');
    console.log('4. Check if MongoDB service is running (for local)');
    
    process.exit(1);
  }
};

testConnection(); 