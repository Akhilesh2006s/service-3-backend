import express from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import VoiceExamination from '../models/VoiceExamination.js';
import VoiceExaminationSubmission from '../models/VoiceExaminationSubmission.js';
import User from '../models/User.js';

const router = express.Router();

// ===== TRAINER ROUTES =====

// Create a new voice examination (Trainer only)
router.post('/create', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const {
      title,
      teluguTitle,
      paragraph,
      teluguParagraph,
      instructions,
      teluguInstructions,
      timeLimit,
      maxScore,
      passingScore,
      tags,
      difficulty,
      category,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!title || !teluguTitle || !paragraph || !teluguParagraph || !instructions || !teluguInstructions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const voiceExamination = new VoiceExamination({
      title,
      teluguTitle,
      paragraph,
      teluguParagraph,
      instructions,
      teluguInstructions,
      timeLimit: timeLimit || 300,
      maxScore: maxScore || 100,
      passingScore: passingScore || 70,
      tags: tags || [],
      difficulty: difficulty || 'medium',
      category: category || 'reading',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id || req.user.userId,
      isPublished: true, // Auto-publish examinations
      publishedAt: new Date() // Set publish date
    });

    await voiceExamination.save();

    res.status(201).json({
      success: true,
      message: 'Voice examination created successfully',
      data: voiceExamination
    });
  } catch (error) {
    console.error('Error creating voice examination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create voice examination',
      error: error.message
    });
  }
});

// Get all voice examinations created by trainer
router.get('/trainer', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { createdBy: req.user._id || req.user.userId };
    
    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'draft') {
      query.isPublished = false;
    }

    const voiceExaminations = await VoiceExamination.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await VoiceExamination.countDocuments(query);

    res.json({
      success: true,
      data: voiceExaminations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching voice examinations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voice examinations',
      error: error.message
    });
  }
});

// Get a specific voice examination by ID (Trainer)
router.get('/trainer/:id', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const voiceExamination = await VoiceExamination.findOne({
      _id: req.params.id,
      createdBy: req.user._id || req.user.userId
    }).populate('createdBy', 'name email');

    if (!voiceExamination) {
      return res.status(404).json({
        success: false,
        message: 'Voice examination not found'
      });
    }

    // Get submission statistics
    const submissions = await VoiceExaminationSubmission.find({
      examinationId: req.params.id
    }).populate('studentId', 'name email');

    const stats = {
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
      evaluatedSubmissions: submissions.filter(s => s.status === 'evaluated').length,
      averageScore: submissions.filter(s => s.status === 'evaluated').length > 0 
        ? Math.round(submissions.filter(s => s.status === 'evaluated')
            .reduce((sum, s) => sum + s.overallScore, 0) / submissions.filter(s => s.status === 'evaluated').length)
        : 0,
      passRate: submissions.filter(s => s.status === 'evaluated').length > 0
        ? Math.round((submissions.filter(s => s.status === 'evaluated' && s.isPassed).length / 
                     submissions.filter(s => s.status === 'evaluated').length) * 100)
        : 0
    };

    res.json({
      success: true,
      data: {
        examination: voiceExamination,
        submissions,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching voice examination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voice examination',
      error: error.message
    });
  }
});

// Update a voice examination (Trainer)
router.put('/trainer/:id', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const voiceExamination = await VoiceExamination.findOne({
      _id: req.params.id,
      createdBy: req.user._id || req.user.userId
    });

    if (!voiceExamination) {
      return res.status(404).json({
        success: false,
        message: 'Voice examination not found'
      });
    }

    // Don't allow updates if already published
    if (voiceExamination.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update published examination'
      });
    }

    const updatedExamination = await VoiceExamination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Voice examination updated successfully',
      data: updatedExamination
    });
  } catch (error) {
    console.error('Error updating voice examination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update voice examination',
      error: error.message
    });
  }
});

// Publish/Unpublish a voice examination (Trainer)
router.patch('/trainer/:id/publish', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const { isPublished } = req.body;
    
    const voiceExamination = await VoiceExamination.findOne({
      _id: req.params.id,
      createdBy: req.user._id || req.user.userId
    });

    if (!voiceExamination) {
      return res.status(404).json({
        success: false,
        message: 'Voice examination not found'
      });
    }

    voiceExamination.isPublished = isPublished;
    if (isPublished) {
      voiceExamination.publishedAt = new Date();
    } else {
      voiceExamination.publishedAt = null;
    }

    await voiceExamination.save();

    res.json({
      success: true,
      message: `Voice examination ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: voiceExamination
    });
  } catch (error) {
    console.error('Error publishing voice examination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish voice examination',
      error: error.message
    });
  }
});

// Delete a voice examination (Trainer)
router.delete('/trainer/:id', auth, requireRole(['trainer']), async (req, res) => {
  try {
    const voiceExamination = await VoiceExamination.findOne({
      _id: req.params.id,
      createdBy: req.user._id || req.user.userId
    });

    if (!voiceExamination) {
      return res.status(404).json({
        success: false,
        message: 'Voice examination not found'
      });
    }

    // Check if there are any submissions
    const submissionCount = await VoiceExaminationSubmission.countDocuments({
      examinationId: req.params.id
    });

    if (submissionCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete examination with existing submissions'
      });
    }

    await VoiceExamination.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Voice examination deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting voice examination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete voice examination',
      error: error.message
    });
  }
});

// ===== STUDENT ROUTES =====

// Get all published voice examinations (Student)
router.get('/student', auth, requireRole(['learner']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const voiceExaminations = await VoiceExamination.find({
      isPublished: true,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('createdBy', 'name');

    console.log('🔍 Filtered voice examinations:', voiceExaminations.length);

    const total = await VoiceExamination.countDocuments({
      isPublished: true,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    // Get student's submission status for each examination
    const examinationsWithStatus = await Promise.all(
      voiceExaminations.map(async (exam) => {
        const submission = await VoiceExaminationSubmission.findOne({
          examinationId: exam._id,
          studentId: req.user._id || req.user.userId
        }).sort({ createdAt: -1 });

        return {
          ...exam.toObject(),
          submissionStatus: submission ? submission.status : 'not_started',
          bestScore: submission ? submission.overallScore : null,
          isPassed: submission ? submission.isPassed : false,
          attemptCount: await VoiceExaminationSubmission.countDocuments({
            examinationId: exam._id,
            studentId: req.user._id || req.user.userId
          })
        };
      })
    );

    res.json({
      success: true,
      data: examinationsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching voice examinations for student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voice examinations',
      error: error.message
    });
  }
});

// Get a specific voice examination for student
router.get('/student/:id', auth, requireRole(['learner']), async (req, res) => {
  try {
    const voiceExamination = await VoiceExamination.findOne({
      _id: req.params.id,
      isPublished: true,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    }).populate('createdBy', 'name');

    if (!voiceExamination) {
      return res.status(404).json({
        success: false,
        message: 'Voice examination not found or not available'
      });
    }

    // Get student's previous submissions
    const submissions = await VoiceExaminationSubmission.find({
      examinationId: req.params.id,
      studentId: req.user._id || req.user.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        examination: voiceExamination,
        submissions,
        canRetake: submissions.length === 0 || 
                  (submissions.length > 0 && !submissions[0].isPassed)
      }
    });
  } catch (error) {
    console.error('Error fetching voice examination for student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voice examination',
      error: error.message
    });
  }
});

// Submit voice examination (Student)
router.post('/student/:id/submit', auth, requireRole(['learner']), async (req, res) => {
  try {
    const { audioData, transcribedText, duration, timeSpent } = req.body;

    // Validate the examination exists and is available
    const voiceExamination = await VoiceExamination.findOne({
      _id: req.params.id,
      isPublished: true,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (!voiceExamination) {
      return res.status(404).json({
        success: false,
        message: 'Voice examination not found or not available'
      });
    }

    // Check if student has already passed
    const existingSubmission = await VoiceExaminationSubmission.findOne({
      examinationId: req.params.id,
      studentId: req.user._id || req.user.userId,
      isPassed: true
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already passed this examination'
      });
    }

    // Get attempt number
    const attemptCount = await VoiceExaminationSubmission.countDocuments({
      examinationId: req.params.id,
      studentId: req.user._id || req.user.userId
    });

    // Handle submission with or without audio
    let audioUrl = null;
    let submissionData = {
      examinationId: req.params.id,
      studentId: req.user._id || req.user.userId,
      duration: duration || 0,
      timeSpent: timeSpent || 0,
      attemptNumber: attemptCount + 1,
      isRetake: attemptCount > 0,
      status: 'pending'
    };

    if (transcribedText) {
      // Direct transcription provided - evaluate immediately
      submissionData.transcribedText = transcribedText;
      submissionData.teluguTranscribedText = transcribedText;
      
      // Evaluate the transcribed text immediately
      const evaluation = await evaluateReading(transcribedText, voiceExamination.teluguParagraph);
      submissionData.accuracy = evaluation.accuracy;
      submissionData.fluency = evaluation.fluency;
      submissionData.pronunciation = evaluation.pronunciation;
      submissionData.evaluationDetails = evaluation.details;
      submissionData.status = 'evaluated';
      submissionData.evaluatedAt = new Date();
    } else if (audioData) {
      // Audio provided - create audio URL and trigger evaluation
      audioUrl = `data:audio/wav;base64,${audioData}`;
      submissionData.audioData = audioData;
      submissionData.audioUrl = audioUrl;
    } else {
      // No audio or transcription provided - mark as submitted without recording
      submissionData.audioData = null;
      submissionData.audioUrl = null;
      submissionData.transcribedText = "No recording provided";
      submissionData.accuracy = 0;
      submissionData.fluency = 0;
      submissionData.pronunciation = 0;
      submissionData.overallScore = 0;
      submissionData.isPassed = false;
      submissionData.status = 'evaluated';
      submissionData.evaluatedAt = new Date();
      submissionData.evaluationNotes = 'Submitted without audio recording';
    }

    // Create submission
    const submission = new VoiceExaminationSubmission(submissionData);

    await submission.save();

    // Only trigger automatic evaluation if audio data is provided (and no transcription)
    if (audioData && !transcribedText) {
      // TODO: Trigger automatic evaluation here
      // For now, we'll simulate a simple evaluation
      setTimeout(async () => {
        try {
          // Simulate transcription and evaluation
          const simulatedTranscription = await simulateTranscription(audioData);
          const evaluation = await evaluateReading(simulatedTranscription, voiceExamination.teluguParagraph);
          
          submission.transcribedText = simulatedTranscription;
          submission.teluguTranscribedText = simulatedTranscription; // Store Telugu transcription
          submission.accuracy = evaluation.accuracy;
          submission.fluency = evaluation.fluency;
          submission.pronunciation = evaluation.pronunciation;
          submission.evaluationDetails = evaluation.details;
          submission.status = 'evaluated';
          submission.evaluatedAt = new Date();
          
          await submission.save();
        } catch (evalError) {
          console.error('Error in automatic evaluation:', evalError);
          submission.status = 'failed';
          submission.evaluationNotes = 'Automatic evaluation failed';
          await submission.save();
        }
      }, 2000); // Simulate 2-second processing time
    }

    // If transcription was provided, return evaluation results immediately
    if (transcribedText) {
      res.status(201).json({
        success: true,
        message: 'Voice examination submitted and evaluated successfully',
        data: {
          submissionId: submission._id,
          status: submission.status,
          transcribedText: submission.transcribedText,
          accuracy: submission.accuracy,
          fluency: submission.fluency,
          pronunciation: submission.pronunciation,
          overallScore: submission.overallScore,
          isPassed: submission.isPassed,
          evaluationDetails: submission.evaluationDetails,
          evaluatedAt: submission.evaluatedAt
        }
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'Voice examination submitted successfully',
        data: {
          submissionId: submission._id,
          status: submission.status
        }
      });
    }
  } catch (error) {
    console.error('Error submitting voice examination:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit voice examination',
      error: error.message
    });
  }
});

// Get student's submission results
router.get('/student/:id/results', auth, requireRole(['learner']), async (req, res) => {
  try {
    const submission = await VoiceExaminationSubmission.findOne({
      examinationId: req.params.id,
      studentId: req.user._id || req.user.userId
    }).sort({ createdAt: -1 });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found for this examination'
      });
    }

    const voiceExamination = await VoiceExamination.findById(req.params.id);

    res.json({
      success: true,
      data: {
        submission,
        examination: voiceExamination
      }
    });
  } catch (error) {
    console.error('Error fetching submission results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission results',
      error: error.message
    });
  }
});

// ===== EVALUATOR ROUTES =====

// Get all submissions for evaluation (Evaluator)
router.get('/evaluator/submissions', auth, requireRole(['evaluator']), async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'pending' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status !== 'all') {
      query.status = status;
    }

    const submissions = await VoiceExaminationSubmission.find(query)
      .populate('examinationId', 'title teluguTitle')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VoiceExaminationSubmission.countDocuments(query);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching submissions for evaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

// Evaluate a submission (Evaluator)
router.post('/evaluator/submissions/:id/evaluate', auth, requireRole(['evaluator']), async (req, res) => {
  try {
    const { accuracy, fluency, pronunciation, evaluationNotes } = req.body;

    const submission = await VoiceExaminationSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.accuracy = accuracy;
    submission.fluency = fluency;
    submission.pronunciation = pronunciation;
    submission.evaluationNotes = evaluationNotes;
    submission.status = 'evaluated';
    submission.evaluatedBy = req.user._id || req.user.userId;
    submission.evaluatedAt = new Date();

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
      message: 'Failed to evaluate submission',
      error: error.message
    });
  }
});

// ===== UTILITY FUNCTIONS =====

// Simulate transcription (replace with actual speech-to-text service)
async function simulateTranscription(audioData) {
  // This is a placeholder - replace with actual speech-to-text API
  // For now, return a simulated Telugu transcription based on common patterns
  const sampleTeluguTexts = [
    "ఓరి నా కొడకా, నీవు ఎలా ఉన్నావు?",
    "నమస్కారం, నేను తెలుగు భాషను నేర్చుకుంటున్నాను",
    "తెలుగు భాష చాలా అందమైన భాష",
    "నేను ప్రతి రోజు తెలుగు చదువుతాను",
    "తెలుగు సంస్కృతి చాలా గొప్పది",
    "నా పేరు రాము, నేను హైదరాబాద్ నుండి వచ్చాను",
    "మీరు ఎక్కడ ఉన్నారు? నేను ఇక్కడ ఉన్నాను",
    "ఈ రోజు వాతావరణం చాలా మంచిగా ఉంది"
  ];
  
  return sampleTeluguTexts[Math.floor(Math.random() * sampleTeluguTexts.length)];
}

// Evaluate reading accuracy with Telugu-specific logic
async function evaluateReading(transcribedText, originalText) {
  // Clean and normalize texts for better comparison
  const cleanOriginal = originalText.replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  const cleanTranscribed = transcribedText.replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  
  // Split texts into words for comparison
  const originalWords = cleanOriginal.split(/\s+/).filter(word => word.length > 0);
  const transcribedWords = cleanTranscribed.split(/\s+/).filter(word => word.length > 0);
  
  // Calculate word-level accuracy with fuzzy matching
  let correctWords = 0;
  let wordErrors = [];
  let totalWords = Math.max(originalWords.length, transcribedWords.length);
  
  // Use a sliding window approach for better matching
  for (let i = 0; i < originalWords.length; i++) {
    const originalWord = originalWords[i];
    let bestMatch = false;
    let bestMatchIndex = -1;
    
    // Check for exact match first
    if (transcribedWords[i] === originalWord) {
      correctWords++;
      bestMatch = true;
    } else {
      // Check nearby words for close matches (within 2 positions)
      for (let j = Math.max(0, i - 2); j <= Math.min(transcribedWords.length - 1, i + 2); j++) {
        if (transcribedWords[j] === originalWord) {
          correctWords++;
          bestMatch = true;
          bestMatchIndex = j;
          break;
        }
      }
    }
    
    if (!bestMatch) {
      wordErrors.push({
        original: originalWord,
        transcribed: transcribedWords[i] || '',
        position: i
      });
    }
  }
  
  // Calculate character-level accuracy with normalization
  const originalChars = cleanOriginal.replace(/\s/g, '').split('');
  const transcribedChars = cleanTranscribed.replace(/\s/g, '').split('');
  
  let correctChars = 0;
  let characterErrors = [];
  
  // Use Levenshtein distance for character-level accuracy
  const maxLength = Math.max(originalChars.length, transcribedChars.length);
  const minLength = Math.min(originalChars.length, transcribedChars.length);
  
  for (let i = 0; i < minLength; i++) {
    if (originalChars[i] === transcribedChars[i]) {
      correctChars++;
    } else {
      characterErrors.push({
        original: originalChars[i],
        transcribed: transcribedChars[i] || '',
        position: i
      });
    }
  }
  
  // Calculate scores with more generous weighting
  const wordAccuracy = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;
  const characterAccuracy = maxLength > 0 ? Math.round((correctChars / maxLength) * 100) : 0;
  
  // Overall accuracy with more weight on word accuracy
  const accuracy = Math.round((wordAccuracy * 0.8) + (characterAccuracy * 0.2));
  
  // Fluency score based on text length ratio and word accuracy
  const textLengthRatio = transcribedWords.length / originalWords.length;
  const fluency = Math.max(70, Math.min(100, 
    Math.round(85 + (wordAccuracy - 50) * 0.3 + (textLengthRatio > 0.8 ? 10 : 0))
  ));
  
  // Pronunciation score based on character accuracy
  const pronunciation = Math.max(70, Math.min(100, 
    Math.round(80 + (characterAccuracy - 50) * 0.4)
  ));
  
  return {
    accuracy,
    fluency,
    pronunciation,
    details: {
      wordAccuracy,
      characterAccuracy,
      speedScore: fluency,
      pauseScore: fluency + Math.floor(Math.random() * 10) - 5,
      confidenceScore: pronunciation,
      wordErrors,
      characterErrors,
      originalWordCount: originalWords.length,
      transcribedWordCount: transcribedWords.length,
      originalCharCount: originalChars.length,
      transcribedCharCount: transcribedChars.length
    }
  };
}

export default router;
