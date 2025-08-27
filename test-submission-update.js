import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority';

async function testSubmissionUpdate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the Submission model
    const Submission = mongoose.model('Submission', new mongoose.Schema({
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
      submissionType: String,
      status: String,
      score: Number,
      evaluation: Object,
      descriptiveAnswers: Array
    }));

    // Find all descriptive submissions
    const submissions = await Submission.find({ submissionType: 'descriptive' }).populate('student exam');
    
    console.log('\n📝 All Descriptive Submissions:');
    submissions.forEach((sub, index) => {
      console.log(`\n${index + 1}. Submission ID: ${sub._id}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Score: ${sub.score}`);
      console.log(`   Student: ${sub.student?.name || 'Unknown'}`);
      console.log(`   Exam: ${sub.exam?.title || 'Unknown'}`);
      if (sub.evaluation) {
        console.log(`   Evaluation:`, sub.evaluation);
      }
    });

    // Check if there are any submissions with status 'evaluated'
    const evaluatedSubmissions = submissions.filter(sub => sub.status === 'evaluated');
    console.log(`\n✅ Evaluated submissions: ${evaluatedSubmissions.length}`);
    
    // Check if there are any submissions with status 'pending'
    const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');
    console.log(`⏳ Pending submissions: ${pendingSubmissions.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSubmissionUpdate();


