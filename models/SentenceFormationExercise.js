import mongoose from 'mongoose';

const sentenceFormationExerciseSchema = new mongoose.Schema({
  sentenceType: {
    type: String,
    enum: ['te-en', 'en-te'],
    required: true
  },
  sourceSentence: {
    type: String,
    required: true
  },
  targetMeaning: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  words: {
    original: [String],
    jumbled: [String],
    correctOrder: [Number]
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
});

// Update the updatedAt field before saving
sentenceFormationExerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SentenceFormationExercise = mongoose.model('SentenceFormationExercise', sentenceFormationExerciseSchema);

export default SentenceFormationExercise;

