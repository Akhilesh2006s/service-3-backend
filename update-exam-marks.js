import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority';

async function updateExamMarks() {
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

    // Find the descriptive exam
    const exam = await Exam.findOne({ type: 'descriptive', title: 'axsaSDrfvtrr' });
    
    if (exam) {
      console.log(`\n📋 Current Exam Details:`);
      console.log(`   Title: ${exam.title}`);
      console.log(`   Current Max Marks: ${exam.totalMaxMarks}`);
      
      // Update the exam to have 100 max marks
      exam.totalMaxMarks = 100;
      await exam.save();
      
      console.log(`\n✅ Updated Exam:`);
      console.log(`   Title: ${exam.title}`);
      console.log(`   New Max Marks: ${exam.totalMaxMarks}`);
      
      // Also update the descriptive questions to have higher maxPoints
      if (exam.descriptiveQuestions && exam.descriptiveQuestions.length > 0) {
        exam.descriptiveQuestions.forEach((question, index) => {
          if (question.maxPoints === 10) {
            question.maxPoints = 100;
          }
        });
        await exam.save();
        console.log(`   Updated question maxPoints to 100`);
      }
      
    } else {
      console.log('❌ Exam not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateExamMarks();


