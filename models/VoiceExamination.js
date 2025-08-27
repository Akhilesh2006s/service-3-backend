import mongoose from 'mongoose';

const voiceExaminationSchema = new mongoose.Schema({
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
  paragraph: {
    type: String,
    required: true,
    trim: true
  },
  teluguParagraph: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  teluguInstructions: {
    type: String,
    required: true,
    trim: true
  },
  timeLimit: {
    type: Number,
    default: 300, // 5 minutes in seconds
    min: 60,
    max: 1800 // 30 minutes max
  },
  maxScore: {
    type: Number,
    default: 100,
    min: 1,
    max: 100
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 1,
    max: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['reading', 'pronunciation', 'fluency', 'comprehension'],
    default: 'reading'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  characterCount: {
    type: Number,
    default: 0
  },
  estimatedReadingTime: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate word count, character count, and estimated reading time
voiceExaminationSchema.pre('save', function(next) {
  if (this.paragraph) {
    this.wordCount = this.paragraph.trim().split(/\s+/).length;
    this.characterCount = this.paragraph.length;
    // Estimate reading time: average 150 words per minute for Telugu
    this.estimatedReadingTime = Math.ceil((this.wordCount / 150) * 60);
  }
  next();
});

// Index for efficient queries
voiceExaminationSchema.index({ createdBy: 1, isActive: 1 });
voiceExaminationSchema.index({ isPublished: 1, isActive: 1 });
voiceExaminationSchema.index({ expiresAt: 1 });

export default mongoose.model('VoiceExamination', voiceExaminationSchema);









