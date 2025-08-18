import mongoose from 'mongoose';
import './models/Submission.js';
import './models/Exam.js';
import './models/User.js';

const Submission = mongoose.model('Submission');

async function debugSubmissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telugu-learning');
    console.log('✅ Connected to MongoDB');

    // Get total count
    const totalCount = await Submission.countDocuments({});
    console.log(`📊 Total submissions in database: ${totalCount}`);

    // Get submissions by type
    const mcqCount = await Submission.countDocuments({ submissionType: 'mcq' });
    const voiceCount = await Submission.countDocuments({ submissionType: 'voice' });
    const descriptiveCount = await Submission.countDocuments({ submissionType: 'descriptive' });
    const mixedCount = await Submission.countDocuments({ submissionType: 'mixed' });

    console.log(`📊 Submissions by type:`);
    console.log(`   MCQ: ${mcqCount}`);
    console.log(`   Voice: ${voiceCount}`);
    console.log(`   Descriptive: ${descriptiveCount}`);
    console.log(`   Mixed: ${mixedCount}`);

    // Get all submissions without any limit
    const allSubmissions = await Submission.find({})
      .populate('student', 'name email')
      .populate('exam', 'title type')
      .populate('activity', 'title type')
      .sort({ submittedAt: -1 });

    console.log(`📊 Actual submissions fetched: ${allSubmissions.length}`);

    // Show first 5 submissions
    console.log('\n📋 First 5 submissions:');
    allSubmissions.slice(0, 5).forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.student?.name || 'Unknown'} - ${sub.submissionType} - ${sub.submittedAt}`);
    });

    // Show last 5 submissions
    console.log('\n📋 Last 5 submissions:');
    allSubmissions.slice(-5).forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.student?.name || 'Unknown'} - ${sub.submissionType} - ${sub.submittedAt}`);
    });

    // Check if there are any submissions with the same student and exam
    const duplicateCheck = await Submission.aggregate([
      {
        $group: {
          _id: { student: '$student', exam: '$exam' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicateCheck.length > 0) {
      console.log('\n⚠️ Found duplicate submissions:');
      duplicateCheck.forEach(dup => {
        console.log(`   Student: ${dup._id.student}, Exam: ${dup._id.exam}, Count: ${dup.count}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugSubmissions();
