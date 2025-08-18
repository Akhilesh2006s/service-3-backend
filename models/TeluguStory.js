import mongoose from 'mongoose';

const teluguStorySchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  },
  teluguContent: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['historical', 'virtuous', 'educational', 'cultural', 'moral'],
    default: 'educational'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  milestone: {
    type: Number,
    required: true,
    min: 1,
    max: 19
  },
  wordCount: {
    type: Number,
    default: 0
  },
  photos: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    teluguCaption: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  }],
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
    },
    hasAudio: {
      type: Boolean,
      default: false
    },
    audioUrl: {
      type: String,
      default: null
    }
  }],
  audioUrl: {
    type: String,
    default: null
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
  readingTime: {
    type: Number, // in minutes
    default: 5
  }
}, {
  timestamps: true
});

// Calculate word count before saving
teluguStorySchema.pre('save', function(next) {
  if (this.teluguContent) {
    this.wordCount = this.teluguContent.split(/\s+/).length;
  }
  next();
});

// Index for better query performance
teluguStorySchema.index({ milestone: 1, category: 1, isActive: 1 });
teluguStorySchema.index({ createdBy: 1, createdAt: -1 });

const TeluguStory = mongoose.model('TeluguStory', teluguStorySchema);

export default TeluguStory;

