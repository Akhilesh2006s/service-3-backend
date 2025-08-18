import mongoose from 'mongoose';

const voiceExaminationSubmissionSchema = new mongoose.Schema({
  examinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceExamination',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audioData: {
    type: String, // Base64 encoded audio
    required: false // Optional for submissions without audio
  },
  audioUrl: {
    type: String,
    required: false // Optional for submissions without audio
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  transcribedText: {
    type: String,
    default: ''
  },
  teluguTranscribedText: {
    type: String,
    default: ''
  },
  accuracy: {
    type: Number, // percentage (0-100)
    default: 0
  },
  fluency: {
    type: Number, // percentage (0-100)
    default: 0
  },
  pronunciation: {
    type: Number, // percentage (0-100)
    default: 0
  },
  overallScore: {
    type: Number, // percentage (0-100)
    default: 0
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  evaluationDetails: {
    wordAccuracy: {
      type: Number,
      default: 0
    },
    characterAccuracy: {
      type: Number,
      default: 0
    },
    speedScore: {
      type: Number,
      default: 0
    },
    pauseScore: {
      type: Number,
      default: 0
    },
    confidenceScore: {
      type: Number,
      default: 0
    },
    wordErrors: [{
      original: String,
      transcribed: String,
      position: Number
    }],
    characterErrors: [{
      original: String,
      transcribed: String,
      position: Number
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'evaluated', 'failed'],
    default: 'pending'
  },
  evaluationNotes: {
    type: String,
    default: ''
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  evaluatedAt: {
    type: Date
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  isRetake: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
voiceExaminationSubmissionSchema.index({ examinationId: 1, studentId: 1 });
voiceExaminationSubmissionSchema.index({ studentId: 1, status: 1 });
voiceExaminationSubmissionSchema.index({ status: 1, evaluatedAt: 1 });

// Pre-save middleware to calculate overall score and pass status
voiceExaminationSubmissionSchema.pre('save', function(next) {
  if (this.accuracy !== undefined && this.fluency !== undefined && this.pronunciation !== undefined) {
    // Calculate overall score as weighted average
    this.overallScore = Math.round(
      (this.accuracy * 0.4) + (this.fluency * 0.3) + (this.pronunciation * 0.3)
    );
    
    // Determine if passed (assuming 70% is passing)
    this.isPassed = this.overallScore >= 70;
  }
  next();
});

export default mongoose.model('VoiceExaminationSubmission', voiceExaminationSubmissionSchema);

