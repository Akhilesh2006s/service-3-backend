import express from 'express';
import { auth } from '../middleware/auth.js';
import SentenceFormationProgress from '../models/SentenceFormationProgress.js';

const router = express.Router();

// Get user's sentence formation progress
router.get('/progress', auth, async (req, res) => {
  try {
    let progress = await SentenceFormationProgress.findOne({ userId: req.user.id });
    
    if (!progress) {
      // Create new progress record if doesn't exist
      progress = new SentenceFormationProgress({
        userId: req.user.id,
        currentExerciseIndex: 0,
        score: { correct: 0, total: 0 },
        completedExercises: []
      });
      await progress.save();
    }

    const stats = progress.getStats();
    
    res.json({
      success: true,
      data: {
        progress: stats,
        completedExercises: progress.completedExercises
      }
    });
  } catch (error) {
    console.error('Error fetching sentence formation progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress'
    });
  }
});

// Update progress after completing an exercise
router.post('/progress/update', auth, async (req, res) => {
  try {
    const { exerciseId, isCorrect, selectedOrder, correctOrder } = req.body;

    if (exerciseId === undefined || isCorrect === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: exerciseId, isCorrect'
      });
    }

    let progress = await SentenceFormationProgress.findOne({ userId: req.user.id });
    
    if (!progress) {
      progress = new SentenceFormationProgress({
        userId: req.user.id,
        currentExerciseIndex: 0,
        score: { correct: 0, total: 0 },
        completedExercises: []
      });
    }

    // Update progress
    await progress.updateProgress(exerciseId, isCorrect, selectedOrder, correctOrder);
    
    const stats = progress.getStats();
    
    res.json({
      success: true,
      data: {
        progress: stats,
        message: isCorrect ? 'Progress saved successfully!' : 'Keep trying!'
      }
    });
  } catch (error) {
    console.error('Error updating sentence formation progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
});

// Reset user's progress
router.post('/progress/reset', auth, async (req, res) => {
  try {
    let progress = await SentenceFormationProgress.findOne({ userId: req.user.id });
    
    if (!progress) {
      progress = new SentenceFormationProgress({
        userId: req.user.id,
        currentExerciseIndex: 0,
        score: { correct: 0, total: 0 },
        completedExercises: []
      });
    } else {
      await progress.resetProgress();
    }

    const stats = progress.getStats();
    
    res.json({
      success: true,
      data: {
        progress: stats,
        message: 'Progress reset successfully!'
      }
    });
  } catch (error) {
    console.error('Error resetting sentence formation progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset progress'
    });
  }
});

// Get detailed progress analytics
router.get('/progress/analytics', auth, async (req, res) => {
  try {
    const progress = await SentenceFormationProgress.findOne({ userId: req.user.id });
    
    if (!progress) {
      return res.json({
        success: true,
        data: {
          hasProgress: false,
          analytics: {
            totalExercises: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            accuracy: 0,
            averageTimePerExercise: 0,
            difficultyBreakdown: {
              easy: { correct: 0, total: 0 },
              medium: { correct: 0, total: 0 },
              hard: { correct: 0, total: 0 }
            }
          }
        }
      });
    }

    // Calculate analytics
    const totalExercises = progress.completedExercises.length;
    const correctAnswers = progress.score.correct;
    const wrongAnswers = progress.score.total - progress.score.correct;
    const accuracy = progress.score.total > 0 ? (progress.score.correct / progress.score.total) * 100 : 0;

    // Calculate average time per exercise (if time tracking is implemented)
    const averageTimePerExercise = progress.totalTimeSpent > 0 ? 
      Math.round(progress.totalTimeSpent / totalExercises) : 0;

    // Difficulty breakdown (you can enhance this based on exercise difficulty)
    const difficultyBreakdown = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 }
    };

    // Group by difficulty (assuming exercises 1-30 are easy, 31-45 medium, 46-100 hard)
    progress.completedExercises.forEach(exercise => {
      if (exercise.exerciseId <= 30) {
        difficultyBreakdown.easy.total++;
        if (exercise.isCorrect) difficultyBreakdown.easy.correct++;
      } else if (exercise.exerciseId <= 45) {
        difficultyBreakdown.medium.total++;
        if (exercise.isCorrect) difficultyBreakdown.medium.correct++;
      } else {
        difficultyBreakdown.hard.total++;
        if (exercise.isCorrect) difficultyBreakdown.hard.correct++;
      }
    });

    res.json({
      success: true,
      data: {
        hasProgress: true,
        analytics: {
          totalExercises,
          correctAnswers,
          wrongAnswers,
          accuracy: Math.round(accuracy * 100) / 100,
          averageTimePerExercise,
          difficultyBreakdown,
          lastActivity: progress.lastActivity,
          sessionStartTime: progress.sessionStartTime
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sentence formation analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Get leaderboard (top performers)
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await SentenceFormationProgress.aggregate([
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
          username: '$user.username',
          email: '$user.email',
          score: '$score',
          currentExerciseIndex: '$currentExerciseIndex',
          accuracy: {
            $cond: {
              if: { $gt: ['$score.total', 0] },
              then: { $multiply: [{ $divide: ['$score.correct', '$score.total'] }, 100] },
              else: 0
            }
          }
        }
      },
      {
        $sort: { 
          'score.correct': -1,
          accuracy: -1,
          currentExerciseIndex: -1
        }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          username: entry.username,
          score: entry.score,
          accuracy: Math.round(entry.accuracy * 100) / 100,
          currentExercise: entry.currentExerciseIndex + 1
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

export default router;

