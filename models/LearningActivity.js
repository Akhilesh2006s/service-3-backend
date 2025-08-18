import mongoose from 'mongoose';

const learningActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  teluguTitle: {
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
    enum: ['video', 'practice', 'assessment', 'voice'],
    required: true
  },
  category: {
    type: String,
    enum: ['vowels', 'consonants', 'numbers', 'basic_phrases', 'grammar', 'pronunciation'],
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
  order: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  // Video content
  videoUrl: {
    type: String,
    required: function() { return this.type === 'video'; }
  },
  videoThumbnail: {
    type: String
  },
  videoDuration: {
    type: Number // in seconds
  },
  // Practice content
  practiceContent: {
    type: String,
    required: function() { return this.type === 'practice'; }
  },
  practiceInstructions: {
    type: String
  },
  // Assessment content
  questions: [{
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
    }
  }],
  // Voice practice
  voicePractice: {
    targetWords: [{
      type: String,
      required: true
    }],
    sampleAudioUrl: {
      type: String
    },
    instructions: {
      type: String
    }
  },
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Statistics
  stats: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
learningActivitySchema.index({ milestone: 1, order: 1 });
learningActivitySchema.index({ type: 1, category: 1 });
learningActivitySchema.index({ isPublished: 1, isActive: 1 });

const LearningActivity = mongoose.model('LearningActivity', learningActivitySchema);

export default LearningActivity; 