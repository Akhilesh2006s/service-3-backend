import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority';

async function testVoiceSubmission() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the Submission model
    const Submission = mongoose.model('Submission', new mongoose.Schema({
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: String,
      submissionType: String,
      milestone: Number,
      voiceRecording: Object,
      status: String,
      submittedAt: Date
    }));

    // Check for existing voice submissions
    const voiceSubmissions = await Submission.find({ submissionType: 'voice' }).populate('student');
    
    console.log('\n🎤 Voice Submissions Found:');
    voiceSubmissions.forEach((sub, index) => {
      console.log(`\n${index + 1}. Submission ID: ${sub._id}`);
      console.log(`   Student: ${sub.student?.name || 'Unknown'}`);
      console.log(`   Milestone: ${sub.milestone}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Type: ${sub.type}`);
      console.log(`   Submitted: ${sub.submittedAt}`);
      if (sub.voiceRecording) {
        console.log(`   Duration: ${sub.voiceRecording.duration}s`);
        console.log(`   File: ${sub.voiceRecording.fileName}`);
      }
    });

    // Check for pending submissions (should be visible to evaluators)
    const pendingSubmissions = await Submission.find({ status: 'pending' });
    console.log(`\n⏳ Pending submissions: ${pendingSubmissions.length}`);

    // Check for voice submissions specifically
    const pendingVoiceSubmissions = await Submission.find({ 
      status: 'pending', 
      submissionType: 'voice' 
    });
    console.log(`⏳ Pending voice submissions: ${pendingVoiceSubmissions.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testVoiceSubmission();


