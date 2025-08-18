import express from 'express';
import TeluguUnit from '../models/TeluguUnit.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all Telugu units
router.get('/', async (req, res) => {
  try {
    const { milestone, isActive } = req.query;
    const filter = {};
    
    if (milestone) filter.milestone = milestone;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const units = await TeluguUnit.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({ units });
  } catch (error) {
    console.error('Error fetching Telugu units:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single Telugu unit by ID
router.get('/:id', async (req, res) => {
  try {
    const unit = await TeluguUnit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Telugu unit not found' });
    }
    res.json(unit);
  } catch (error) {
    console.error('Error fetching Telugu unit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new Telugu unit (Trainer only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Access denied. Trainers only.' });
    }

    const {
      lessonName,
      teluguLessonName,
      paragraphs,
      milestone,
      isActive = true,
      difficulty,
      estimatedTime,
      tags
    } = req.body;

    const newUnit = new TeluguUnit({
      lessonName,
      teluguLessonName,
      paragraphs: paragraphs || [],
      milestone,
      isActive,
      difficulty,
      estimatedTime,
      tags: tags || [],
      createdBy: req.user.userId || req.user._id
    });

    const savedUnit = await newUnit.save();
    res.status(201).json(savedUnit);
  } catch (error) {
    console.error('Error creating Telugu unit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a Telugu unit (Trainer only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Access denied. Trainers only.' });
    }

    const {
      lessonName,
      teluguLessonName,
      paragraphs,
      milestone,
      isActive,
      difficulty,
      estimatedTime,
      tags
    } = req.body;

    const updateData = {
      lessonName,
      teluguLessonName,
      paragraphs,
      milestone,
      isActive,
      difficulty,
      estimatedTime,
      tags
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedUnit = await TeluguUnit.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUnit) {
      return res.status(404).json({ message: 'Telugu unit not found' });
    }

    res.json(updatedUnit);
  } catch (error) {
    console.error('Error updating Telugu unit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a Telugu unit (Trainer only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Access denied. Trainers only.' });
    }

    const deletedUnit = await TeluguUnit.findByIdAndDelete(req.params.id);
    if (!deletedUnit) {
      return res.status(404).json({ message: 'Telugu unit not found' });
    }

    res.json({ message: 'Telugu unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting Telugu unit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get units by milestone
router.get('/milestone/:milestone', async (req, res) => {
  try {
    const units = await TeluguUnit.find({ 
      milestone: parseInt(req.params.milestone),
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ units });
  } catch (error) {
    console.error('Error fetching units by milestone:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
