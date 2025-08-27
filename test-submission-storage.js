import { addSubmission, getAllSubmissions, loadSubmissions } from './utils/submissionStorage.js';

console.log('🧪 Testing submission storage...');

// Load existing submissions
loadSubmissions();

// Add a test submission
const testSubmission = {
  student: 'test-user-id',
  type: 'milestone',
  submissionType: 'voice',
  milestone: 1,
  voiceRecording: {
    audioBlob: 'test-audio-data',
    duration: 10,
    fileName: 'test-recording.wav',
    submittedAt: new Date()
  },
  stepTitle: 'Test Step',
  lessonId: 'test-lesson',
  lessonTitle: 'Test Lesson',
  status: 'pending',
  submittedAt: new Date()
};

console.log('➕ Adding test submission...');
const addedSubmission = addSubmission(testSubmission);
console.log('✅ Added submission:', addedSubmission._id);

// Get all submissions
const allSubmissions = getAllSubmissions();
console.log('📋 Total submissions:', allSubmissions.length);
console.log('📋 Submission IDs:', allSubmissions.map(s => s._id));

console.log('✅ Test completed!');
