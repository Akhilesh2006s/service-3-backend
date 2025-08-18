import fs from 'fs';
import path from 'path';

const SUBMISSIONS_FILE = path.join(process.cwd(), 'submissions.json');

// Shared submission storage
let submissions = new Map();

// Load submissions from file
export const loadSubmissions = () => {
  console.log('🔄 Loading submissions from file:', SUBMISSIONS_FILE);
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const submissionsData = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
      submissions = new Map(Object.entries(submissionsData));
      console.log(`✅ Shared submission storage - Loaded ${submissions.size} submissions from file`);
      console.log('📋 Submission IDs:', Array.from(submissions.keys()));
    } else {
      console.log('📁 No submissions file found, starting fresh');
    }
  } catch (error) {
    console.error('❌ Error loading submissions:', error);
    console.log('🔄 Starting with empty submissions storage');
  }
};

// Save submissions to file
export const saveSubmissions = () => {
  console.log('💾 Saving submissions to file:', SUBMISSIONS_FILE);
  try {
    const submissionsData = Object.fromEntries(submissions);
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissionsData, null, 2));
    console.log(`✅ Shared submission storage - Saved ${submissions.size} submissions to file`);
    console.log('📋 Saved submission IDs:', Array.from(submissions.keys()));
  } catch (error) {
    console.error('❌ Shared submission storage - Error saving submissions:', error);
  }
};

// Get all submissions
export const getAllSubmissions = () => {
  return Array.from(submissions.values());
};

// Get submission by ID
export const getSubmissionById = (id) => {
  return submissions.get(id);
};

// Get submissions by student ID
export const getSubmissionsByStudent = (studentId) => {
  return Array.from(submissions.values()).filter(
    submission => submission.student === studentId
  );
};

// Get submissions by exam ID
export const getSubmissionsByExam = (examId) => {
  return Array.from(submissions.values()).filter(
    submission => submission.exam === examId
  );
};

// Get submissions by status
export const getSubmissionsByStatus = (status) => {
  return Array.from(submissions.values()).filter(
    submission => submission.status === status
  );
};

// Add submission
export const addSubmission = (submission) => {
  const id = Date.now().toString();
  const newSubmission = {
    _id: id,
    ...submission,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  console.log('➕ Adding submission:', id, 'Type:', submission.submissionType, 'Milestone:', submission.milestone);
  submissions.set(id, newSubmission);
  saveSubmissions();
  return newSubmission;
};

// Update submission
export const updateSubmission = (id, updates) => {
  const submission = submissions.get(id);
  if (submission) {
    const updatedSubmission = { ...submission, ...updates, updatedAt: new Date() };
    submissions.set(id, updatedSubmission);
    saveSubmissions();
    return updatedSubmission;
  }
  return null;
};

// Delete submission
export const deleteSubmission = (id) => {
  const deleted = submissions.delete(id);
  if (deleted) {
    saveSubmissions();
  }
  return deleted;
};

// Count submissions
export const countSubmissions = (query = {}) => {
  let filteredSubmissions = Array.from(submissions.values());
  
  if (query.status) {
    filteredSubmissions = filteredSubmissions.filter(s => s.status === query.status);
  }
  
  if (query.type) {
    filteredSubmissions = filteredSubmissions.filter(s => s.submissionType === query.type);
  }
  
  return filteredSubmissions.length;
};

// Initialize submission storage
loadSubmissions();






