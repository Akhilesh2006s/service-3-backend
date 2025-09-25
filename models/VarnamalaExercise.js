import mongoose from 'mongoose';

const varnamalaExerciseSchema = new mongoose.Schema({
  teluguWord: {
    type: String,
    required: true
  },
  englishMeaning: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  letters: {
    original: [String], // Individual letters of the word
    jumbled: [String],  // Jumbled letters + random letters for confusion
    correctOrder: [Number], // Correct order indices
    randomLetters: [String] // Additional random letters for confusion
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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
varnamalaExerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const VarnamalaExercise = mongoose.model('VarnamalaExercise', varnamalaExerciseSchema);

export default VarnamalaExercise;
