import mongoose from 'mongoose';
import Submission from './models/Submission.js';
import User from './models/User.js';
import Exam from './models/Exam.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telugu-learning');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test submission creation
const testSubmission = async () => {
  try {
    console.log('Testing submission creation...');

    // First, check if we have users and exams
    const users = await User.find({});
    const exams = await Exam.find({});
    
    console.log('Users found:', users.length);
    console.log('Exams found:', exams.length);

    if (users.length === 0) {
      console.log('❌ No users found. Creating test user...');
      const testUser = new User({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'learner',
        isActive: true
      });
      await testUser.save();
      console.log('✅ Test user created:', testUser._id);
    }

    if (exams.length === 0) {
      console.log('❌ No exams found. Creating test exam...');
      const testExam = new Exam({
        title: 'Test Exam',
        description: 'Test exam for debugging',
        type: 'mcq',
        category: 'comprehensive',
        difficulty: 'beginner',
        milestone: 1,
        timeLimit: 30,
        passingScore: 70,
        mcqQuestions: [
          {
            question: 'Test question 1?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'A is correct',
            points: 1
          }
        ],
        isActive: true,
        isPublished: true,
        allowRetakes: false,
        maxAttempts: 1,
        createdBy: users[0]?._id || '507f1f77bcf86cd799439011'
      });
      await testExam.save();
      console.log('✅ Test exam created:', testExam._id);
    }

    // Get the first user and exam
    const user = await User.findOne({ role: 'learner' });
    const exam = await Exam.findOne({});

    if (!user || !exam) {
      console.log('❌ Missing user or exam');
      return;
    }

    console.log('Using user:', user._id);
    console.log('Using exam:', exam._id);

    // Test submission data
    const submissionData = {
      student: user._id,
      exam: exam._id,
      type: 'exam',
      submissionType: 'mcq',
      mcqAnswers: [
        {
          questionIndex: 0,
          selectedAnswer: 0,
          isCorrect: true,
          timeSpent: 10
        }
      ],
      score: 100,
      totalQuestions: 1,
      correctAnswers: 1,
      timeSpent: 10,
      status: 'evaluated',
      submittedAt: new Date()
    };

    console.log('Creating submission with data:', submissionData);

    const submission = new Submission(submissionData);
    await submission.save();

    console.log('✅ Submission created successfully:', submission._id);

    // Verify the submission was saved
    const savedSubmission = await Submission.findById(submission._id);
    console.log('✅ Verification - Saved submission:', {
      id: savedSubmission._id,
      student: savedSubmission.student,
      exam: savedSubmission.exam,
      score: savedSubmission.score,
      status: savedSubmission.status
    });

  } catch (error) {
    console.error('❌ Error testing submission:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
};

// Test the submission endpoint
const testSubmissionEndpoint = async () => {
  try {
    console.log('Testing submission endpoint...');

    const user = await User.findOne({ role: 'learner' });
    const exam = await Exam.findOne({});

    if (!user || !exam) {
      console.log('❌ Missing user or exam for endpoint test');
      return;
    }

    // Create a test token
    const testToken = `test-token-${user._id}-learner`;

    const response = await fetch('https://service-3-backend-production.up.railway.app/api/submissions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        examId: exam._id,
        submissionType: 'mcq',
        score: 100,
        totalQuestions: 1,
        correctAnswers: 1,
        timeSpent: 10,
        answers: {
          'q_0': 0
        }
      })
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response body:', result);

    if (response.ok) {
      console.log('✅ Endpoint test successful');
    } else {
      console.log('❌ Endpoint test failed');
    }

  } catch (error) {
    console.error('❌ Error testing endpoint:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  
  if (process.argv.includes('--test-model')) {
    await testSubmission();
  } else if (process.argv.includes('--test-endpoint')) {
    await testSubmissionEndpoint();
  } else {
    console.log('Usage:');
    console.log('  node test-submission.js --test-model     # Test submission model');
    console.log('  node test-submission.js --test-endpoint  # Test submission endpoint');
  }

  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};

main().catch(console.error);
