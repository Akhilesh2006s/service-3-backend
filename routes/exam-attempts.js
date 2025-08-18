import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import ExamAttempt from '../models/ExamAttempt.js';
import Exam from '../models/Exam.js';

const router = express.Router();

// Start an exam attempt
router.post('/start/:examId', auth, requireRole(['learner']), async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;

    // Check if exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if student already has an active attempt
    const existingAttempt = await ExamAttempt.findOne({
      student: studentId,
      exam: examId,
      isCompleted: false
    });

    if (existingAttempt) {
      // Check if the existing attempt is still valid
      if (existingAttempt.isValid()) {
        return res.json({
          success: true,
          data: {
            attemptId: existingAttempt._id,
            startedAt: existingAttempt.startedAt,
            timeLimit: existingAttempt.timeLimit,
            remainingTime: existingAttempt.getRemainingTime(),
            timeElapsed: existingAttempt.getTimeElapsed()
          }
        });
      } else {
        // Mark expired attempt as completed
        await ExamAttempt.findByIdAndUpdate(existingAttempt._id, {
          isCompleted: true,
          completedAt: new Date()
        });
      }
    }

    // Create new attempt
    const newAttempt = new ExamAttempt({
      student: studentId,
      exam: examId,
      timeLimit: exam.descriptiveTimeLimit || 60 // Default 60 minutes
    });

    await newAttempt.save();

    res.json({
      success: true,
      data: {
        attemptId: newAttempt._id,
        startedAt: newAttempt.startedAt,
        timeLimit: newAttempt.timeLimit,
        remainingTime: newAttempt.getRemainingTime(),
        timeElapsed: newAttempt.getTimeElapsed()
      }
    });

  } catch (error) {
    console.error('Error starting exam attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start exam attempt'
    });
  }
});

// Get exam attempt status
router.get('/status/:examId', auth, requireRole(['learner']), async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user._id;

    const attempt = await ExamAttempt.findOne({
      student: studentId,
      exam: examId,
      isCompleted: false
    });

    if (!attempt) {
      return res.json({
        success: true,
        data: {
          hasActiveAttempt: false,
          canStart: true
        }
      });
    }

    const isValid = attempt.isValid();
    const remainingTime = attempt.getRemainingTime();
    const timeElapsed = attempt.getTimeElapsed();

    if (!isValid) {
      // Mark expired attempt as completed
      await ExamAttempt.findByIdAndUpdate(attempt._id, {
        isCompleted: true,
        completedAt: new Date()
      });

      return res.json({
        success: true,
        data: {
          hasActiveAttempt: false,
          canStart: true,
          message: 'Previous attempt expired'
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasActiveAttempt: true,
        canStart: false,
        attemptId: attempt._id,
        startedAt: attempt.startedAt,
        timeLimit: attempt.timeLimit,
        remainingTime,
        timeElapsed
      }
    });

  } catch (error) {
    console.error('Error getting exam attempt status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exam attempt status'
    });
  }
});

// Complete an exam attempt
router.post('/complete/:attemptId', auth, requireRole(['learner']), async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user._id;

    const attempt = await ExamAttempt.findById(attemptId);
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Exam attempt not found'
      });
    }

    if (attempt.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Exam attempt already completed'
      });
    }

    // Mark attempt as completed
    await ExamAttempt.findByIdAndUpdate(attemptId, {
      isCompleted: true,
      completedAt: new Date(),
      timeSpent: attempt.getTimeElapsed()
    });

    res.json({
      success: true,
      message: 'Exam attempt completed successfully'
    });

  } catch (error) {
    console.error('Error completing exam attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete exam attempt'
    });
  }
});

export default router;
