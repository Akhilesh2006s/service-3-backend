import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningActivity'
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam'
  },
  type: {
    type: String,
    enum: ['activity', 'exam', 'voice_practice', 'milestone'],
    required: true
  },
  submissionType: {
    type: String,
    enum: ['voice', 'mcq', 'mixed', 'descriptive'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'evaluated', 'approved', 'rejected'],
    default: 'pending'
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Milestone for milestone voice recordings
  milestone: {
    type: Number,
    min: 1,
    max: 19
  },
  // Voice recording data
  voiceRecording: {
    audioBlob: {
      type: String // Base64 encoded audio data
    },
    audioUrl: {
      type: String
    },
    duration: {
      type: Number // in seconds
    },
    fileSize: {
      type: Number // in bytes
    },
    fileName: {
      type: String
    },
    transcription: {
      type: String
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  // MCQ answers
  mcqAnswers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedAnswer: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean
    },
    timeSpent: {
      type: Number // in seconds
    }
  }],
  // Voice answers for exams
  voiceAnswers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    audioUrl: {
      type: String
    },
    duration: {
      type: Number
    },
    transcription: {
      type: String
    }
  }],
  // Descriptive answers for exams
  descriptiveAnswers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    answer: {
      type: String
    },
    pdfUrl: {
      type: String
    },
    fileName: {
      type: String
    },
    fileSize: {
      type: Number // in bytes
    },
    attachments: [{
      fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileUpload'
      },
      fileName: String,
      fileUrl: String,
      fileType: String
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Results and scoring
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number
  },
  correctAnswers: {
    type: Number
  },
  timeSpent: {
    type: Number // in minutes
  },
  // Evaluation data (optional - only created when evaluated)
  evaluation: {
    type: {
      evaluatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      evaluatedAt: {
        type: Date
      },
      // Voice evaluation scores
      pronunciationScore: {
        type: Number,
        min: 0,
        max: 10
      },
      clarityScore: {
        type: Number,
        min: 0,
        max: 10
      },
      toneScore: {
        type: Number,
        min: 0,
        max: 10
      },
      // Descriptive evaluation scores
      contentScore: {
        type: Number,
        min: 0,
        max: 10
      },
      grammarScore: {
        type: Number,
        min: 0,
        max: 10
      },
      structureScore: {
        type: Number,
        min: 0,
        max: 10
      },
      overallScore: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: {
        type: String
      },
      tags: [{
        type: String,
        enum: ['pronunciation', 'tone', 'clarity', 'speed', 'grammar', 'confidence', 'content', 'structure', 'creativity']
      }],
      suggestions: [{
        type: String
      }]
    },
    default: undefined
  },
  // Metadata
  attemptNumber: {
    type: Number,
    default: 1
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  // AI Analysis (if available)
  aiAnalysis: {
    pronunciationAccuracy: {
      type: Number,
      min: 0,
      max: 100
    },
    fluencyScore: {
      type: Number,
      min: 0,
      max: 100
    },
    confidenceLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    detectedIssues: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

// Index for efficient queries
submissionSchema.index({ student: 1, type: 1 });
submissionSchema.index({ status: 1, submittedAt: -1 });
submissionSchema.index({ activity: 1, student: 1 });
submissionSchema.index({ exam: 1, student: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission; 