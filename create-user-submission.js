import { addSubmission, getAllSubmissions, loadSubmissions } from './utils/submissionStorage.js';

console.log('🧪 Creating voice recording submission for real user...');

// Load existing submissions
loadSubmissions();

// Get all existing submissions to see what's there
const allSubmissions = getAllSubmissions();
console.log('📋 Current submissions:', allSubmissions.map(s => ({ id: s._id, student: s.student, type: s.submissionType })));

// Create a submission for a real user (you can replace this with the actual user ID)
const realUserId = '507f1f77bcf86cd799439011'; // Example MongoDB ObjectId format

const realUserSubmission = {
  student: realUserId,
  type: 'milestone',
  submissionType: 'voice',
  milestone: 1,
  voiceRecording: {
    audioBlob: 'real-user-audio-data',
    duration: 15,
    fileName: 'real-user-recording.wav',
    submittedAt: new Date()
  },
  stepTitle: 'Telugu Basics - Lesson 1: Vowels',
  lessonId: 'lesson-1',
  lessonTitle: 'Telugu Basics - Lesson 1: Vowels (అ నుండి అహా వరకు)',
  status: 'pending',
  submittedAt: new Date()
};

console.log('➕ Adding real user submission...');
const addedSubmission = addSubmission(realUserSubmission);
console.log('✅ Added submission:', addedSubmission._id);

// Get all submissions again
const updatedSubmissions = getAllSubmissions();
console.log('📋 Updated submissions:', updatedSubmissions.map(s => ({ id: s._id, student: s.student, type: s.submissionType })));

console.log('✅ Real user submission created!');
console.log('💡 Note: You may need to replace the user ID with your actual user ID from the frontend');
