import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import LearningActivity from '../models/LearningActivity.js';
import { auth, requireTrainer, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure Multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const milestone = req.body.milestone || 1;
    const uploadPath = path.join(process.cwd(), 'public', 'videos', `milestone-${milestone}`);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit for local storage
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and audio files are allowed'), false);
    }
  }
});

// Helper function to get video URL for local storage
const getLocalVideoUrl = (filePath, milestone) => {
  if (!filePath) return null;
  
  // Extract filename from path
  const filename = path.basename(filePath);
  return `/videos/milestone-${milestone}/${filename}`;
};

// Helper function to generate thumbnail placeholder
const getVideoThumbnail = (milestone) => {
  // Return a placeholder thumbnail URL - you can create actual thumbnails later
  return `/videos/milestone-${milestone}/thumbnail.jpg`;
};

// Get all learning activities (for learners)
router.get('/', auth, async (req, res) => {
  try {
    const activities = await LearningActivity.find({ isPublished: true, isActive: true })
      .sort({ milestone: 1, order: 1 })
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
});

// Get learning activity by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await LearningActivity.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Update view count
    activity.stats.totalViews += 1;
    await activity.save();

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
});

// Create new learning activity (trainer/admin only)
router.post('/', auth, requireTrainer, upload.single('video'), async (req, res) => {
  try {
    const {
      title,
      teluguTitle,
      description,
      type,
      category,
      difficulty,
      milestone,
      order,
      duration,
      practiceContent,
      practiceInstructions,
      questions,
      voicePractice,
      tags
    } = req.body;

    let videoUrl = null;
    let videoThumbnail = null;
    let videoDuration = null;

    // Handle local video storage if provided
    if (req.file && type === 'video') {
      videoUrl = getLocalVideoUrl(req.file.path, milestone);
      videoThumbnail = getVideoThumbnail(milestone);
      
      // For local files, we'll set a default duration
      // You can implement video duration extraction later if needed
      videoDuration = 0; // Will be updated when video is processed
    }

    const activity = new LearningActivity({
      title,
      teluguTitle,
      description,
      type,
      category,
      difficulty,
      milestone: parseInt(milestone),
      order: parseInt(order),
      duration: parseInt(duration),
      videoUrl,
      videoThumbnail,
      videoDuration,
      practiceContent,
      practiceInstructions,
      questions: questions ? JSON.parse(questions) : [],
      voicePractice: voicePractice ? JSON.parse(voicePractice) : {},
      tags: tags ? JSON.parse(tags) : [],
      createdBy: req.user._id
    });

    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Learning activity created successfully',
      data: activity
    });

  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activity',
      error: error.message
    });
  }
});

// Update learning activity (trainer/admin only)
router.put('/:id', auth, requireTrainer, upload.single('video'), async (req, res) => {
  try {
    const activity = await LearningActivity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if user can edit this activity
    if (activity.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this activity'
      });
    }

    const updateData = { ...req.body };

    // Handle local video upload if provided
    if (req.file && req.body.type === 'video') {
      updateData.videoUrl = getLocalVideoUrl(req.file.path, req.body.milestone || activity.milestone);
      updateData.videoThumbnail = getVideoThumbnail(req.body.milestone || activity.milestone);
      updateData.videoDuration = 0; // Will be updated when video is processed
    }

    // Parse JSON fields
    if (updateData.questions) {
      updateData.questions = JSON.parse(updateData.questions);
    }
    if (updateData.voicePractice) {
      updateData.voicePractice = JSON.parse(updateData.voicePractice);
    }
    if (updateData.tags) {
      updateData.tags = JSON.parse(updateData.tags);
    }

    const updatedActivity = await LearningActivity.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivity
    });

  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity',
      error: error.message
    });
  }
});

// Delete learning activity (admin only)
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const activity = await LearningActivity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await LearningActivity.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message
    });
  }
});

// Mark activity as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const { score, timeSpent } = req.body;
    
    // This would typically update user progress
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Activity completed successfully'
    });

  } catch (error) {
    console.error('Complete activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete activity',
      error: error.message
    });
  }
});

// Upload practice recording
router.post('/:id/recordings', auth, upload.single('recording'), async (req, res) => {
  try {
    const { id } = req.params;
    const { milestone } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No recording file provided'
      });
    }

    // Create recordings directory if it doesn't exist
    const recordingsPath = path.join(process.cwd(), 'public', 'recordings', `milestone-${milestone}`);
    if (!fs.existsSync(recordingsPath)) {
      fs.mkdirSync(recordingsPath, { recursive: true });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const filename = `recording-${uniqueSuffix}${ext}`;
    const filePath = path.join(recordingsPath, filename);

    // Move file to recordings directory
    fs.renameSync(req.file.path, filePath);

    const recordingUrl = `/recordings/milestone-${milestone}/${filename}`;

    // Here you would save the recording info to database
    // For now, we'll just return success
    res.status(201).json({
      success: true,
      message: 'Recording uploaded successfully',
      data: {
        id: Date.now().toString(),
        url: recordingUrl,
        duration: 0, // Will be calculated from audio
        milestone: parseInt(milestone),
        uploadedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Upload recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload recording',
      error: error.message
    });
  }
});

// Submit recording for evaluation
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { recordingId, milestone } = req.body;

    // Here you would update the recording status to submitted
    // and create a submission record
    res.json({
      success: true,
      message: 'Recording submitted for evaluation'
    });

  } catch (error) {
    console.error('Submit recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit recording',
      error: error.message
    });
  }
});

// Get recordings for a milestone
router.get('/:id/recordings', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { milestone } = req.query;

    // Here you would fetch recordings from database
    // For now, return empty array
    res.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Get recordings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recordings',
      error: error.message
    });
  }
});

export default router; 