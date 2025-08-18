import mongoose from 'mongoose';

const teluguUnitSchema = new mongoose.Schema({
  lessonName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  teluguLessonName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  paragraphs: [{
    content: { 
      type: String, 
      required: true 
    },
    teluguContent: { 
      type: String, 
      required: true 
    },
    order: { 
      type: Number, 
      default: 0 
    }
  }],
  milestone: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 19 
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
  tags: [{ 
    type: String, 
    trim: true 
  }],
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    default: 'medium' 
  },
  estimatedTime: { 
    type: Number, 
    default: 10 // minutes
  }
}, { 
  timestamps: true 
});

// Add indexes for better query performance
teluguUnitSchema.index({ milestone: 1, isActive: 1 });
teluguUnitSchema.index({ createdBy: 1 });
teluguUnitSchema.index({ createdAt: -1 });

const TeluguUnit = mongoose.model('TeluguUnit', teluguUnitSchema);

export default TeluguUnit;

