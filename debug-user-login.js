import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

console.log('Debugging user login issue...');

const debugUserLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'ak@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found in MongoDB');
      return;
    }

    console.log('✅ User found in MongoDB:');
    console.log(`  - Name: ${user.name}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Role: ${user.role}`);
    console.log(`  - Active: ${user.isActive}`);
    console.log(`  - Password hash: ${user.password.substring(0, 20)}...`);

    // Test password comparison
    const testPassword = 'Akhilesh';
    const isPasswordValid = await user.comparePassword(testPassword);
    console.log(`\n🔐 Password test for '${testPassword}': ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);

    // Try to hash the password manually to see if it matches
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    console.log(`\n🔄 Manual hash for '${testPassword}': ${hashedPassword.substring(0, 20)}...`);

    // Check if the stored password matches the manual hash
    const manualMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`Manual comparison: ${manualMatch ? '✅ MATCHES' : '❌ NO MATCH'}`);

    // List all users with similar emails
    console.log('\n📋 All users with similar emails:');
    const similarUsers = await User.find({ 
      email: { $regex: 'ak', $options: 'i' } 
    }).select('-password');
    
    similarUsers.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) - ${u.role} - Active: ${u.isActive}`);
    });

    // Create a test user with known password
    console.log('\n➕ Creating test user with known password...');
    const testUser = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '1234567890',
      password: 'test123',
      role: 'learner',
      isVerified: true,
      isActive: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log('📧 Email: testuser@example.com');
    console.log('🔑 Password: test123');

    // Test the new user's password
    const testUserLogin = await testUser.comparePassword('test123');
    console.log(`Test user password valid: ${testUserLogin ? '✅' : '❌'}`);

    // Clean up
    await User.deleteOne({ email: 'testuser@example.com' });
    console.log('🧹 Test user cleaned up');

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');

  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
};

debugUserLogin(); 