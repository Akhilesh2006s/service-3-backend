import express from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import FileUpload from '../models/FileUpload.js';
import mongoose from 'mongoose';
import { 
  getAllSubmissions, 
  getSubmissionsByStudent, 
  getSubmissionsByStatus, 
  addSubmission,
  countSubmissions
} from '../utils/submissionStorage.js';

const router = express.Router();

// Get all submissions (for trainers and evaluators)
router.get('/', auth, requireRole(['trainer', 'evaluator', 'admin']), async (req, res) => {
  try {
    const { status, type } = req.query;

    // Check if MongoDB is available
    const isMongoDBConnected = mongoose.connection.readyState === 1;
    const hasValidMongoURI = process.env.MONGODB_URI && 
                             process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority';

    // Check if the user ID is a valid MongoDB ObjectId (24 character hex string)
    const isValidObjectId = (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // Use MongoDB only if connected AND user ID is valid ObjectId
    if (isMongoDBConnected && hasValidMongoURI && isValidObjectId(req.user._id)) {
      // Use MongoDB
      let query = {};
      
      // Filter by status
      if (status) {
        query.status = status;
      }

      // Filter by type
      if (type) {
        query.submissionType = type;
      }

      // If evaluator, show all pending submissions and all evaluated submissions
      if (req.user.role === 'evaluator') {
        query.$or = [
          { evaluatedBy: req.user._id },
          { status: 'pending' },
          { status: 'evaluated' }
        ];
      }

      const submissions = await Submission.find(query)
        .populate('student', 'name email')
        .populate('activity', 'title type')
        .populate('exam', 'title type')
        .sort({ submittedAt: -1 });

      console.log(`🔍 Backend: Found ${submissions.length} submissions for query:`, query);
      console.log(`🔍 Backend: Submission IDs:`, submissions.map(s => s._id));

      res.json({
        success: true,
        data: submissions
      });
    } else {
      // Use in-memory storage
      console.log('Using in-memory storage for submissions');
      
      let submissions = getAllSubmissions();
      
      // Filter by status
      if (status) {
        submissions = submissions.filter(s => s.status === status);
      }
      
      // Filter by type
      if (type) {
        submissions = submissions.filter(s => s.submissionType === type);
      }
      
      // If evaluator, show all pending submissions and all evaluated submissions
      if (req.user.role === 'evaluator') {
        submissions = submissions.filter(s => 
          s.evaluatedBy === req.user._id || s.status === 'pending' || s.status === 'evaluated'
        );
      }
      
      // Sort by submittedAt (newest first)
      submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      
      console.log(`🔍 Backend (in-memory): Found ${submissions.length} submissions`);
      console.log(`🔍 Backend (in-memory): Submission IDs:`, submissions.map(s => s._id || s.id));
      
      res.json({
        success: true,
        data: submissions
      });
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
});

// Get student's own submissions
router.get('/student', async (req, res) => {
  try {
    console.log('Submissions /student - No authentication required');
    
    // Check if MongoDB is available
    const isMongoDBConnected = mongoose.connection.readyState === 1;
    const hasValidMongoURI = process.env.MONGODB_URI && 
                             process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority';

    console.log('🔍 MongoDB connection status:', isMongoDBConnected);
    console.log('🔍 MongoDB URI valid:', hasValidMongoURI);

    // Use MongoDB if available
    if (isMongoDBConnected && hasValidMongoURI) {
      // Use MongoDB - Get all voice submissions for debugging
      const submissions = await Submission.find({ 
        submissionType: 'voice'
      })
        .populate('exam', 'title type milestone')
        .populate('activity', 'title type')
        .populate('evaluation.evaluatedBy', 'name')
        .sort({ submittedAt: -1 });

      console.log(`🔍 Backend (MongoDB): Found ${submissions.length} voice submissions`);
      console.log(`🔍 Backend (MongoDB): Submission IDs:`, submissions.map(s => s._id));

      res.json({
        success: true,
        data: submissions
      });
    } else {
      // Use in-memory storage
      console.log('Using in-memory storage for student submissions');
      
      // TEMPORARY: Return all voice submissions for debugging
      const allSubmissions = getAllSubmissions();
      const voiceSubmissions = allSubmissions.filter(s => s.submissionType === 'voice');
      
      // Sort by submittedAt (newest first)
      voiceSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      console.log(`🔍 Backend (DEBUG): Found ${voiceSubmissions.length} voice submissions total`);
      console.log(`🔍 Backend (DEBUG): Voice submission IDs:`, voiceSubmissions.map(s => s._id || s.id));
      console.log(`🔍 Backend (DEBUG): All submissions:`, allSubmissions.map(s => ({ id: s._id || s.id, student: s.student, type: s.submissionType })));

      res.json({
        success: true,
        data: voiceSubmissions
      });
    }
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
});

// Get submission by ID
router.get('/:id', auth, requireRole(['trainer', 'evaluator', 'admin']), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email')
      .populate('activity', 'title type')
      .populate('exam', 'title type')
      .populate('evaluatedBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission'
    });
  }
});

// Create new submission (for students)
router.post('/', auth, requireRole(['learner']), async (req, res) => {
  try {
    console.log('Creating submission with data:', req.body);
    
    const { 
      activityId, 
      examId, 
      submissionType, 
      voiceRecording, 
      mcqAnswers, 
      voiceAnswers,
      descriptiveAnswers,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      answers,
      voiceRecordings,
      questionMapping
    } = req.body;

    if (!submissionType) {
      return res.status(400).json({
        success: false,
        message: 'Submission type is required'
      });
    }

    // Check submission limit (200 per student)
    const SUBMISSION_LIMIT = 200;

    // Check if MongoDB is available
    const isMongoDBConnected = mongoose.connection.readyState === 1;
    const hasValidMongoURI = process.env.MONGODB_URI && 
                             process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority';

    // Check if the user ID is a valid MongoDB ObjectId (24 character hex string)
    const isValidObjectId = (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // Use MongoDB only if connected AND user ID is valid ObjectId
    if (isMongoDBConnected && hasValidMongoURI && isValidObjectId(req.user._id)) {
      // Check submission limit for MongoDB
      const existingSubmissionsCount = await Submission.countDocuments({ student: req.user._id });
      if (existingSubmissionsCount >= SUBMISSION_LIMIT) {
        return res.status(429).json({
          success: false,
          message: `Submission limit reached. You can only have ${SUBMISSION_LIMIT} submissions. Please contact an administrator to increase your limit.`
        });
      }

      // Use MongoDB
      // For exam submissions, calculate score if not provided
      let calculatedScore = score;
      let calculatedCorrectAnswers = correctAnswers;
      let calculatedTotalQuestions = totalQuestions;
      
      if (examId && submissionType === 'mcq') {
        // Get the exam to calculate correct answers
        const Exam = mongoose.model('Exam');
        const exam = await Exam.findById(examId);
        
        if (exam && exam.mcqQuestions) {
          calculatedTotalQuestions = exam.mcqQuestions.length;
          calculatedCorrectAnswers = 0;
          
          // Calculate correct answers by comparing student answers with correct answers
          if (answers && Object.keys(answers).length > 0) {
            Object.entries(answers).forEach(([questionId, studentAnswer]) => {
              const questionIndex = parseInt(questionId.replace('q_', ''));
              const question = exam.mcqQuestions[questionIndex];
              
              if (question && studentAnswer === question.correctAnswer) {
                calculatedCorrectAnswers++;
              }
            });
          }
          
          // Calculate percentage score
          calculatedScore = calculatedTotalQuestions > 0 
            ? Math.round((calculatedCorrectAnswers / calculatedTotalQuestions) * 100) 
            : 0;
        }
      }

      // Prepare mcqAnswers array from answers object
      const processedMcqAnswers = answers ? Object.entries(answers).map(([questionId, answer]) => ({
        questionIndex: parseInt(questionId.replace('q_', '')),
        selectedAnswer: answer,
        isCorrect: false, // Will be calculated below
        timeSpent: 0
      })) : (mcqAnswers || []);

      // Mark correct answers
      if (examId && submissionType === 'mcq') {
        const Exam = mongoose.model('Exam');
        const exam = await Exam.findById(examId);
        
        if (exam && exam.mcqQuestions) {
          processedMcqAnswers.forEach(mcqAnswer => {
            const question = exam.mcqQuestions[mcqAnswer.questionIndex];
            if (question) {
              mcqAnswer.isCorrect = mcqAnswer.selectedAnswer === question.correctAnswer;
            }
          });
        }
      }

      // Determine status based on submission type
      // MCQ exams can be auto-evaluated, descriptive exams need manual evaluation
      const submissionStatus = submissionType === 'descriptive' ? 'pending' : 'evaluated';
      
      const submissionData = {
        student: req.user._id,
        activity: activityId,
        exam: examId,
        type: examId ? 'exam' : 'activity',
        submissionType,
        voiceRecording,
        mcqAnswers: processedMcqAnswers,
        voiceAnswers,
        descriptiveAnswers: descriptiveAnswers || [],
        score: calculatedScore,
        totalQuestions: calculatedTotalQuestions,
        correctAnswers: calculatedCorrectAnswers,
        timeSpent,
        status: submissionStatus, // Use appropriate status based on submission type
        submittedAt: new Date()
      };

      console.log('Creating submission with data:', submissionData);

      const submission = new Submission(submissionData);
      await submission.save();

      console.log('Submission created successfully:', submission._id);

      res.status(201).json({
        success: true,
        message: 'Submission created successfully',
        data: submission
      });
    } else {
      // Use in-memory storage
      console.log('Using in-memory storage for submission');
      
      // Check submission limit for in-memory storage
      const { getSubmissionsByStudent } = await import('../utils/submissionStorage.js');
      const existingSubmissions = getSubmissionsByStudent(req.user._id);
      if (existingSubmissions.length >= SUBMISSION_LIMIT) {
        return res.status(429).json({
          success: false,
          message: `Submission limit reached. You can only have ${SUBMISSION_LIMIT} submissions. Please contact an administrator to increase your limit.`
        });
      }
      
      // Calculate score for exam submissions
      let calculatedScore = score;
      let calculatedCorrectAnswers = correctAnswers;
      let calculatedTotalQuestions = totalQuestions;
      
      if (examId && submissionType === 'mcq' && answers) {
        calculatedTotalQuestions = Object.keys(answers).length;
        calculatedCorrectAnswers = 0;
        
        // For in-memory storage, we'll use a simple scoring approach
        // Since we don't have access to the exam questions, we'll use the provided score
        calculatedScore = score || 0;
        calculatedCorrectAnswers = correctAnswers || 0;
      }

      // Determine status based on submission type
      const submissionStatus = submissionType === 'descriptive' ? 'pending' : 'evaluated';
      
      const submissionData = {
        student: req.user._id,
        activity: activityId,
        exam: examId,
        type: examId ? 'exam' : 'activity',
        submissionType,
        voiceRecording,
        mcqAnswers: answers ? Object.entries(answers).map(([questionId, answer]) => ({
          questionIndex: parseInt(questionId.replace('q_', '')),
          selectedAnswer: answer,
          isCorrect: false,
          timeSpent: 0
        })) : (mcqAnswers || []),
        voiceAnswers,
        descriptiveAnswers: descriptiveAnswers || [],
        score: calculatedScore,
        totalQuestions: calculatedTotalQuestions,
        correctAnswers: calculatedCorrectAnswers,
        timeSpent,
        status: submissionStatus,
        submittedAt: new Date()
      };

      console.log('Creating in-memory submission with data:', submissionData);

      const { addSubmission } = await import('../utils/submissionStorage.js');
      const submission = addSubmission(submissionData);

      console.log('In-memory submission created successfully:', submission._id);

      res.status(201).json({
        success: true,
        message: 'Submission created successfully',
        data: submission
      });
    }
  } catch (error) {
    console.error('Error creating submission:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create submission',
      error: error.message
    });
  }
});

// Evaluate submission (for evaluators)
router.patch('/:id/evaluate', auth, requireRole(['evaluator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      pronunciationScore, 
      clarityScore, 
      toneScore, 
      feedback, 
      errorTags,
      overallScore 
    } = req.body;

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Calculate total score
    const totalScore = (pronunciationScore + clarityScore + toneScore) / 3;

    submission.evaluation = {
      evaluatedBy: req.user._id,
      evaluatedAt: new Date(),
      scores: {
        pronunciation: pronunciationScore,
        clarity: clarityScore,
        tone: toneScore,
        overall: overallScore || totalScore
      },
      feedback,
      errorTags: errorTags || []
    };

    submission.status = 'evaluated';
    submission.score = overallScore || totalScore;

    await submission.save();

    res.json({
      success: true,
      message: 'Submission evaluated successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error evaluating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate submission'
    });
  }
});

// Update submission status (for trainers)
router.patch('/:id/status', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Submission status updated successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission status'
    });
  }
});

// Save descriptive evaluation (simplified - just marks and feedback)
router.post('/:id/evaluate-descriptive', auth, requireRole(['evaluator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { overallScore, feedback } = req.body;

    // Find submission and get exam details
    const submission = await Submission.findById(id).populate('exam');
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Get max marks from exam (default to 100 if not set)
    const maxMarks = submission.exam.totalMaxMarks || 100;

    // Validate marks against exam's max marks
    if (overallScore < 0 || overallScore > maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${maxMarks}`
      });
    }



    // Update submission with evaluation (simplified)
    submission.evaluation = {
      evaluatedBy: req.user._id,
      evaluatedAt: new Date(),
      contentScore: 0, // Not used in simplified version
      grammarScore: 0, // Not used in simplified version
      structureScore: 0, // Not used in simplified version
      overallScore: overallScore, // This is the main marks
      feedback: feedback || '',
      tags: [], // Not used in simplified version
      suggestions: [] // Not used in simplified version
    };

    // Update status and score
    submission.status = 'evaluated';
    submission.score = overallScore;
    submission.evaluatedBy = req.user._id; // Set at top level for filtering

    await submission.save();

    console.log('Descriptive marks saved:', {
      submissionId: id,
      evaluator: req.user._id,
      marks: overallScore
    });

    res.json({
      success: true,
      message: 'Marks saved successfully',
      data: submission
    });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save marks'
    });
  }
});

// General evaluation endpoint for all submission types
router.post('/:id/evaluate', auth, requireRole(['evaluator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      pronunciationScore, 
      clarityScore, 
      toneScore, 
      overallScore, 
      feedback, 
      tags, 
      status 
    } = req.body;

    console.log('🎯 Evaluation request:', {
      submissionId: id,
      pronunciationScore,
      clarityScore,
      toneScore,
      overallScore,
      feedback: feedback ? feedback.substring(0, 50) + '...' : 'No feedback',
      tags,
      status,
      evaluator: req.user._id
    });

    // Find submission
    const submission = await Submission.findById(id);
    if (!submission) {
      console.log('❌ Submission not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    console.log('✅ Found submission:', {
      id: submission._id,
      student: submission.student,
      type: submission.type,
      submissionType: submission.submissionType,
      milestone: submission.milestone,
      status: submission.status
    });

    // Update submission with evaluation data
    submission.pronunciationScore = pronunciationScore || 0;
    submission.clarityScore = clarityScore || 0;
    submission.toneScore = toneScore || 0;
    submission.score = overallScore || 0;
    submission.feedback = feedback || '';
    submission.tags = tags || [];
    submission.status = status || 'evaluated';

    // Add evaluation metadata
    submission.evaluation = {
      evaluatedBy: req.user._id,
      evaluatedAt: new Date(),
      contentScore: pronunciationScore || 0,
      grammarScore: clarityScore || 0,
      structureScore: toneScore || 0,
      overallScore: overallScore || 0,
      feedback: feedback || '',
      tags: tags || [],
      suggestions: []
    };

    console.log('💾 Attempting to save evaluation...');
    console.log('💾 Updated submission data:', {
      pronunciationScore: submission.pronunciationScore,
      clarityScore: submission.clarityScore,
      toneScore: submission.toneScore,
      score: submission.score,
      status: submission.status,
      evaluation: submission.evaluation
    });

    await submission.save();
    console.log('✅ Evaluation saved successfully');

    console.log('Evaluation saved:', {
      submissionId: id,
      evaluator: req.user._id,
      score: overallScore,
      status: status
    });

    res.json({
      success: true,
      message: 'Evaluation saved successfully',
      data: submission
    });
  } catch (error) {
    console.error('❌ Error saving evaluation:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to save evaluation'
    });
  }
});



// Get submission statistics
router.get('/stats/overview', auth, requireRole(['trainer', 'evaluator', 'admin']), async (req, res) => {
  try {
    const totalSubmissions = await Submission.countDocuments();
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });
    const evaluatedSubmissions = await Submission.countDocuments({ status: 'evaluated' });
    const approvedSubmissions = await Submission.countDocuments({ status: 'approved' });
    const rejectedSubmissions = await Submission.countDocuments({ status: 'rejected' });

    // Average score
    const avgScoreResult = await Submission.aggregate([
      { $match: { score: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);

    const averageScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;

    res.json({
      success: true,
      data: {
        total: totalSubmissions,
        pending: pendingSubmissions,
        evaluated: evaluatedSubmissions,
        approved: approvedSubmissions,
        rejected: rejectedSubmissions,
        averageScore: Math.round(averageScore * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission statistics'
    });
  }
});

// Delete submission
router.delete('/:id', auth, requireRole(['evaluator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Delete request for submission:', id);

    // Check if MongoDB is available
    const isMongoDBConnected = mongoose.connection.readyState === 1;
    const hasValidMongoURI = process.env.MONGODB_URI && 
                             process.env.MONGODB_URI !== 'mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority';

    // Check if the user ID is a valid MongoDB ObjectId
    const isValidObjectId = (id) => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    if (isMongoDBConnected && hasValidMongoURI && isValidObjectId(id)) {
      // Use MongoDB
      const submission = await Submission.findById(id);
      
      if (!submission) {
        console.log('❌ Submission not found for deletion:', id);
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      console.log('✅ Found submission for deletion:', {
        id: submission._id,
        student: submission.student,
        type: submission.submissionType,
        status: submission.status
      });

      await Submission.findByIdAndDelete(id);
      console.log('✅ Submission deleted from MongoDB');
    } else {
      // Use in-memory storage
      console.log('🗑️ Using in-memory storage for deletion');
      
      const { getAllSubmissions } = await import('../utils/submissionStorage.js');
      const submissions = getAllSubmissions();
      const submissionIndex = submissions.findIndex(s => s._id === id);
      
      if (submissionIndex === -1) {
        console.log('❌ Submission not found in in-memory storage:', id);
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      // Remove from in-memory storage
      submissions.splice(submissionIndex, 1);
      console.log('✅ Submission deleted from in-memory storage');
    }

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete submission'
    });
  }
});

export default router; 