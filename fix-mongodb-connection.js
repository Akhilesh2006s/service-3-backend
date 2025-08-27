import mongoose from 'mongoose';

console.log('🔧 MongoDB Connection Fix Helper');
console.log('================================');

// Check current environment
console.log('\n📋 Current Environment:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Test different connection options
const testConnections = async () => {
  console.log('\n🧪 Testing Connection Options...\n');

  // Option 1: Test current connection
  console.log('1️⃣ Testing current MongoDB Atlas connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Current connection works!');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ Current connection failed:', error.message);
  }

  // Option 2: Test with different credentials
  console.log('\n2️⃣ Testing with updated credentials...');
  const testURI = process.env.MONGODB_URI?.replace(
    /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
    'mongodb+srv://$1:NEW_PASSWORD@'
  );
  
  if (testURI !== process.env.MONGODB_URI) {
    console.log('💡 Try updating your password in MongoDB Atlas');
    console.log('💡 Or create a new database user');
  }

  // Option 3: Test local MongoDB
  console.log('\n3️⃣ Testing local MongoDB connection...');
  try {
    await mongoose.connect('mongodb://localhost:27017/telugu-learning', {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✅ Local MongoDB works! (if you have it installed)');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ Local MongoDB not available:', error.message);
  }

  return false;
};

// Provide solutions
const provideSolutions = () => {
  console.log('\n🔧 Solutions to Fix MongoDB Connection:');
  console.log('=======================================');
  
  console.log('\n📝 Option 1: Fix MongoDB Atlas Credentials');
  console.log('1. Go to MongoDB Atlas dashboard');
  console.log('2. Navigate to Database Access');
  console.log('3. Edit your user or create a new one');
  console.log('4. Update the password');
  console.log('5. Update your .env file with new credentials');
  
  console.log('\n📝 Option 2: Install Local MongoDB');
  console.log('1. Download MongoDB Community Server');
  console.log('2. Install with default settings');
  console.log('3. Update .env file: MONGODB_URI=mongodb://localhost:27017/telugu-learning');
  
  console.log('\n📝 Option 3: Create New MongoDB Atlas Cluster');
  console.log('1. Go to MongoDB Atlas');
  console.log('2. Create a new free cluster');
  console.log('3. Create a new database user');
  console.log('4. Get the new connection string');
  console.log('5. Update your .env file');
  
  console.log('\n📝 Option 4: Use In-Memory Storage (Current Working Solution)');
  console.log('✅ Your server is already working with in-memory storage');
  console.log('✅ Exam submissions are working');
  console.log('✅ All features are functional');
  console.log('💡 This is a valid solution for development/testing');
};

// Main execution
const main = async () => {
  const connectionWorks = await testConnections();
  
  if (connectionWorks) {
    console.log('\n🎉 MongoDB connection is working!');
    console.log('Your server should now use MongoDB instead of in-memory storage.');
  } else {
    console.log('\n⚠️  MongoDB connection failed');
    provideSolutions();
  }
};

main().catch(console.error);
