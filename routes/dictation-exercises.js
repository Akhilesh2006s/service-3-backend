import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import DictationExercise from '../models/DictationExercise.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

const router = express.Router();

// Create dictation exercise (Trainer only)
router.post('/', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const { title, description, difficulty, words } = req.body;

    // Validate required fields
    if (!title || !description || !difficulty || !words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, difficulty, and words array are required'
      });
    }

    // Validate difficulty level
    const validDifficulties = ['easy', 'medium', 'hard', 'very_hard', 'expert'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level. Must be one of: easy, medium, hard, very_hard, expert'
      });
    }

    // Validate words array
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!word.word || typeof word.word !== 'string' || word.word.trim() === '') {
        return res.status(400).json({
          success: false,
          message: `Word at index ${i} is required and must be a non-empty string`
        });
      }
    }

    // Create dictation exercise
    const dictationExercise = new DictationExercise({
      title: title.trim(),
      description: description.trim(),
      difficulty,
      words: words.map(w => ({
        word: w.word.trim(),
        meaning: w.meaning ? w.meaning.trim() : '',
        pronunciation: w.pronunciation ? w.pronunciation.trim() : ''
      })),
      totalWords: words.length,
      createdBy: req.user._id
    });

    await dictationExercise.save();

    res.status(201).json({
      success: true,
      message: 'Dictation exercise created successfully',
      data: dictationExercise
    });

  } catch (error) {
    console.error('Error creating dictation exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dictation exercise',
      error: error.message
    });
  }
});

// Get all dictation exercises (Trainer - their own, Learner - published ones)
router.get('/', auth, async (req, res) => {
  try {
    let query = { isActive: true };

    // If user is a trainer, show their own exercises
    if (req.user.role === 'trainer') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'learner') {
      // If user is a learner, show only published exercises
      query.isPublished = true;
    }

    const dictationExercises = await DictationExercise.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: dictationExercises
    });

  } catch (error) {
    console.error('Error fetching dictation exercises:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dictation exercises',
      error: error.message
    });
  }
});

// Get dictation exercise by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    let query = { _id: id, isActive: true };

    // If user is a learner, only show published exercises
    if (req.user.role === 'learner') {
      query.isPublished = true;
    } else if (req.user.role === 'trainer') {
      // If user is a trainer, only show their own exercises
      query.createdBy = req.user._id;
    }

    const dictationExercise = await DictationExercise.findOne(query)
      .populate('createdBy', 'name email');

    if (!dictationExercise) {
      return res.status(404).json({
        success: false,
        message: 'Dictation exercise not found'
      });
    }

    res.json({
      success: true,
      data: dictationExercise
    });

  } catch (error) {
    console.error('Error fetching dictation exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dictation exercise',
      error: error.message
    });
  }
});

// Update dictation exercise (Trainer only - their own)
router.put('/:id', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, words, isPublished } = req.body;

    // Find the exercise and ensure it belongs to the trainer
    const dictationExercise = await DictationExercise.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!dictationExercise) {
      return res.status(404).json({
        success: false,
        message: 'Dictation exercise not found'
      });
    }

    // Update fields if provided
    if (title !== undefined) dictationExercise.title = title.trim();
    if (description !== undefined) dictationExercise.description = description.trim();
    if (difficulty !== undefined) {
      const validDifficulties = ['easy', 'medium', 'hard', 'very_hard', 'expert'];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid difficulty level. Must be one of: easy, medium, hard, very_hard, expert'
        });
      }
      dictationExercise.difficulty = difficulty;
    }
    if (words !== undefined) {
      if (!Array.isArray(words) || words.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Words must be a non-empty array'
        });
      }
      
      // Validate words
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (!word.word || typeof word.word !== 'string' || word.word.trim() === '') {
          return res.status(400).json({
            success: false,
            message: `Word at index ${i} is required and must be a non-empty string`
          });
        }
      }

      dictationExercise.words = words.map(w => ({
        word: w.word.trim(),
        meaning: w.meaning ? w.meaning.trim() : '',
        pronunciation: w.pronunciation ? w.pronunciation.trim() : ''
      }));
      dictationExercise.totalWords = words.length;
    }
    if (isPublished !== undefined) dictationExercise.isPublished = isPublished;

    dictationExercise.updatedAt = new Date();
    await dictationExercise.save();

    res.json({
      success: true,
      message: 'Dictation exercise updated successfully',
      data: dictationExercise
    });

  } catch (error) {
    console.error('Error updating dictation exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dictation exercise',
      error: error.message
    });
  }
});

// Delete dictation exercise (Trainer only - their own)
router.delete('/:id', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const { id } = req.params;

    const dictationExercise = await DictationExercise.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!dictationExercise) {
      return res.status(404).json({
        success: false,
        message: 'Dictation exercise not found'
      });
    }

    // Soft delete by setting isActive to false
    dictationExercise.isActive = false;
    await dictationExercise.save();

    res.json({
      success: true,
      message: 'Dictation exercise deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting dictation exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete dictation exercise',
      error: error.message
    });
  }
});

// Publish/Unpublish dictation exercise (Trainer only - their own)
router.patch('/:id/publish', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isPublished must be a boolean value'
      });
    }

    const dictationExercise = await DictationExercise.findOne({
      _id: id,
      createdBy: req.user._id,
      isActive: true
    });

    if (!dictationExercise) {
      return res.status(404).json({
        success: false,
        message: 'Dictation exercise not found'
      });
    }

    dictationExercise.isPublished = isPublished;
    dictationExercise.updatedAt = new Date();
    await dictationExercise.save();

    res.json({
      success: true,
      message: `Dictation exercise ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: dictationExercise
    });

  } catch (error) {
    console.error('Error publishing/unpublishing dictation exercise:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dictation exercise status',
      error: error.message
    });
  }
});

// Get dictation exercises by difficulty (Learner)
router.get('/difficulty/:difficulty', auth, requireRole(['learner']), async (req, res) => {
  try {
    const { difficulty } = req.params;
    const validDifficulties = ['easy', 'medium', 'hard', 'very_hard', 'expert'];

    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level. Must be one of: easy, medium, hard, very_hard, expert'
      });
    }

    const dictationExercises = await DictationExercise.find({
      difficulty,
      isPublished: true,
      isActive: true
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: dictationExercises
    });

  } catch (error) {
    console.error('Error fetching dictation exercises by difficulty:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dictation exercises',
      error: error.message
    });
  }
});

// CSV Upload endpoint for bulk dictation exercises (Trainer only)
router.post('/upload-csv', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const { exercises } = req.body;

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Exercises array is required and must not be empty'
      });
    }

    const createdExercises = [];
    const errors = [];

    for (let i = 0; i < exercises.length; i++) {
      try {
        const exercise = exercises[i];
        const { title, description, difficulty, words } = exercise;

        // Validate required fields
        if (!title || !description || !difficulty || !words || !Array.isArray(words) || words.length === 0) {
          errors.push(`Exercise ${i + 1}: Missing required fields (title, description, difficulty, or words)`);
          continue;
        }

        // Validate difficulty level
        const validDifficulties = ['easy', 'medium', 'hard', 'very_hard', 'expert'];
        if (!validDifficulties.includes(difficulty)) {
          errors.push(`Exercise ${i + 1}: Invalid difficulty level. Must be one of: easy, medium, hard, very_hard, expert`);
          continue;
        }

        // Validate words array
        for (let j = 0; j < words.length; j++) {
          const word = words[j];
          if (!word.word || typeof word.word !== 'string' || word.word.trim() === '') {
            errors.push(`Exercise ${i + 1}, Word ${j + 1}: Word is required and must be a non-empty string`);
            continue;
          }
        }

        // Create dictation exercise
        const dictationExercise = new DictationExercise({
          title: title.trim(),
          description: description.trim(),
          difficulty,
          words: words.map(w => ({
            word: w.word.trim(),
            meaning: w.meaning ? w.meaning.trim() : '',
            pronunciation: w.pronunciation ? w.pronunciation.trim() : ''
          })),
          totalWords: words.length,
          createdBy: req.user._id
        });

        await dictationExercise.save();
        createdExercises.push(dictationExercise);

      } catch (error) {
        console.error(`Error creating exercise ${i + 1}:`, error);
        errors.push(`Exercise ${i + 1}: ${error.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdExercises.length} exercises${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      data: {
        created: createdExercises,
        errors: errors
      }
    });

  } catch (error) {
    console.error('Error processing CSV upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process CSV upload',
      error: error.message
    });
  }
});

export default router;
