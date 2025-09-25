import mongoose from 'mongoose';

const teluguHandwritingExerciseSchema = new mongoose.Schema({
  teluguWord: { type: String, required: true },
  englishMeaning: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  audioUrl: { type: String }, // Optional: for custom audio
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
teluguHandwritingExerciseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TeluguHandwritingExercise = mongoose.model('TeluguHandwritingExercise', teluguHandwritingExerciseSchema);

export default TeluguHandwritingExercise;
