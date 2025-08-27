import mongoose from 'mongoose';
import Exam from './models/Exam.js';
import Submission from './models/Submission.js';
import User from './models/User.js';

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

// Create test data
const createTestData = async () => {
  try {
    console.log('Creating test data...');

    // Create a trainer
    const trainer = new User({
      name: 'Test Trainer',
      email: 'trainer@test.com',
      phone: '1234567890',
      password: 'password123',
      role: 'trainer',
      isActive: true
    });
    await trainer.save();
    console.log('✅ Trainer created:', trainer._id);

    // Create a learner
    const learner = new User({
      name: 'Test Learner',
      email: 'learner@test.com',
      phone: '0987654321',
      password: 'password123',
      role: 'learner',
      isActive: true
    });
    await learner.save();
    console.log('✅ Learner created:', learner._id);

    // Create an exam
    const exam = new Exam({
      title: 'Telugu Basics Test',
      description: 'Test exam for basic Telugu knowledge',
      type: 'mcq',
      category: 'comprehensive',
      difficulty: 'beginner',
      milestone: 1,
      timeLimit: 30,
      passingScore: 70,
      mcqQuestions: [
        {
          question: 'What is the first vowel in Telugu?',
          options: ['అ', 'ఆ', 'ఇ', 'ఈ'],
          correctAnswer: 0,
          explanation: 'అ (a) is the first vowel in Telugu',
          points: 1
        },
        {
          question: 'Which of these is a Telugu consonant?',
          options: ['క', 'ఖ', 'గ', 'All of the above'],
          correctAnswer: 3,
          explanation: 'క, ఖ, గ are all Telugu consonants',
          points: 1
        },
        {
          question: 'How do you say "Hello" in Telugu?',
          options: ['నమస్కారం', 'ధన్యవాదాలు', 'క్షమించండి', 'ఎలా ఉన్నారు'],
          correctAnswer: 0,
          explanation: 'నమస్కారం means Hello in Telugu',
          points: 1
        }
      ],
      isActive: true,
      isPublished: true,
      allowRetakes: false,
      maxAttempts: 1,
      createdBy: trainer._id
    });
    await exam.save();
    console.log('✅ Exam created:', exam._id);

    // Create a test submission
    const submission = new Submission({
      student: learner._id,
      exam: exam._id,
      type: 'exam',
      submissionType: 'mcq',
      mcqAnswers: [
        {
          questionIndex: 0,
          selectedAnswer: 0,
          isCorrect: true,
          timeSpent: 10
        },
        {
          questionIndex: 1,
          selectedAnswer: 3,
          isCorrect: true,
          timeSpent: 15
        },
        {
          questionIndex: 2,
          selectedAnswer: 0,
          isCorrect: true,
          timeSpent: 12
        }
      ],
      score: 100,
      totalQuestions: 3,
      correctAnswers: 3,
      timeSpent: 37,
      status: 'evaluated',
      submittedAt: new Date(),
      answers: {
        'q_0': 0,
        'q_1': 3,
        'q_2': 0
      }
    });
    await submission.save();
    console.log('✅ Submission created:', submission._id);

    console.log('\n🎉 Test data created successfully!');
    console.log('\nTest Credentials:');
    console.log('Trainer:', { email: 'trainer@test.com', password: 'password123' });
    console.log('Learner:', { email: 'learner@test.com', password: 'password123' });
    console.log('Exam ID:', exam._id);
    console.log('Submission ID:', submission._id);

  } catch (error) {
    console.error('Error creating test data:', error);
  }
};

// Test exam flow
const testExamFlow = async () => {
  try {
    console.log('Testing exam flow...');

    // Get the exam
    const exam = await Exam.findOne({ title: 'Telugu Basics Test' });
    if (!exam) {
      console.log('❌ Exam not found');
      return;
    }
    console.log('✅ Exam found:', exam.title);

    // Get submissions for this exam
    const submissions = await Submission.find({ exam: exam._id }).populate('student', 'name email');
    console.log('✅ Submissions found:', submissions.length);
    
    submissions.forEach(sub => {
      console.log(`- Student: ${sub.student.name}, Score: ${sub.score}%, Status: ${sub.status}`);
    });

    // Test scoring calculation
    const testAnswers = {
      'q_0': 0, // Correct
      'q_1': 2, // Wrong
      'q_2': 0  // Correct
    };

    let correctCount = 0;
    exam.mcqQuestions.forEach((question, index) => {
      const studentAnswer = testAnswers[`q_${index}`];
      if (studentAnswer === question.correctAnswer) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / exam.mcqQuestions.length) * 100);
    console.log(`✅ Score calculation test: ${correctCount}/${exam.mcqQuestions.length} = ${calculatedScore}%`);

  } catch (error) {
    console.error('Error testing exam flow:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  
  if (process.argv.includes('--create')) {
    await createTestData();
  } else if (process.argv.includes('--test')) {
    await testExamFlow();
  } else {
    console.log('Usage:');
    console.log('  node test-exam-flow.js --create  # Create test data');
    console.log('  node test-exam-flow.js --test    # Test exam flow');
  }

  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};

main().catch(console.error);
