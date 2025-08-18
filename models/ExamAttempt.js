import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  timeLimit: {
    type: Number,
    default: 60, // 60 minutes in minutes
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
examAttemptSchema.index({ student: 1, exam: 1 });

// Method to check if attempt is still valid (within time limit)
examAttemptSchema.methods.isValid = function() {
  if (this.isCompleted) return false;
  
  const now = new Date();
  const timeElapsed = (now - this.startedAt) / (1000 * 60); // Convert to minutes
  return timeElapsed <= this.timeLimit;
};

// Method to get remaining time in minutes
examAttemptSchema.methods.getRemainingTime = function() {
  if (this.isCompleted) return 0;
  
  const now = new Date();
  const timeElapsed = (now - this.startedAt) / (1000 * 60); // Convert to minutes
  const remaining = Math.max(0, this.timeLimit - timeElapsed);
  return Math.floor(remaining);
};

// Method to get time elapsed in minutes
examAttemptSchema.methods.getTimeElapsed = function() {
  const now = new Date();
  const timeElapsed = (now - this.startedAt) / (1000 * 60); // Convert to minutes
  return Math.floor(timeElapsed);
};

const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);

export default ExamAttempt;
