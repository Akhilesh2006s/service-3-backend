import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

console.log('Resetting user password...');

const resetUserPassword = async () => {
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

    console.log('✅ User found:');
    console.log(`  - Name: ${user.name}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Role: ${user.role}`);

    // Reset password to 'Akhilesh'
    user.password = 'Akhilesh'; // This will be hashed by the pre-save hook
    await user.save();

    console.log('✅ Password reset successfully');
    console.log('📧 Email: ak@gmail.com');
    console.log('🔑 New Password: Akhilesh');

    // Test the new password
    const isPasswordValid = await user.comparePassword('Akhilesh');
    console.log(`Password test: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);

    // Also create a test evaluator with known credentials
    console.log('\n➕ Creating test evaluator...');
    const testEvaluator = new User({
      name: 'Test Evaluator',
      email: 'testevaluator@example.com',
      phone: '9876543210',
      password: 'test123',
      role: 'evaluator',
      isVerified: true,
      isActive: true
    });

    await testEvaluator.save();
    console.log('✅ Test evaluator created');
    console.log('📧 Email: testevaluator@example.com');
    console.log('🔑 Password: test123');

    // Test the evaluator password
    const evaluatorLogin = await testEvaluator.comparePassword('test123');
    console.log(`Evaluator password test: ${evaluatorLogin ? '✅ VALID' : '❌ INVALID'}`);

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    console.log('\n🎉 Password reset completed!');
    console.log('💡 You can now login with:');
    console.log('   - ak@gmail.com / Akhilesh');
    console.log('   - testevaluator@example.com / test123');

  } catch (error) {
    console.error('❌ Password reset failed:', error);
    process.exit(1);
  }
};

resetUserPassword(); 