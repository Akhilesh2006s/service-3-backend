import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'voice', 'mixed', 'descriptive'],
    required: true
  },
  category: {
    type: String,
    enum: ['vowels', 'consonants', 'numbers', 'basic_phrases', 'grammar', 'pronunciation', 'comprehensive'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  milestone: {
    type: Number,
    required: true,
    min: 1,
    max: 19
  },
  timeLimit: {
    type: Number, // in minutes
    required: true
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  // MCQ Questions
  mcqQuestions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true
    },
    explanation: {
      type: String
    },
    points: {
      type: Number,
      default: 1
    }
  }],
  // Voice Questions
  voiceQuestions: [{
    question: {
      type: String,
      required: true
    },
    targetWords: [{
      type: String,
      required: true
    }],
    sampleAudioUrl: {
      type: String
    },
    instructions: {
      type: String
    },
    points: {
      type: Number,
      default: 1
    }
  }],
  // Descriptive Questions
  descriptiveQuestions: [{
    question: {
      type: String,
      required: true
    },
    instructions: {
      type: String
    },
    maxPoints: {
      type: Number,
      default: 10
    },
    wordLimit: {
      type: Number
    },
    attachments: [{
      type: String // URLs to reference materials
    }]
  }],
  // Mixed exam settings
  questionDistribution: {
    mcq: {
      type: Number,
      default: 0
    },
    voice: {
      type: Number,
      default: 0
    }
  },
  // Exam settings
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  allowRetakes: {
    type: Boolean,
    default: true
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  // Schedule settings for descriptive exams
  openDate: {
    type: Date
  },
  descriptiveTimeLimit: {
    type: Number, // in minutes
    min: 15,
    max: 480 // 8 hours max
  },
  totalMaxMarks: {
    type: Number,
    default: 100,
    min: 1,
    max: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Statistics
  stats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    totalPasses: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
examSchema.index({ milestone: 1, type: 1 });
examSchema.index({ isPublished: 1, isActive: 1 });
examSchema.index({ category: 1, difficulty: 1 });

const Exam = mongoose.model('Exam', examSchema);

export default Exam; 