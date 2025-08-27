import mongoose from 'mongoose';

const fileUploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam'
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'audio', 'video', 'document'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
fileUploadSchema.index({ uploadedBy: 1, examId: 1 });
fileUploadSchema.index({ submissionId: 1 });
fileUploadSchema.index({ fileType: 1 });

const FileUpload = mongoose.model('FileUpload', fileUploadSchema);

export default FileUpload;
