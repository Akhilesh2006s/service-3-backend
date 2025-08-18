import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority';

async function checkAllSubmissions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the User model
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      role: String
    }));

    // Get the Submission model
    const Submission = mongoose.model('Submission', new mongoose.Schema({
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: String,
      submissionType: String,
      milestone: Number,
      status: String,
      submittedAt: Date
    }));

    // Check for all submissions
    const allSubmissions = await Submission.find().populate('student');
    
    console.log('\n📋 All Submissions Found:');
    console.log(`Total submissions: ${allSubmissions.length}`);
    
    allSubmissions.forEach((sub, index) => {
      console.log(`\n${index + 1}. Submission ID: ${sub._id}`);
      console.log(`   Student: ${sub.student?.name || 'Unknown'}`);
      console.log(`   Type: ${sub.type}`);
      console.log(`   Submission Type: ${sub.submissionType}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Milestone: ${sub.milestone || 'N/A'}`);
      console.log(`   Submitted: ${sub.submittedAt}`);
    });

    // Group by submission type
    const byType = {};
    allSubmissions.forEach(sub => {
      const type = sub.submissionType || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    });

    console.log('\n📊 Submissions by Type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Group by status
    const byStatus = {};
    allSubmissions.forEach(sub => {
      const status = sub.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    console.log('\n📊 Submissions by Status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkAllSubmissions();
