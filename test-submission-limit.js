import mongoose from 'mongoose';
import './models/Submission.js';
import './models/User.js';

const Submission = mongoose.model('Submission');

async function testSubmissionLimit() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telugu-learning');
    console.log('✅ Connected to MongoDB');

    // Get total count
    const totalCount = await Submission.countDocuments({});
    console.log(`📊 Total submissions in database: ${totalCount}`);

    // Get submissions by student
    const students = await Submission.distinct('student');
    console.log(`📊 Unique students with submissions: ${students.length}`);

    // Check each student's submission count
    for (const studentId of students) {
      const studentCount = await Submission.countDocuments({ student: studentId });
      console.log(`📊 Student ${studentId}: ${studentCount} submissions`);
    }

    // Get all submissions without any limit
    const allSubmissions = await Submission.find({})
      .populate('student', 'name email')
      .populate('exam', 'title type')
      .sort({ submittedAt: -1 });

    console.log(`📊 Actual submissions fetched: ${allSubmissions.length}`);

    // Show first 10 submissions
    console.log('\n📋 First 10 submissions:');
    allSubmissions.slice(0, 10).forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.student?.name || 'Unknown'} - ${sub.submissionType} - ${sub.submittedAt}`);
    });

    // Check if there are more than 10
    if (allSubmissions.length > 10) {
      console.log('\n📋 Submissions 11-20:');
      allSubmissions.slice(10, 20).forEach((sub, index) => {
        console.log(`${index + 11}. ${sub.student?.name || 'Unknown'} - ${sub.submissionType} - ${sub.submittedAt}`);
      });
    }

    // Test the API endpoint directly
    console.log('\n🧪 Testing API endpoint...');
    const testQuery = await Submission.find({})
      .populate('student', 'name email')
      .populate('exam', 'title type')
      .sort({ submittedAt: -1 })
      .lean();

    console.log(`📊 API query result: ${testQuery.length} submissions`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testSubmissionLimit();
