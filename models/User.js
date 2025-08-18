import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['learner', 'trainer', 'evaluator', 'admin'],
    default: 'learner'
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  profilePicture: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Learner specific fields
  learnerProfile: {
    currentMilestone: {
      type: Number,
      default: 1
    },
    totalProgress: {
      type: Number,
      default: 0
    },
    completedActivities: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningActivity'
    }],
    completedExams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam'
    }],
    enrolledDate: {
      type: Date,
      default: Date.now
    }
  },
  // Trainer specific fields
  trainerProfile: {
    specialization: {
      type: String,
      default: 'Telugu Language'
    },
    assignedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    totalStudents: {
      type: Number,
      default: 0
    }
  },
  // Evaluator specific fields
  evaluatorProfile: {
    specialization: {
      type: String,
      default: 'Speech Evaluation'
    },
    evaluationCount: {
      type: Number,
      default: 0
    }
  },
  // Common fields
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User; 