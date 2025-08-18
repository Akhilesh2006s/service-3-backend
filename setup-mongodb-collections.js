import mongoose from 'mongoose';
import User from './models/User.js';
import Exam from './models/Exam.js';
import Submission from './models/Submission.js';
import LearningActivity from './models/LearningActivity.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telugu-learning');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test users
const createUsers = async () => {
  try {
    console.log('Creating test users...');

    // Create a trainer
    const trainer = new User({
      name: 'Telugu Trainer',
      email: 'trainer@telugu.com',
      phone: '1234567890',
      password: '$2a$10$BCOikfK061J1TLeFYmaz5.ObsRCEafzisXXu9sCj/NiM7vtDmrE/m', // password123
      role: 'trainer',
      isVerified: true,
      isActive: true
    });
    await trainer.save();
    console.log('✅ Trainer created:', trainer._id);

    // Create a learner
    const learner = new User({
      name: 'Test Learner',
      email: 'learner@telugu.com',
      phone: '0987654321',
      password: '$2a$10$U0ssZ6zwRUP6NwGm99OHDuP0c.IBi9.lgrYfY7ESSYFiep/HSpkcq', // password123
      role: 'learner',
      isVerified: true,
      isActive: true
    });
    await learner.save();
    console.log('✅ Learner created:', learner._id);

    // Create an evaluator
    const evaluator = new User({
      name: 'Test Evaluator',
      email: 'evaluator@telugu.com',
      phone: '5555555555',
      password: '$2a$10$fDVQbYwyuNhZfCQPX6GDD.rqDptLiRqqkqaNQnENuLFlAt3gyIZg2', // password123
      role: 'evaluator',
      isVerified: true,
      isActive: true
    });
    await evaluator.save();
    console.log('✅ Evaluator created:', evaluator._id);

    return { trainer, learner, evaluator };
  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
};

// Create test exams
const createExams = async (trainer) => {
  try {
    console.log('Creating test exams...');

    // Create MCQ exam
    const mcqExam = new Exam({
      title: 'Basic Telugu Assessment',
      description: 'Test your knowledge of basic Telugu vowels and numbers',
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
    await mcqExam.save();
    console.log('✅ MCQ Exam created:', mcqExam._id);

    // Create Mixed exam
    const mixedExam = new Exam({
      title: 'Telugu Speaking Test',
      description: 'Test your Telugu speaking and writing skills',
      type: 'mixed',
      category: 'comprehensive',
      difficulty: 'intermediate',
      milestone: 2,
      timeLimit: 45,
      passingScore: 70,
      mcqQuestions: [
        {
          question: 'What is the Telugu word for "Thank you"?',
          options: ['నమస్కారం', 'ధన్యవాదాలు', 'క్షమించండి', 'ఎలా ఉన్నారు'],
          correctAnswer: 1,
          explanation: 'ధన్యవాదాలు means Thank you in Telugu',
          points: 1
        }
      ],
      voiceQuestions: [
        {
          question: 'Please pronounce the Telugu word "నమస్కారం"',
          targetWords: ['నమస్కారం'],
          instructions: 'Speak clearly and pronounce each syllable correctly',
          points: 2
        }
      ],
      isActive: true,
      isPublished: true,
      allowRetakes: false,
      maxAttempts: 1,
      createdBy: trainer._id
    });
    await mixedExam.save();
    console.log('✅ Mixed Exam created:', mixedExam._id);

    return { mcqExam, mixedExam };
  } catch (error) {
    console.error('❌ Error creating exams:', error);
    throw error;
  }
};

// Create test learning activities
const createActivities = async (trainer) => {
  try {
    console.log('Creating test activities...');

    const activity = new LearningActivity({
      title: 'Telugu Vowels Practice',
      teluguTitle: 'తెలుగు అచ్చులు అభ్యాసం',
      type: 'video',
      category: 'vowels',
      difficulty: 'beginner',
      milestone: 1,
      order: 1,
      duration: 15,
      description: 'Learn the basic Telugu vowels through interactive video lessons',
      videoUrl: 'https://example.com/video1.mp4',
      videoThumbnail: 'https://example.com/thumbnail1.jpg',
      videoDuration: 900,
      isPublished: true,
      isActive: true,
      createdBy: trainer._id
    });
    await activity.save();
    console.log('✅ Learning Activity created:', activity._id);

    return { activity };
  } catch (error) {
    console.error('❌ Error creating activities:', error);
    throw error;
  }
};

// Create test submissions
const createSubmissions = async (learner, exams) => {
  try {
    console.log('Creating test submissions...');

    // Create a completed submission
    const submission = new Submission({
      student: learner._id,
      exam: exams.mcqExam._id,
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
      submittedAt: new Date()
    });
    await submission.save();
    console.log('✅ Submission created:', submission._id);

    return { submission };
  } catch (error) {
    console.error('❌ Error creating submissions:', error);
    throw error;
  }
};

// Main setup function
const setupMongoDB = async () => {
  try {
    console.log('🚀 Setting up MongoDB collections and test data...\n');

    await connectDB();

    // Clear existing data (optional)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Exam.deleteMany({});
    await Submission.deleteMany({});
    await LearningActivity.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create test data
    const users = await createUsers();
    console.log('\n');
    
    const exams = await createExams(users.trainer);
    console.log('\n');
    
    const activities = await createActivities(users.trainer);
    console.log('\n');
    
    const submissions = await createSubmissions(users.learner, exams);
    console.log('\n');

    console.log('🎉 MongoDB setup completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Trainer:', { email: 'trainer@telugu.com', password: 'password123' });
    console.log('Learner:', { email: 'learner@telugu.com', password: 'password123' });
    console.log('Evaluator:', { email: 'evaluator@telugu.com', password: 'password123' });
    console.log('\n📊 Created Data:');
    console.log('- Users:', Object.keys(users).length);
    console.log('- Exams:', Object.keys(exams).length);
    console.log('- Activities:', Object.keys(activities).length);
    console.log('- Submissions:', Object.keys(submissions).length);

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

// Run setup
setupMongoDB();
