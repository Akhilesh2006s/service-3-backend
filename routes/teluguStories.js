import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import TeluguStory from '../models/TeluguStory.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/telugu-stories';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and audio files are allowed!'));
    }
  }
});

// Get all stories (for learners)
router.get('/', auth, async (req, res) => {
  try {
    const { milestone, category, difficulty, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    if (milestone) query.milestone = parseInt(milestone);
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    const stories = await TeluguStory.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await TeluguStory.countDocuments(query);
    
    res.json({
      stories,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
});

// Get stories by trainer (MUST BE BEFORE /:id route)
router.get('/trainer/my-stories', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const stories = await TeluguStory.find({ createdBy: req.user._id || req.user.userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await TeluguStory.countDocuments({ createdBy: req.user._id || req.user.userId });
    
    res.json({
      stories,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching trainer stories:', error);
    res.status(500).json({ message: 'Error fetching stories', error: error.message });
  }
});

// Get story by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const story = await TeluguStory.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching story', error: error.message });
  }
});

// Create new story (trainers only)
router.post('/', auth, requireRole(['trainer', 'admin']), upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      teluguTitle,
      content,
      teluguContent,
      category,
      difficulty,
      milestone,
      tags,
      readingTime,
      paragraphs
    } = req.body;

    // Handle photo uploads
    const photos = [];
    if (req.files && req.files.photos) {
      req.files.photos.forEach((file, index) => {
        photos.push({
          url: `/uploads/telugu-stories/${file.filename}`,
          caption: req.body[`photoCaption_${index}`] || '',
          teluguCaption: req.body[`photoTeluguCaption_${index}`] || '',
          order: index
        });
      });
    }

    // Handle audio upload (optional)
    let audioUrl = null;
    if (req.files && req.files.audio && req.files.audio[0]) {
      audioUrl = `/uploads/telugu-stories/${req.files.audio[0].filename}`;
    }

    // Parse paragraphs if provided
    let parsedParagraphs = [];
    if (paragraphs) {
      try {
        parsedParagraphs = JSON.parse(paragraphs);
      } catch (e) {
        parsedParagraphs = [];
      }
    }

    const story = new TeluguStory({
      title,
      teluguTitle,
      content,
      teluguContent,
      category,
      difficulty,
      milestone: parseInt(milestone),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      readingTime: parseInt(readingTime) || 5,
      photos,
      paragraphs: parsedParagraphs,
      audioUrl,
      createdBy: req.user._id || req.user.userId
    });

    await story.save();
    
    res.status(201).json({
      message: 'Story created successfully',
      story
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: 'Error creating story', error: error.message });
  }
});

// Update story (trainers only)
router.put('/:id', auth, requireRole(['trainer', 'admin']), upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'audio', maxCount: 1 }
]), async (req, res) => {
  try {
    const story = await TeluguStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user is the creator or admin
    if (story.createdBy.toString() !== (req.user._id || req.user.userId).toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this story' });
    }

    const {
      title,
      teluguTitle,
      content,
      teluguContent,
      category,
      difficulty,
      milestone,
      tags,
      readingTime,
      paragraphs
    } = req.body;

    // Handle photo uploads
    if (req.files && req.files.photos) {
      const newPhotos = req.files.photos.map((file, index) => ({
        url: `/uploads/telugu-stories/${file.filename}`,
        caption: req.body[`photoCaption_${index}`] || '',
        teluguCaption: req.body[`photoTeluguCaption_${index}`] || '',
        order: index
      }));
      story.photos = [...story.photos, ...newPhotos];
    }

    // Handle audio upload (optional)
    if (req.files && req.files.audio && req.files.audio[0]) {
      story.audioUrl = `/uploads/telugu-stories/${req.files.audio[0].filename}`;
    }

    // Parse paragraphs if provided
    if (paragraphs) {
      try {
        story.paragraphs = JSON.parse(paragraphs);
      } catch (e) {
        // Keep existing paragraphs if parsing fails
      }
    }

    // Update other fields
    if (title) story.title = title;
    if (teluguTitle) story.teluguTitle = teluguTitle;
    if (content) story.content = content;
    if (teluguContent) story.teluguContent = teluguContent;
    if (category) story.category = category;
    if (difficulty) story.difficulty = difficulty;
    if (milestone) story.milestone = parseInt(milestone);
    if (tags) story.tags = tags.split(',').map(tag => tag.trim());
    if (readingTime) story.readingTime = parseInt(readingTime);

    await story.save();
    
    res.json({
      message: 'Story updated successfully',
      story
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating story', error: error.message });
  }
});

// Delete story (trainers only)
router.delete('/:id', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const story = await TeluguStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user is the creator or admin
    if (story.createdBy.toString() !== (req.user._id || req.user.userId).toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this story' });
    }

    // Delete associated files
    if (story.photos.length > 0) {
      story.photos.forEach(photo => {
        const filePath = path.join(process.cwd(), photo.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    if (story.audioUrl) {
      const filePath = path.join(process.cwd(), story.audioUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await TeluguStory.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting story', error: error.message });
  }
});

// Upload paragraph audio
router.post('/:id/paragraphs/:paragraphIndex/audio', auth, requireRole(['trainer', 'admin']), upload.single('audio'), async (req, res) => {
  try {
    const story = await TeluguStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const paragraphIndex = parseInt(req.params.paragraphIndex);
    
    if (paragraphIndex < 0 || paragraphIndex >= story.paragraphs.length) {
      return res.status(400).json({ message: 'Invalid paragraph index' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    // Update paragraph with audio
    story.paragraphs[paragraphIndex].audioUrl = `/uploads/telugu-stories/${req.file.filename}`;
    story.paragraphs[paragraphIndex].hasAudio = true;

    await story.save();
    
    res.json({
      message: 'Paragraph audio uploaded successfully',
      paragraph: story.paragraphs[paragraphIndex]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading paragraph audio', error: error.message });
  }
});

// Delete photo from story
router.delete('/:id/photos/:photoIndex', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const story = await TeluguStory.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const photoIndex = parseInt(req.params.photoIndex);
    
    if (photoIndex < 0 || photoIndex >= story.photos.length) {
      return res.status(400).json({ message: 'Invalid photo index' });
    }

    // Delete file from filesystem
    const photo = story.photos[photoIndex];
    const filePath = path.join(process.cwd(), photo.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove photo from array
    story.photos.splice(photoIndex, 1);
    await story.save();
    
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting photo', error: error.message });
  }
});

export default router;
