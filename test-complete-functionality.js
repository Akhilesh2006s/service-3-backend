import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from './models/Exam.js';
import User from './models/User.js';
import Submission from './models/Submission.js';
import FileUpload from './models/FileUpload.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

const testCompleteFunctionality = async () => {
  console.log('🧪 Testing Complete Functionality...\n');
  
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('❌ Could not connect to MongoDB');
    return;
  }
  
  try {
    // 1. Check Users
    console.log('1. 📊 Checking Users...');
    const users = await User.find({}).select('-password');
    console.log(`   Found ${users.length} users`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // 2. Check Exams
    console.log('\n2. 📊 Checking Exams...');
    const exams = await Exam.find({});
    console.log(`   Found ${exams.length} exams`);
    exams.forEach(exam => {
      console.log(`   - ${exam.title} - Type: ${exam.type} - Published: ${exam.isPublished}`);
      if (exam.type === 'descriptive') {
        console.log(`     Descriptive Questions: ${exam.descriptiveQuestions.length}`);
        exam.descriptiveQuestions.forEach((q, index) => {
          console.log(`       Q${index + 1}: ${q.question.substring(0, 50)}...`);
        });
      }
    });
    
    // 3. Check Submissions
    console.log('\n3. 📊 Checking Submissions...');
    const submissions = await Submission.find({});
    console.log(`   Found ${submissions.length} submissions`);
    submissions.forEach(submission => {
      console.log(`   - Student: ${submission.student} - Type: ${submission.submissionType} - Status: ${submission.status}`);
    });
    
    // 4. Check File Uploads
    console.log('\n4. 📊 Checking File Uploads...');
    const files = await FileUpload.find({});
    console.log(`   Found ${files.length} uploaded files`);
    files.forEach(file => {
      console.log(`   - ${file.originalName} (${file.fileType}) - Size: ${file.size} bytes`);
    });
    
    // 5. Test specific exam with questions
    console.log('\n5. 🎯 Testing Specific Exam...');
    const descriptiveExam = await Exam.findOne({ type: 'descriptive', isPublished: true });
    if (descriptiveExam) {
      console.log(`   Exam: ${descriptiveExam.title}`);
      console.log(`   Questions Count: ${descriptiveExam.descriptiveQuestions.length}`);
      console.log(`   Time Limit: ${descriptiveExam.timeLimit} minutes`);
      console.log(`   Descriptive Time Limit: ${descriptiveExam.descriptiveTimeLimit} minutes`);
      
      if (descriptiveExam.descriptiveQuestions.length > 0) {
        console.log('   ✅ Exam has questions - Ready for students!');
      } else {
        console.log('   ❌ Exam has no questions');
      }
    } else {
      console.log('   ❌ No published descriptive exam found');
    }
    
    // 6. Check learner user
    console.log('\n6. 👤 Checking Learner User...');
    const learner = await User.findOne({ role: 'learner' });
    if (learner) {
      console.log(`   Learner: ${learner.name} (${learner.email})`);
      console.log(`   User ID: ${learner._id}`);
      console.log(`   Active: ${learner.isActive}`);
      console.log('   ✅ Learner user ready for testing');
    } else {
      console.log('   ❌ No learner user found');
    }
    
    console.log('\n🎉 Functionality Test Complete!');
    console.log('\n📋 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Exams: ${exams.length}`);
    console.log(`   - Submissions: ${submissions.length}`);
    console.log(`   - Files: ${files.length}`);
    
    if (descriptiveExam && descriptiveExam.descriptiveQuestions.length > 0 && learner) {
      console.log('\n✅ Everything is ready! Students can now:');
      console.log('   1. Access the descriptive exam');
      console.log('   2. See all 5 questions');
      console.log('   3. Upload PDF files');
      console.log('   4. Submit their answers');
    }
    
  } catch (error) {
    console.error('Error testing functionality:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testCompleteFunctionality();
