import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exam from './models/Exam.js';

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

const addDescriptiveQuestions = async () => {
  console.log('Adding descriptive questions to exams...\n');
  
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('❌ Could not connect to MongoDB');
    return;
  }
  
  try {
    // Find the descriptive exam
    const exam = await Exam.findOne({ 
      type: 'descriptive',
      isPublished: true 
    });
    
    if (!exam) {
      console.log('❌ No published descriptive exam found');
      return;
    }
    
    console.log(`Found exam: ${exam.title} (ID: ${exam._id})`);
    console.log(`Current questions: ${exam.descriptiveQuestions.length}`);
    
    // Add descriptive questions
    const descriptiveQuestions = [
      {
        question: "Explain the importance of Telugu vowels (అచ్చులు) in the language. How do they differ from consonants?",
        instructions: "Write a detailed explanation covering at least 3 key points about Telugu vowels and their role in pronunciation.",
        maxPoints: 15,
        wordLimit: 200
      },
      {
        question: "Describe the Telugu number system from 1 to 10. Include both the Telugu script and their pronunciation.",
        instructions: "List the numbers in Telugu script, provide their pronunciation in English, and explain any unique characteristics.",
        maxPoints: 10,
        wordLimit: 150
      },
      {
        question: "What are the basic greetings in Telugu? Explain when and how to use them in different contexts.",
        instructions: "Provide at least 5 common greetings with their meanings and appropriate usage scenarios.",
        maxPoints: 12,
        wordLimit: 180
      },
      {
        question: "Explain the concept of Telugu consonants (హల్లులు) and their classification system.",
        instructions: "Describe the different types of consonants and provide examples of each category.",
        maxPoints: 15,
        wordLimit: 250
      },
      {
        question: "Write about Telugu grammar basics, focusing on sentence structure and word order.",
        instructions: "Explain the typical Subject-Object-Verb (SOV) structure in Telugu with examples.",
        maxPoints: 18,
        wordLimit: 300
      }
    ];
    
    // Update the exam with descriptive questions
    exam.descriptiveQuestions = descriptiveQuestions;
    await exam.save();
    
    console.log(`✅ Added ${descriptiveQuestions.length} descriptive questions to exam`);
    console.log('Questions added:');
    descriptiveQuestions.forEach((q, index) => {
      console.log(`  ${index + 1}. ${q.question.substring(0, 60)}...`);
    });
    
  } catch (error) {
    console.error('Error adding questions:', error);
  } finally {
    await mongoose.disconnect();
  }
};

addDescriptiveQuestions();
