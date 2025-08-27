import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU?retryWrites=true&w=majority';

async function testSubmitVoice() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the User model
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      role: String
    }));

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

    // Find a learner user
    const learner = await User.findOne({ role: 'learner' });
    if (!learner) {
      console.log('❌ No learner found in database');
      return;
    }

    console.log(`🎤 Found learner: ${learner.name} (${learner._id})`);

    // Create a test voice submission
    const testSubmission = new Submission({
      student: learner._id,
      type: 'milestone',
      submissionType: 'voice',
      milestone: 1,
      voiceRecording: {
        audioBlob: 'test-audio-data-base64-encoded',
        duration: 30,
        fileName: 'test-milestone-1-recording.wav',
        submittedAt: new Date()
      },
      status: 'pending',
      submittedAt: new Date()
    });

    await testSubmission.save();
    console.log('✅ Test voice submission created successfully:', testSubmission._id);

    // Verify it appears in pending submissions
    const pendingSubmissions = await Submission.find({ status: 'pending' });
    console.log(`\n⏳ Pending submissions: ${pendingSubmissions.length}`);

    const pendingVoiceSubmissions = await Submission.find({ 
      status: 'pending', 
      submissionType: 'voice' 
    });
    console.log(`⏳ Pending voice submissions: ${pendingVoiceSubmissions.length}`);

    if (pendingVoiceSubmissions.length > 0) {
      console.log('✅ Voice submission is visible to evaluators!');
      pendingVoiceSubmissions.forEach((sub, index) => {
        console.log(`\n${index + 1}. Voice Submission:`);
        console.log(`   ID: ${sub._id}`);
        console.log(`   Milestone: ${sub.milestone}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Duration: ${sub.voiceRecording?.duration}s`);
        console.log(`   File: ${sub.voiceRecording?.fileName}`);
      });
    } else {
      console.log('❌ Voice submission not found in pending submissions');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSubmitVoice();


