import mongoose from 'mongoose';

const dictationExerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'very_hard', 'expert'],
    required: true
  },
  words: [{
    word: {
      type: String,
      required: true,
      trim: true
    },
    meaning: {
      type: String,
      trim: true
    },
    pronunciation: {
      type: String,
      trim: true
    }
  }],
  totalWords: {
    type: Number,
    required: true,
    min: 1
  },
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
dictationExerciseSchema.index({ difficulty: 1, isPublished: 1, isActive: 1 });
dictationExerciseSchema.index({ createdBy: 1 });

export default mongoose.model('DictationExercise', dictationExerciseSchema);
