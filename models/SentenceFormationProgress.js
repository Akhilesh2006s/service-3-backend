import mongoose from 'mongoose';

const sentenceFormationProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentExerciseIndex: {
    type: Number,
    default: 0
  },
  score: {
    correct: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  completedExercises: [{
    exerciseId: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    selectedOrder: [Number],
    correctOrder: [Number],
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0
  },
  sessionStartTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
sentenceFormationProgressSchema.index({ userId: 1 });

// Method to update progress
sentenceFormationProgressSchema.methods.updateProgress = function(exerciseId, isCorrect, selectedOrder, correctOrder) {
  // Update score
  if (isCorrect) {
    this.score.correct += 1;
  }
  this.score.total += 1;

  // Add to completed exercises
  this.completedExercises.push({
    exerciseId,
    isCorrect,
    selectedOrder,
    correctOrder
  });

  // Update current exercise index
  this.currentExerciseIndex = Math.max(this.currentExerciseIndex, exerciseId);

  // Update last activity
  this.lastActivity = new Date();

  return this.save();
};

// Method to reset progress
sentenceFormationProgressSchema.methods.resetProgress = function() {
  this.currentExerciseIndex = 0;
  this.score = { correct: 0, total: 0 };
  this.completedExercises = [];
  this.lastActivity = new Date();
  this.sessionStartTime = new Date();
  this.totalTimeSpent = 0;
  
  return this.save();
};

// Method to get progress statistics
sentenceFormationProgressSchema.methods.getStats = function() {
  const accuracy = this.score.total > 0 ? (this.score.correct / this.score.total) * 100 : 0;
  
  return {
    currentExercise: this.currentExerciseIndex + 1,
    totalExercises: 100,
    score: this.score,
    accuracy: Math.round(accuracy * 100) / 100,
    completedCount: this.completedExercises.length,
    lastActivity: this.lastActivity
  };
};

export default mongoose.model('SentenceFormationProgress', sentenceFormationProgressSchema);

