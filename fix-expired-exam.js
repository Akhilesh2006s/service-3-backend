import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function fixExpiredExamination() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import the model
    const VoiceExamination = mongoose.model('VoiceExamination', new mongoose.Schema({
      title: String,
      teluguTitle: String,
      paragraph: String,
      teluguParagraph: String,
      instructions: String,
      teluguInstructions: String,
      timeLimit: Number,
      maxScore: Number,
      passingScore: Number,
      isPublished: Boolean,
      isActive: Boolean,
      publishedAt: Date,
      expiresAt: Date,
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }, { timestamps: true }));

    // Find the expired examination
    const expiredExam = await VoiceExamination.findOne({
      _id: '68a1e4de073779440c51eebc'
    });

    if (!expiredExam) {
      console.log('❌ Examination not found');
      return;
    }

    console.log('🔍 Found expired examination:');
    console.log(`Title: ${expiredExam.title}`);
    console.log(`Current expiresAt: ${expiredExam.expiresAt}`);

    // Remove the expiration date
    expiredExam.expiresAt = null;
    await expiredExam.save();

    console.log('✅ Fixed examination - removed expiration date');

    // Verify the fix
    const fixedExam = await VoiceExamination.findById('68a1e4de073779440c51eebc');
    console.log(`Updated expiresAt: ${fixedExam.expiresAt}`);

    // Check how many examinations are now available for students
    const availableExams = await VoiceExamination.find({
      isPublished: true,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    console.log(`\n✅ Now ${availableExams.length} examinations are available for students:`);
    availableExams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.title} (${exam.teluguTitle})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixExpiredExamination();








