import express from 'express';
import Exam from '../models/Exam.js';
import Submission from '../models/Submission.js';
import { auth, requireTrainer, requireAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new exam (Trainer only)
router.post('/', auth, requireTrainer, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      difficulty,
      milestone,
      timeLimit,
      passingScore,
      mcqQuestions,
      descriptiveQuestions,
      voiceQuestions,
      questionDistribution,
      isActive,
      isPublished,
      allowRetakes,
      maxAttempts,
      openDate,
      descriptiveTimeLimit
    } = req.body;

    // Validate MCQ questions (max 10 questions)
    if (mcqQuestions && mcqQuestions.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 MCQ questions allowed per exam'
      });
    }

    // Validate that MCQ questions have required fields
    if (mcqQuestions) {
      for (let i = 0; i < mcqQuestions.length; i++) {
        const q = mcqQuestions[i];
        if (!q.question || !q.options || q.options.length !== 4 || q.correctAnswer === undefined) {
          return res.status(400).json({
            success: false,
            message: `MCQ Question ${i + 1} is incomplete. Each question must have a question text, 4 options, and a correct answer.`
          });
        }
      }
    }

    // Validate descriptive questions
    if (descriptiveQuestions && descriptiveQuestions.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 descriptive questions allowed per exam'
      });
    }

    // Validate that descriptive questions have required fields
    if (descriptiveQuestions) {
      for (let i = 0; i < descriptiveQuestions.length; i++) {
        const q = descriptiveQuestions[i];
        if (!q.question) {
          return res.status(400).json({
            success: false,
            message: `Descriptive Question ${i + 1} is incomplete. Each question must have a question text.`
          });
        }
      }
    }

    // Validate descriptive exam requirements
    if (type === 'descriptive') {
      if (!descriptiveQuestions || descriptiveQuestions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Descriptive exams must have at least one descriptive question'
        });
      }
      if (!openDate) {
        return res.status(400).json({
          success: false,
          message: 'Descriptive exams must have an open date'
        });
      }
      if (!descriptiveTimeLimit || descriptiveTimeLimit < 15 || descriptiveTimeLimit > 480) {
        return res.status(400).json({
          success: false,
          message: 'Descriptive exams must have a time limit between 15 and 480 minutes'
        });
      }
    }

    const exam = new Exam({
      title,
      description,
      type,
      category,
      difficulty,
      milestone,
      timeLimit,
      passingScore,
      mcqQuestions,
      descriptiveQuestions,
      voiceQuestions,
      questionDistribution,
      isActive,
      isPublished,
      allowRetakes,
      maxAttempts,
      openDate,
      descriptiveTimeLimit,
      createdBy: req.user._id
    });

    await exam.save();

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exam'
    });
  }
});

// Get all exams (for trainers to manage)
router.get('/trainer', auth, requireTrainer, async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: exams
    });
  } catch (error) {
    console.error('Get trainer exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams'
    });
  }
});

// Get published exams for students
router.get('/student', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ 
      isPublished: true, 
      isActive: true 
    })
      .sort({ milestone: 1, createdAt: -1 })
      .populate('createdBy', 'name')
      .select('title description type category difficulty milestone timeLimit passingScore mcqQuestions descriptiveQuestions voiceQuestions isActive isPublished allowRetakes maxAttempts openDate descriptiveTimeLimit createdAt createdBy'); // Only include the fields we want

    // Check if user has submissions for these exams
    const userSubmissions = await Submission.find({ 
      student: req.user._id,
      type: 'exam'
    }).select('exam score status');

    // Add completion status to exams
    const examsWithCompletion = exams.map(exam => {
      const submission = userSubmissions.find(s => s.exam && s.exam.toString() === exam._id.toString());
      
      // For descriptive exams: consider completed if there's any submission
      // For MCQ exams: consider completed if there's an evaluated submission
      const isCompleted = !!submission && (
        exam.type === 'descriptive' ? true : submission.status === 'evaluated'
      );
      
      return {
        ...exam.toObject(),
        isCompleted: isCompleted,
        score: submission ? submission.score : undefined,
        cannotRetake: isCompleted
      };
    });

    res.json({
      success: true,
      data: examsWithCompletion
    });
  } catch (error) {
    console.error('Get student exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams'
    });
  }
});

// Get exam by ID (for students to take)
router.get('/student/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id,
      isPublished: true, 
      isActive: true 
    })
      .populate('createdBy', 'name')
      .select('title description type category difficulty milestone timeLimit passingScore mcqQuestions descriptiveQuestions voiceQuestions isActive isPublished allowRetakes maxAttempts openDate descriptiveTimeLimit createdAt createdBy'); // Only include the fields we want

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found or not available'
      });
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam'
    });
  }
});

// Get exam by ID (for trainers to edit)
router.get('/trainer/:id', auth, requireTrainer, async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    })
      .populate('createdBy', 'name');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam'
    });
  }
});

// Update exam (Trainer only)
router.put('/:id', auth, requireTrainer, async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Validate MCQ questions (max 10 questions)
    if (req.body.mcqQuestions && req.body.mcqQuestions.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 MCQ questions allowed per exam'
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: updatedExam
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam'
    });
  }
});

// Delete exam (Trainer only)
router.delete('/:id', auth, requireTrainer, async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam'
    });
  }
});

// Publish/Unpublish exam (Trainer only)
router.patch('/:id/publish', auth, requireTrainer, async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id,
      createdBy: req.user._id 
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    exam.isPublished = !exam.isPublished;
    await exam.save();

    res.json({
      success: true,
      message: `Exam ${exam.isPublished ? 'published' : 'unpublished'} successfully`,
      data: exam
    });
  } catch (error) {
    console.error('Publish exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam status'
    });
  }
});

// Get exam results with correct answers (for immediate scoring)
router.get('/results/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findOne({ 
      _id: req.params.id,
      isPublished: true, 
      isActive: true 
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found or not available'
      });
    }

    // Return exam with correct answers for scoring
    const examWithAnswers = {
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      milestone: exam.milestone,
      mcqQuestions: exam.mcqQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points
      })),
      voiceQuestions: exam.voiceQuestions,
      timeLimit: exam.timeLimit,
      passingScore: exam.passingScore
    };

    res.json({
      success: true,
      data: examWithAnswers
    });
  } catch (error) {
    console.error('Get exam results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam results'
    });
  }
});

// Get exam statistics by milestone
router.get('/stats/milestone/:milestone', auth, async (req, res) => {
  try {
    const { milestone } = req.params;
    const milestoneNum = parseInt(milestone);
    
    if (isNaN(milestoneNum) || milestoneNum < 1 || milestoneNum > 19) {
      return res.status(400).json({
        success: false,
        message: 'Invalid milestone number'
      });
    }

    // Get exams for this milestone
    const exams = await Exam.find({ 
      milestone: milestoneNum,
      isPublished: true, 
      isActive: true 
    }).select('title type passingScore');

    // Get submissions for this milestone
    const submissions = await Submission.find({
      exam: { $in: exams.map(e => e._id) },
      student: req.user._id
    }).populate('exam', 'title type passingScore');

    // Calculate statistics
    const totalExams = exams.length;
    const completedExams = submissions.length;
    const passedExams = submissions.filter(s => s.score >= 70).length;
    const averageScore = submissions.length > 0 
      ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length)
      : 0;

    res.json({
      success: true,
      data: {
        milestone: milestoneNum,
        totalExams,
        completedExams,
        passedExams,
        averageScore,
        exams: exams.map(exam => ({
          id: exam._id,
          title: exam.title,
          type: exam.type,
          passingScore: exam.passingScore,
          isCompleted: submissions.some(s => s.exam._id.toString() === exam._id.toString()),
          score: submissions.find(s => s.exam._id.toString() === exam._id.toString())?.score || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get milestone stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch milestone statistics'
    });
  }
});

export default router;
