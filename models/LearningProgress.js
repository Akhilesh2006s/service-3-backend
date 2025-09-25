import mongoose from 'mongoose';

const learningProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Telugu Dictation Progress
  dictation: {
    currentExerciseIndex: {
      type: Number,
      default: 0
    },
    completedExercises: [{
      exerciseId: Number,
      completedAt: {
        type: Date,
        default: Date.now
      },
      score: Number,
      attempts: Number
    }],
    totalScore: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },

  // Sentence Formation Progress
  sentenceFormation: {
    currentExerciseIndex: {
      type: Number,
      default: 0
    },
    completedExercises: [{
      exerciseId: Number,
      completedAt: {
        type: Date,
        default: Date.now
      },
      score: Number,
      attempts: Number,
      timeSpent: Number // in seconds
    }],
    totalScore: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },

  // Spelling Progress
  spelling: {
    currentExerciseIndex: {
      type: Number,
      default: 0
    },
    completedExercises: [{
      exerciseId: Number,
      completedAt: {
        type: Date,
        default: Date.now
      },
      score: Number,
      attempts: Number,
      hintsUsed: Number,
      timeSpent: Number // in seconds
    }],
    totalScore: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },

  // Handwriting Progress
  handwriting: {
    completedExercises: [{
      exerciseId: String,
      isCorrect: Boolean,
      attempts: {
        type: Number,
        default: 1
      },
      lastAttempted: {
        type: Date,
        default: Date.now
      }
    }],
    totalScore: {
      type: Number,
      default: 0
    },
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },

  // Overall Statistics
  overallStats: {
    totalExercisesCompleted: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
learningProgressSchema.index({ userId: 1 });

// Method to update dictation progress
learningProgressSchema.methods.updateDictationProgress = function(exerciseId, score, attempts = 1) {
  const existingIndex = this.dictation.completedExercises.findIndex(
    ex => ex.exerciseId === exerciseId
  );

  if (existingIndex >= 0) {
    // Update existing exercise
    this.dictation.completedExercises[existingIndex].score = Math.max(
      this.dictation.completedExercises[existingIndex].score,
      score
    );
    this.dictation.completedExercises[existingIndex].attempts += attempts;
    this.dictation.completedExercises[existingIndex].completedAt = new Date();
  } else {
    // Add new completed exercise
    this.dictation.completedExercises.push({
      exerciseId,
      score,
      attempts,
      completedAt: new Date()
    });
  }

  // Update current exercise index
  this.dictation.currentExerciseIndex = Math.max(
    this.dictation.currentExerciseIndex,
    exerciseId + 1
  );

  // Update totals
  this.dictation.totalScore = this.dictation.completedExercises.reduce(
    (sum, ex) => sum + ex.score, 0
  );
  this.dictation.totalAttempts = this.dictation.completedExercises.reduce(
    (sum, ex) => sum + ex.attempts, 0
  );
  this.dictation.lastAccessed = new Date();

  // Update overall stats
  this.updateOverallStats();
};

// Method to update sentence formation progress
learningProgressSchema.methods.updateSentenceFormationProgress = function(exerciseId, score, attempts = 1, timeSpent = 0) {
  const existingIndex = this.sentenceFormation.completedExercises.findIndex(
    ex => ex.exerciseId === exerciseId
  );

  if (existingIndex >= 0) {
    // Update existing exercise
    this.sentenceFormation.completedExercises[existingIndex].score = Math.max(
      this.sentenceFormation.completedExercises[existingIndex].score,
      score
    );
    this.sentenceFormation.completedExercises[existingIndex].attempts += attempts;
    this.sentenceFormation.completedExercises[existingIndex].timeSpent += timeSpent;
    this.sentenceFormation.completedExercises[existingIndex].completedAt = new Date();
  } else {
    // Add new completed exercise
    this.sentenceFormation.completedExercises.push({
      exerciseId,
      score,
      attempts,
      timeSpent,
      completedAt: new Date()
    });
  }

  // Update current exercise index
  this.sentenceFormation.currentExerciseIndex = Math.max(
    this.sentenceFormation.currentExerciseIndex,
    exerciseId + 1
  );

  // Update totals
  this.sentenceFormation.totalScore = this.sentenceFormation.completedExercises.reduce(
    (sum, ex) => sum + ex.score, 0
  );
  this.sentenceFormation.totalAttempts = this.sentenceFormation.completedExercises.reduce(
    (sum, ex) => sum + ex.attempts, 0
  );
  this.sentenceFormation.lastAccessed = new Date();

  // Update overall stats
  this.updateOverallStats();
};

// Method to update spelling progress
learningProgressSchema.methods.updateSpellingProgress = function(exerciseId, score, attempts = 1, hintsUsed = 0, timeSpent = 0) {
  const existingIndex = this.spelling.completedExercises.findIndex(
    ex => ex.exerciseId === exerciseId
  );

  if (existingIndex >= 0) {
    // Update existing exercise
    this.spelling.completedExercises[existingIndex].score = Math.max(
      this.spelling.completedExercises[existingIndex].score,
      score
    );
    this.spelling.completedExercises[existingIndex].attempts += attempts;
    this.spelling.completedExercises[existingIndex].hintsUsed += hintsUsed;
    this.spelling.completedExercises[existingIndex].timeSpent += timeSpent;
    this.spelling.completedExercises[existingIndex].completedAt = new Date();
  } else {
    // Add new completed exercise
    this.spelling.completedExercises.push({
      exerciseId,
      score,
      attempts,
      hintsUsed,
      timeSpent,
      completedAt: new Date()
    });
  }

  // Update current exercise index
  this.spelling.currentExerciseIndex = Math.max(
    this.spelling.currentExerciseIndex,
    exerciseId + 1
  );

  // Update totals
  this.spelling.totalScore = this.spelling.completedExercises.reduce(
    (sum, ex) => sum + ex.score, 0
  );
  this.spelling.totalAttempts = this.spelling.completedExercises.reduce(
    (sum, ex) => sum + ex.attempts, 0
  );
  this.spelling.lastAccessed = new Date();

  // Update overall stats
  this.updateOverallStats();
};

// Method to update overall statistics
learningProgressSchema.methods.updateOverallStats = function() {
  const allCompleted = [
    ...this.dictation.completedExercises,
    ...this.sentenceFormation.completedExercises,
    ...this.spelling.completedExercises,
    ...(this.handwriting ? this.handwriting.completedExercises : [])
  ];

  this.overallStats.totalExercisesCompleted = allCompleted.length;
  
  if (allCompleted.length > 0) {
    this.overallStats.averageScore = allCompleted.reduce(
      (sum, ex) => {
        // Handle different exercise types
        if (ex.score !== undefined) {
          return sum + ex.score;
        } else if (ex.isCorrect !== undefined) {
          return sum + (ex.isCorrect ? 1 : 0);
        }
        return sum;
      }, 0
    ) / allCompleted.length;
  }

  const totalTimeSpent = [
    ...this.sentenceFormation.completedExercises,
    ...this.spelling.completedExercises
  ].reduce((sum, ex) => sum + (ex.timeSpent || 0), 0);

  this.overallStats.totalTimeSpent = Math.round(totalTimeSpent / 60); // Convert to minutes
  this.overallStats.lastActivity = new Date();
};

// Method to get progress summary
learningProgressSchema.methods.getProgressSummary = function() {
  return {
    dictation: {
      currentIndex: this.dictation.currentExerciseIndex,
      completed: this.dictation.completedExercises.length,
      totalScore: this.dictation.totalScore,
      totalAttempts: this.dictation.totalAttempts,
      lastAccessed: this.dictation.lastAccessed
    },
    sentenceFormation: {
      currentIndex: this.sentenceFormation.currentExerciseIndex,
      completed: this.sentenceFormation.completedExercises.length,
      totalScore: this.sentenceFormation.totalScore,
      totalAttempts: this.sentenceFormation.totalAttempts,
      lastAccessed: this.sentenceFormation.lastAccessed
    },
    spelling: {
      currentIndex: this.spelling.currentExerciseIndex,
      completed: this.spelling.completedExercises.length,
      totalScore: this.spelling.totalScore,
      totalAttempts: this.spelling.totalAttempts,
      lastAccessed: this.spelling.lastAccessed
    },
    handwriting: {
      completed: this.handwriting ? this.handwriting.completedExercises.length : 0,
      totalScore: this.handwriting ? this.handwriting.totalScore : 0,
      totalAttempts: this.handwriting ? this.handwriting.totalAttempts : 0,
      correctAnswers: this.handwriting ? this.handwriting.correctAnswers : 0,
      lastAccessed: this.handwriting ? this.handwriting.lastAccessed : null
    },
    overall: this.overallStats
  };
};

// Method to reset progress for a specific module
learningProgressSchema.methods.resetModuleProgress = function(moduleName) {
  if (moduleName === 'dictation') {
    this.dictation = {
      currentExerciseIndex: 0,
      completedExercises: [],
      totalScore: 0,
      totalAttempts: 0,
      lastAccessed: new Date()
    };
  } else if (moduleName === 'sentenceFormation') {
    this.sentenceFormation = {
      currentExerciseIndex: 0,
      completedExercises: [],
      totalScore: 0,
      totalAttempts: 0,
      lastAccessed: new Date()
    };
  } else if (moduleName === 'spelling') {
    this.spelling = {
      currentExerciseIndex: 0,
      completedExercises: [],
      totalScore: 0,
      totalAttempts: 0,
      lastAccessed: new Date()
    };
  }

  this.updateOverallStats();
};

// Method to calculate overall average score
learningProgressSchema.methods.calculateOverallAverage = function() {
  const modules = ['dictation', 'sentenceFormation', 'spelling', 'handwriting'];
  let totalScore = 0;
  let totalAttempts = 0;
  
  modules.forEach(module => {
    if (this[module]) {
      totalScore += this[module].totalScore || 0;
      totalAttempts += this[module].totalAttempts || 0;
    }
  });
  
  return totalAttempts > 0 ? (totalScore / totalAttempts) * 100 : 0;
};

export default mongoose.model('LearningProgress', learningProgressSchema);
