import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority';

async function checkExamDetails() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the Exam model
    const Exam = mongoose.model('Exam', new mongoose.Schema({
      title: String,
      type: String,
      totalMaxMarks: Number,
      descriptiveQuestions: Array
    }));

    // Find all descriptive exams
    const descriptiveExams = await Exam.find({ type: 'descriptive' });
    
    console.log('\n📋 Descriptive Exams Found:');
    descriptiveExams.forEach((exam, index) => {
      console.log(`\n${index + 1}. ${exam.title}`);
      console.log(`   ID: ${exam._id}`);
      console.log(`   Type: ${exam.type}`);
      console.log(`   Total Max Marks: ${exam.totalMaxMarks}`);
      console.log(`   Questions: ${exam.descriptiveQuestions?.length || 0}`);
      
      if (exam.descriptiveQuestions && exam.descriptiveQuestions.length > 0) {
        exam.descriptiveQuestions.forEach((q, qIndex) => {
          console.log(`     Q${qIndex + 1}: ${q.question} (${q.maxPoints} points)`);
        });
      }
    });

    // Also check submissions to see what exam they're linked to
    const Submission = mongoose.model('Submission', new mongoose.Schema({
      exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: String,
      score: Number
    }));

    const submissions = await Submission.find({ submissionType: 'descriptive' }).populate('exam');
    
    console.log('\n📝 Descriptive Submissions:');
    submissions.forEach((sub, index) => {
      console.log(`\n${index + 1}. Submission ID: ${sub._id}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Score: ${sub.score}`);
      if (sub.exam) {
        console.log(`   Exam: ${sub.exam.title}`);
        console.log(`   Exam Max Marks: ${sub.exam.totalMaxMarks}`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkExamDetails();


