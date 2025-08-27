import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixDatabase = async () => {
  try {
    console.log('🔧 Fixing database connection...');
    
    // Use the correct database URI
    const correctURI = 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU-BHASHaa?retryWrites=true&w=majority';
    
    console.log('📋 Connecting to correct database...');
    await mongoose.connect(correctURI);
    
    console.log('✅ Connected to TELUGU-BHASHaa database');
    
    // Test the connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Check submissions
    const Submission = mongoose.model('Submission', new mongoose.Schema({}));
    const submissions = await Submission.find({}).limit(5);
    console.log('📋 Found submissions:', submissions.length);
    
    if (submissions.length > 0) {
      console.log('📋 Sample submission:', {
        id: submissions[0]._id,
        type: submissions[0].submissionType,
        status: submissions[0].status,
        studentName: submissions[0].studentName
      });
    }
    
    await mongoose.disconnect();
    console.log('✅ Database connection test completed');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
  }
};

fixDatabase();


