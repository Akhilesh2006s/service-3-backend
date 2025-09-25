import express from 'express';
import { auth } from '../middleware/auth.js';
import LearningProgress from '../models/LearningProgress.js';

const router = express.Router();

// Get user's learning progress
router.get('/', auth, async (req, res) => {
  try {
    let progress = await LearningProgress.findOne({ userId: req.user.userId || req.user._id });
    
    if (!progress) {
      // Create new progress record if it doesn't exist
      progress = new LearningProgress({
        userId: req.user.userId || req.user._id
      });
      await progress.save();
    }

    res.json({
      success: true,
      data: progress.getProgressSummary()
    });
  } catch (error) {
    console.error('Get learning progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning progress'
    });
  }
});

// Update dictation progress
router.post('/dictation', auth, async (req, res) => {
  try {
    const { exerciseId, score, attempts = 1 } = req.body;

    if (exerciseId === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'exerciseId and score are required'
      });
    }

    let progress = await LearningProgress.findOne({ userId: req.user.userId || req.user._id });
    
    if (!progress) {
      progress = new LearningProgress({
        userId: req.user.userId || req.user._id
      });
    }

    progress.updateDictationProgress(exerciseId, score, attempts);
    await progress.save();

    res.json({
      success: true,
      data: progress.getProgressSummary().dictation,
      message: 'Dictation progress updated successfully'
    });
  } catch (error) {
    console.error('Update dictation progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dictation progress'
    });
  }
});

// Update sentence formation progress
router.post('/sentence-formation', auth, async (req, res) => {
  try {
    const { exerciseId, score, attempts = 1, timeSpent = 0 } = req.body;

    if (exerciseId === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'exerciseId and score are required'
      });
    }

    let progress = await LearningProgress.findOne({ userId: req.user.userId || req.user._id });
    
    if (!progress) {
      progress = new LearningProgress({
        userId: req.user.userId || req.user._id
      });
    }

    progress.updateSentenceFormationProgress(exerciseId, score, attempts, timeSpent);
    await progress.save();

    res.json({
      success: true,
      data: progress.getProgressSummary().sentenceFormation,
      message: 'Sentence formation progress updated successfully'
    });
  } catch (error) {
    console.error('Update sentence formation progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sentence formation progress'
    });
  }
});

// Update spelling progress
router.post('/spelling', auth, async (req, res) => {
  try {
    const { exerciseId, score, attempts = 1, hintsUsed = 0, timeSpent = 0 } = req.body;

    if (exerciseId === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'exerciseId and score are required'
      });
    }

    let progress = await LearningProgress.findOne({ userId: req.user.userId || req.user._id });
    
    if (!progress) {
      progress = new LearningProgress({
        userId: req.user.userId || req.user._id
      });
    }

    progress.updateSpellingProgress(exerciseId, score, attempts, hintsUsed, timeSpent);
    await progress.save();

    res.json({
      success: true,
      data: progress.getProgressSummary().spelling,
      message: 'Spelling progress updated successfully'
    });
  } catch (error) {
    console.error('Update spelling progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update spelling progress'
    });
  }
});

// Update handwriting progress
router.post('/handwriting', auth, async (req, res) => {
  try {
    const { exerciseId, isCorrect, attempts = 1 } = req.body;

    if (exerciseId === undefined || isCorrect === undefined) {
      return res.status(400).json({
        success: false,
        message: 'exerciseId and isCorrect are required'
      });
    }

    let progress = await LearningProgress.findOne({ userId: req.user.userId || req.user._id });
    
    if (!progress) {
      progress = new LearningProgress({
        userId: req.user.userId || req.user._id
      });
    }

    // Update handwriting progress (similar to other exercise types)
    if (!progress.handwriting) {
      progress.handwriting = {
        completedExercises: [],
        totalScore: 0,
        totalAttempts: 0,
        correctAnswers: 0
      };
    }

    const existingExercise = progress.handwriting.completedExercises.find(
      ex => ex.exerciseId === exerciseId
    );

    if (existingExercise) {
      existingExercise.attempts += attempts;
      existingExercise.isCorrect = isCorrect;
      existingExercise.lastAttempted = new Date();
    } else {
      progress.handwriting.completedExercises.push({
        exerciseId,
        isCorrect,
        attempts,
        lastAttempted: new Date()
      });
    }

    progress.handwriting.totalAttempts += attempts;
    if (isCorrect) {
      progress.handwriting.correctAnswers += 1;
      progress.handwriting.totalScore += 1;
    }

    // Update overall stats
    progress.overallStats.totalExercisesCompleted += 1;
    progress.overallStats.lastActivity = new Date();
    progress.overallStats.averageScore = progress.calculateOverallAverage();

    await progress.save();

    res.json({
      success: true,
      data: {
        handwriting: {
          totalScore: progress.handwriting.totalScore,
          totalAttempts: progress.handwriting.totalAttempts,
          correctAnswers: progress.handwriting.correctAnswers,
          completedExercises: progress.handwriting.completedExercises.length
        }
      },
      message: 'Handwriting progress updated successfully'
    });
  } catch (error) {
    console.error('Update handwriting progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update handwriting progress'
    });
  }
});

// Reset progress for a specific module
router.post('/reset/:module', auth, async (req, res) => {
  try {
    const { module } = req.params;
    const validModules = ['dictation', 'sentenceFormation', 'spelling', 'handwriting'];

    if (!validModules.includes(module)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module. Must be one of: dictation, sentenceFormation, spelling'
      });
    }

    let progress = await LearningProgress.findOne({ userId: req.user.userId || req.user._id });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found for this user'
      });
    }

    progress.resetModuleProgress(module);
    await progress.save();

    res.json({
      success: true,
      data: progress.getProgressSummary(),
      message: `${module} progress reset successfully`
    });
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset progress'
    });
  }
});

// Get detailed analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const progress = await LearningProgress.findOne({ userId: req.user.id });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress found for this user'
      });
    }

    // Calculate additional analytics
    const analytics = {
      dictation: {
        ...progress.getProgressSummary().dictation,
        averageScore: progress.dictation.completedExercises.length > 0 
          ? progress.dictation.totalScore / progress.dictation.completedExercises.length 
          : 0,
        completionRate: progress.dictation.completedExercises.length / 50 * 100 // Assuming 50 exercises
      },
      sentenceFormation: {
        ...progress.getProgressSummary().sentenceFormation,
        averageScore: progress.sentenceFormation.completedExercises.length > 0 
          ? progress.sentenceFormation.totalScore / progress.sentenceFormation.completedExercises.length 
          : 0,
        completionRate: progress.sentenceFormation.completedExercises.length / 100 * 100,
        averageTimeSpent: progress.sentenceFormation.completedExercises.length > 0 
          ? progress.sentenceFormation.completedExercises.reduce((sum, ex) => sum + (ex.timeSpent || 0), 0) / progress.sentenceFormation.completedExercises.length 
          : 0
      },
      spelling: {
        ...progress.getProgressSummary().spelling,
        averageScore: progress.spelling.completedExercises.length > 0 
          ? progress.spelling.totalScore / progress.spelling.completedExercises.length 
          : 0,
        completionRate: progress.spelling.completedExercises.length / 100 * 100,
        averageTimeSpent: progress.spelling.completedExercises.length > 0 
          ? progress.spelling.completedExercises.reduce((sum, ex) => sum + (ex.timeSpent || 0), 0) / progress.spelling.completedExercises.length 
          : 0,
        totalHintsUsed: progress.spelling.completedExercises.reduce((sum, ex) => sum + (ex.hintsUsed || 0), 0)
      },
      overall: {
        ...progress.getProgressSummary().overall,
        totalCompletionRate: (progress.overallStats.totalExercisesCompleted / 250) * 100, // Assuming 250 total exercises
        averageTimePerExercise: progress.overallStats.totalTimeSpent > 0 
          ? progress.overallStats.totalTimeSpent / progress.overallStats.totalExercisesCompleted 
          : 0
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Get leaderboard (top performers)
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaderboard = await LearningProgress.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user.name': 1,
          'user.email': 1,
          totalScore: { $add: ['$dictation.totalScore', '$sentenceFormation.totalScore', '$spelling.totalScore'] },
          totalCompleted: { $add: [
            { $size: '$dictation.completedExercises' },
            { $size: '$sentenceFormation.completedExercises' },
            { $size: '$spelling.completedExercises' }
          ]},
          averageScore: '$overallStats.averageScore',
          lastActivity: '$overallStats.lastActivity'
        }
      },
      {
        $sort: { totalScore: -1, totalCompleted: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

export default router;

