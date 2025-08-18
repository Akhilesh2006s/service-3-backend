import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function debugVoiceExaminations() {
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

    console.log('\n🔍 Checking ALL voice examinations in database:');
    const allExaminations = await VoiceExamination.find({}).sort({ createdAt: -1 });
    console.log(`Total examinations found: ${allExaminations.length}`);

    allExaminations.forEach((exam, index) => {
      console.log(`\n--- Examination ${index + 1} ---`);
      console.log(`ID: ${exam._id}`);
      console.log(`Title: ${exam.title}`);
      console.log(`Telugu Title: ${exam.teluguTitle}`);
      console.log(`isPublished: ${exam.isPublished}`);
      console.log(`isActive: ${exam.isActive}`);
      console.log(`publishedAt: ${exam.publishedAt}`);
      console.log(`expiresAt: ${exam.expiresAt}`);
      console.log(`createdBy: ${exam.createdBy}`);
      console.log(`Created: ${exam.createdAt}`);
    });

    console.log('\n🔍 Checking published and active examinations:');
    const publishedExaminations = await VoiceExamination.find({
      isPublished: true,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });
    console.log(`Published and active examinations: ${publishedExaminations.length}`);

    publishedExaminations.forEach((exam, index) => {
      console.log(`\n--- Published Examination ${index + 1} ---`);
      console.log(`ID: ${exam._id}`);
      console.log(`Title: ${exam.title}`);
      console.log(`isPublished: ${exam.isPublished}`);
      console.log(`isActive: ${exam.isActive}`);
      console.log(`publishedAt: ${exam.publishedAt}`);
      console.log(`expiresAt: ${exam.expiresAt}`);
    });

    console.log('\n🔍 Checking examinations by publication status:');
    const publishedCount = await VoiceExamination.countDocuments({ isPublished: true });
    const activeCount = await VoiceExamination.countDocuments({ isActive: true });
    const bothCount = await VoiceExamination.countDocuments({ isPublished: true, isActive: true });
    
    console.log(`Total published: ${publishedCount}`);
    console.log(`Total active: ${activeCount}`);
    console.log(`Total published AND active: ${bothCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugVoiceExaminations();
