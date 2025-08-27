import mongoose from 'mongoose';

const videoLectureSchema = new mongoose.Schema({
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
  milestone: {
    type: Number,
    required: true,
    min: 1,
    max: 19
  },
  videoUrl: {
    type: String,
    required: true,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isYouTubeVideo: {
    type: Boolean,
    default: false
  },
  youtubeVideoId: {
    type: String,
    trim: true
  },
  embedUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
videoLectureSchema.index({ milestone: 1, status: 1 });
videoLectureSchema.index({ createdBy: 1 });

// Virtual for formatted duration
videoLectureSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return 'Unknown';
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Ensure virtual fields are serialized
videoLectureSchema.set('toJSON', { virtuals: true });
videoLectureSchema.set('toObject', { virtuals: true });

const VideoLecture = mongoose.model('VideoLecture', videoLectureSchema);

export default VideoLecture;

