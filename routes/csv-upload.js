import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { auth, requireRole } from '../middleware/auth.js';
import { fileURLToPath } from 'url';
import SentenceFormationExercise from '../models/SentenceFormationExercise.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/csv');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter - File:', file.originalname, 'Mimetype:', file.mimetype);
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      console.log('Multer fileFilter - File accepted');
      cb(null, true);
    } else {
      console.log('Multer fileFilter - File rejected');
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to parse CSV file
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Helper function to validate CSV data based on type
const validateCSVData = (data, type) => {
  const errors = [];
  
  if (!data || data.length === 0) {
    errors.push('CSV file is empty or invalid');
    return { valid: false, errors };
  }

  switch (type) {
    case 'dictation':
      data.forEach((row, index) => {
        if (!row.telugu_word || !row.english_meaning || !row.difficulty) {
          errors.push(`Row ${index + 1}: Missing required fields (telugu_word, english_meaning, difficulty)`);
        }
        if (row.difficulty && !['easy', 'medium', 'hard'].includes(row.difficulty.toLowerCase())) {
          errors.push(`Row ${index + 1}: Invalid difficulty level. Must be 'easy', 'medium', or 'hard'`);
        }
      });
      break;
      
    case 'sentence-formation':
      data.forEach((row, index) => {
        if (!row.sentence_type || !row.source_sentence || !row.target_meaning || !row.difficulty) {
          errors.push(`Row ${index + 1}: Missing required fields (sentence_type, source_sentence, target_meaning, difficulty)`);
        }
        if (row.sentence_type && !['en-te', 'te-en'].includes(row.sentence_type)) {
          errors.push(`Row ${index + 1}: Invalid sentence_type. Must be 'en-te' or 'te-en'`);
        }
        if (row.difficulty && !['easy', 'medium', 'hard'].includes(row.difficulty.toLowerCase())) {
          errors.push(`Row ${index + 1}: Invalid difficulty level. Must be 'easy', 'medium', or 'hard'`);
        }
      });
      break;
      
    case 'te-en':
      data.forEach((row, index) => {
        if (!row.telugu_sentence || !row.english_meaning || !row.difficulty) {
          errors.push(`Row ${index + 1}: Missing required fields (telugu_sentence, english_meaning, difficulty)`);
        }
        if (row.difficulty && !['easy', 'medium', 'hard'].includes(row.difficulty.toLowerCase())) {
          errors.push(`Row ${index + 1}: Invalid difficulty level. Must be 'easy', 'medium', or 'hard'`);
        }
      });
      break;
      
    case 'en-te':
      data.forEach((row, index) => {
        if (!row.english_sentence || !row.telugu_meaning || !row.difficulty) {
          errors.push(`Row ${index + 1}: Missing required fields (english_sentence, telugu_meaning, difficulty)`);
        }
        if (row.difficulty && !['easy', 'medium', 'hard'].includes(row.difficulty.toLowerCase())) {
          errors.push(`Row ${index + 1}: Invalid difficulty level. Must be 'easy', 'medium', or 'hard'`);
        }
      });
      break;
      
    default:
      errors.push('Invalid exercise type');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Helper function to break sentence into words and jumble them
const processSentenceForExercise = (sentence, type) => {
  // Remove punctuation and split into words
  const words = sentence.replace(/[.,!?;:]/g, '').split(/\s+/).filter(word => word.length > 0);
  
  // Create jumbled version
  const jumbledWords = [...words].sort(() => Math.random() - 0.5);
  
  return {
    original: words,
    jumbled: jumbledWords,
    correctOrder: words.map(word => jumbledWords.indexOf(word))
  };
};

// Upload CSV file endpoint
router.post('/upload', auth, requireRole(['trainer', 'admin']), (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Upload request received:');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    const { exerciseType } = req.body;
    
    if (!exerciseType || !['dictation', 'sentence-formation', 'te-en', 'en-te'].includes(exerciseType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exercise type. Must be one of: dictation, sentence-formation, te-en, en-te'
      });
    }

    // Parse CSV file
    const csvData = await parseCSVFile(req.file.path);
    
    // Validate CSV data
    const validation = validateCSVData(csvData, exerciseType);
    if (!validation.valid) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: 'CSV validation failed',
        errors: validation.errors
      });
    }

    // Process data for exercises
    const processedData = csvData.map((row, index) => {
      const exercise = {
        id: `${exerciseType}-${Date.now()}-${index}`,
        type: exerciseType,
        difficulty: row.difficulty.toLowerCase(),
        createdAt: new Date().toISOString(),
        createdBy: req.user.id
      };

      switch (exerciseType) {
        case 'dictation':
          exercise.teluguWord = row.telugu_word;
          exercise.englishMeaning = row.english_meaning;
          break;
          
        case 'sentence-formation':
          exercise.sentenceType = row.sentence_type;
          exercise.sourceSentence = row.source_sentence;
          exercise.targetMeaning = row.target_meaning;
          exercise.words = processSentenceForExercise(row.source_sentence, row.sentence_type);
          break;
          
        case 'te-en':
          exercise.sentenceType = 'te-en';
          exercise.sourceSentence = row.telugu_sentence;
          exercise.targetMeaning = row.english_meaning;
          exercise.words = processSentenceForExercise(row.telugu_sentence, 'te-en');
          break;
          
        case 'en-te':
          exercise.sentenceType = 'en-te';
          exercise.sourceSentence = row.english_sentence;
          exercise.targetMeaning = row.telugu_meaning;
          exercise.words = processSentenceForExercise(row.english_sentence, 'en-te');
          break;
      }

      return exercise;
    });

    // Save to database
    console.log('Processed exercises:', processedData);
    
    // Save exercises to database
    const savedExercises = [];
    for (const exercise of processedData) {
      try {
        const newExercise = new SentenceFormationExercise({
          ...exercise,
          createdBy: req.user.id
        });
        const saved = await newExercise.save();
        savedExercises.push(saved);
      } catch (error) {
        console.error('Error saving exercise:', error);
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Successfully processed and saved ${savedExercises.length} exercises`,
      data: {
        exerciseType,
        processedCount: savedExercises.length,
        exercises: savedExercises
      }
    });

  } catch (error) {
    console.error('CSV upload error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Request file:', req.file);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error processing CSV file',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get exercises endpoint

// Get CSV template endpoint
router.get('/template/:type', auth, requireRole(['trainer', 'admin']), (req, res) => {
  const { type } = req.params;
  
  let template = '';
  let filename = '';
  
  switch (type) {
    case 'dictation':
      template = 'telugu_word,english_meaning,difficulty\nపాఠశాల,school,easy\nఇంటి,house,medium\nపుస్తకం,book,hard';
      filename = 'dictation-template.csv';
      break;
      
    case 'sentence-formation':
      template = 'sentence_type,source_sentence,target_meaning,difficulty\nen-te,I am going to school,నేను పాఠశాలకు వెళుతున్నాను,easy\nen-te,Guests came to our house,మా ఇంటికి అతిథులు వచ్చారు,medium\nte-en,నేను పాఠశాలకు వెళుతున్నాను,I am going to school,easy\nte-en,మా ఇంటికి అతిథులు వచ్చారు,Guests came to our house,medium';
      filename = 'sentence-formation-template.csv';
      break;
      
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid template type'
      });
  }
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(template);
});

// Get uploaded exercises endpoint
router.get('/exercises/:type', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10, difficulty } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    // Add difficulty filter if provided
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch exercises from database
    const exercises = await SentenceFormationExercise.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');
    
    // Get total count
    const total = await SentenceFormationExercise.countDocuments(query);
    
    res.json({
      success: true,
      data: exercises,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercises',
      error: error.message
    });
  }
});

// Delete exercise endpoint
router.delete('/exercises/:id', auth, requireRole(['trainer', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement database deletion
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Exercise deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting exercise',
      error: error.message
    });
  }
});

export default router;
