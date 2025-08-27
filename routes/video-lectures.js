import express from 'express';
import VideoLecture from '../models/VideoLecture.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper function to extract YouTube video ID
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

// Helper function to check if URL is YouTube
const isYouTubeUrl = (url) => {
  if (!url) return false;
  
  const youtubeDomains = [
    'youtube.com',
    'www.youtube.com',
    'youtu.be',
    'www.youtu.be'
  ];
  
  try {
    const urlObj = new URL(url);
    return youtubeDomains.some(domain => urlObj.hostname === domain);
  } catch {
    return false;
  }
};

// GET /api/video-lectures - Get all video lectures (for trainers)
router.get('/', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const videoLectures = await VideoLecture.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: videoLectures
    });
  } catch (error) {
    console.error('Error fetching video lectures:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video lectures'
    });
  }
});

// GET /api/video-lectures/student - Get published video lectures for students
router.get('/student', auth, requireRole(['learner']), async (req, res) => {
  try {
    const videoLectures = await VideoLecture.find({ 
      status: 'published' 
    })
    .populate('createdBy', 'name')
    .sort({ milestone: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: videoLectures
    });
  } catch (error) {
    console.error('Error fetching video lectures for student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video lectures'
    });
  }
});

// GET /api/video-lectures/:id - Get specific video lecture
router.get('/:id', auth, async (req, res) => {
  try {
    const videoLecture = await VideoLecture.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!videoLecture) {
      return res.status(404).json({
        success: false,
        message: 'Video lecture not found'
      });
    }
    
    res.json({
      success: true,
      data: videoLecture
    });
  } catch (error) {
    console.error('Error fetching video lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video lecture'
    });
  }
});

// POST /api/video-lectures - Create new video lecture
router.post('/', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { title, description, milestone, videoUrl, thumbnailUrl } = req.body;
    
    // Validate required fields
    if (!title || !description || !milestone || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, milestone, videoUrl'
      });
    }
    
    // Check if milestone is valid
    if (milestone < 1 || milestone > 19) {
      return res.status(400).json({
        success: false,
        message: 'Milestone must be between 1 and 19'
      });
    }
    
    // Check if YouTube video
    const isYouTube = isYouTubeUrl(videoUrl);
    const youtubeVideoId = isYouTube ? extractYouTubeVideoId(videoUrl) : null;
    const embedUrl = youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : '';
    
    // Create video lecture
    const videoLecture = new VideoLecture({
      title,
      description,
      milestone,
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      createdBy: req.user._id,
      isYouTubeVideo: isYouTube,
      youtubeVideoId,
      embedUrl
    });
    
    await videoLecture.save();
    
    res.status(201).json({
      success: true,
      message: 'Video lecture created successfully',
      data: videoLecture
    });
  } catch (error) {
    console.error('Error creating video lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create video lecture'
    });
  }
});

// PUT /api/video-lectures/:id - Update video lecture
router.put('/:id', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { title, description, milestone, videoUrl, thumbnailUrl, status } = req.body;
    
    const videoLecture = await VideoLecture.findById(req.params.id);
    
    if (!videoLecture) {
      return res.status(404).json({
        success: false,
        message: 'Video lecture not found'
      });
    }
    
    // Check if user owns this video lecture
    if (videoLecture.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own video lectures'
      });
    }
    
    // Update fields
    if (title) videoLecture.title = title;
    if (description) videoLecture.description = description;
    if (milestone) {
      if (milestone < 1 || milestone > 19) {
        return res.status(400).json({
          success: false,
          message: 'Milestone must be between 1 and 19'
        });
      }
      videoLecture.milestone = milestone;
    }
    if (videoUrl) {
      videoLecture.videoUrl = videoUrl;
      const isYouTube = isYouTubeUrl(videoUrl);
      videoLecture.isYouTubeVideo = isYouTube;
      videoLecture.youtubeVideoId = isYouTube ? extractYouTubeVideoId(videoUrl) : null;
      videoLecture.embedUrl = videoLecture.youtubeVideoId ? `https://www.youtube.com/embed/${videoLecture.youtubeVideoId}` : '';
    }
    if (thumbnailUrl !== undefined) videoLecture.thumbnailUrl = thumbnailUrl;
    if (status) videoLecture.status = status;
    
    await videoLecture.save();
    
    res.json({
      success: true,
      message: 'Video lecture updated successfully',
      data: videoLecture
    });
  } catch (error) {
    console.error('Error updating video lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video lecture'
    });
  }
});

// DELETE /api/video-lectures/:id - Delete video lecture
router.delete('/:id', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const videoLecture = await VideoLecture.findById(req.params.id);
    
    if (!videoLecture) {
      return res.status(404).json({
        success: false,
        message: 'Video lecture not found'
      });
    }
    
    // Check if user owns this video lecture
    if (videoLecture.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own video lectures'
      });
    }
    
    await VideoLecture.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Video lecture deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video lecture'
    });
  }
});

// PATCH /api/video-lectures/:id/publish - Publish video lecture
router.patch('/:id/publish', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const videoLecture = await VideoLecture.findById(req.params.id);
    
    if (!videoLecture) {
      return res.status(404).json({
        success: false,
        message: 'Video lecture not found'
      });
    }
    
    // Check if user owns this video lecture
    if (videoLecture.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only publish your own video lectures'
      });
    }
    
    videoLecture.status = 'published';
    await videoLecture.save();
    
    res.json({
      success: true,
      message: 'Video lecture published successfully',
      data: videoLecture
    });
  } catch (error) {
    console.error('Error publishing video lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish video lecture'
    });
  }
});

export default router;

