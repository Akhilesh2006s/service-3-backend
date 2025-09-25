import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { auth, requireRole } from '../middleware/auth.js';
import { fileURLToPath } from 'url';
import SentenceFormationExercise from '../models/SentenceFormationExercise.js';
import VarnamalaExercise from '../models/VarnamalaExercise.js';
import TeluguHandwritingExercise from '../models/TeluguHandwritingExercise.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Test endpoint for varnamala debugging
router.get('/test-varnamala', async (req, res) => {
  try {
    // Test VarnamalaExercise model
    const testExercise = new VarnamalaExercise({
      teluguWord: 'కమలం',
      englishMeaning: 'lotus',
      difficulty: 'easy',
      letters: {
        original: ['క', 'మ', 'ల', 'ం'],
        jumbled: ['ల', 'క', 'ం', 'మ'],
        correctOrder: [0, 1, 2, 3],
        randomLetters: ['అ', 'ఆ']
      },
      createdBy: 'test-user-id'
    });
    
    res.json({
      success: true,
      message: 'Varnamala test endpoint working',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      modelTest: 'VarnamalaExercise model created successfully',
      testData: testExercise
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Varnamala test endpoint error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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
      
    case 'varnamala':
      console.log('Validating varnamala data, rows:', data.length);
      data.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
        if (!row.telugu_word || !row.english_meaning || !row.difficulty) {
          console.log(`Row ${index + 1} missing fields:`, {
            telugu_word: row.telugu_word,
            english_meaning: row.english_meaning,
            difficulty: row.difficulty
          });
          errors.push(`Row ${index + 1}: Missing required fields (telugu_word, english_meaning, difficulty)`);
        }
        if (row.difficulty && !['easy', 'medium', 'hard'].includes(row.difficulty.toLowerCase())) {
          errors.push(`Row ${index + 1}: Invalid difficulty level. Must be 'easy', 'medium', or 'hard'`);
        }
      });
      console.log('Varnamala validation errors:', errors);
      break;
      
    case 'handwriting':
      data.forEach((row, index) => {
        if (!row.telugu_word || !row.english_meaning || !row.difficulty) {
          errors.push(`Row ${index + 1}: Missing required fields (telugu_word, english_meaning, difficulty)`);
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

// Function to break Telugu word into proper conjunct consonant components
const breakTeluguWordIntoComponents = (word) => {
  const components = [];
  let i = 0;
  
  while (i < word.length) {
    const char = word[i];
    
    // Check if this is a conjunct consonant pattern: consonant + halant + vathu
    if (i + 2 < word.length && word[i + 1] === '్') {
      const consonant = char;
      const halant = word[i + 1];
      const nextChar = word[i + 2];
      
      // Check if next char is a vathu (య, ర, ల, వ, etc.)
      if (['య', 'ర', 'ల', 'వ', 'న', 'మ', 'ళ', 'ణ', 'ఞ', 'ఙ'].includes(nextChar)) {
        // This is a conjunct consonant: combine as single unit
        const conjunct = consonant + halant + nextChar;
        components.push(conjunct);
        i += 3;
        continue;
      } else {
        // Just consonant + halant (no vathu)
        components.push(consonant);
        components.push(halant);
        i += 2;
        continue;
      }
    }
    
    // Regular character (vowel, consonant with inherent vowel, etc.)
    components.push(char);
    i++;
  }
  
  return components;
};

// Function to break Telugu word into individual letters and add random letters
const processVarnamalaWord = (teluguWord) => {
  // Break Telugu word into proper conjunct consonant components
  const letters = breakTeluguWordIntoComponents(teluguWord);
  
  console.log(`🔤 Processing word "${teluguWord}" into components:`, letters);
  
  // Add some random Telugu letters for confusion
  const randomLetters = [
    'అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ',
    'క', 'ఖ', 'గ', 'ఘ', 'ఙ', 'చ', 'ఛ', 'జ', 'ఝ', 'ఞ', 'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
    'త', 'థ', 'ద', 'ధ', 'న', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ', 'ళ', 'క్ష', 'ఱ'
  ];
  
  // Select 2-4 random letters (not already in the word)
  const availableRandomLetters = randomLetters.filter(letter => !letters.includes(letter));
  const selectedRandomLetters = availableRandomLetters
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(4, Math.max(2, Math.floor(Math.random() * 3) + 2)));
  
  console.log(`🎲 Adding ${selectedRandomLetters.length} random letters:`, selectedRandomLetters);
  
  // Combine original letters with random letters
  const allLetters = [...letters, ...selectedRandomLetters];
  
  // Create jumbled order (original letters + random letters)
  const jumbledOrder = allLetters.map((_, index) => index).sort(() => Math.random() - 0.5);
  
  // Create correct order - find positions of original letters in the jumbled array
  const correctOrder = letters.map(letter => jumbledOrder.indexOf(allLetters.indexOf(letter)));
  
  console.log(`🔤 Final processing for "${teluguWord}":`);
  console.log(`  Original letters:`, letters);
  console.log(`  All letters (with random):`, allLetters);
  console.log(`  Jumbled order:`, jumbledOrder);
  console.log(`  Correct order indices:`, correctOrder);
  
  return {
    original: letters,
    jumbled: jumbledOrder.map(index => allLetters[index]),
    correctOrder: correctOrder,
    randomLetters: selectedRandomLetters
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
    
    if (!exerciseType || !['dictation', 'sentence-formation', 'te-en', 'en-te', 'varnamala', 'handwriting'].includes(exerciseType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exercise type. Must be one of: dictation, sentence-formation, te-en, en-te, varnamala, handwriting'
      });
    }

    // Parse CSV file
    const csvData = await parseCSVFile(req.file.path);
    console.log('Parsed CSV data:', csvData.length, 'rows');
    console.log('First few rows:', csvData.slice(0, 3));
    
    // Validate CSV data
    const validation = validateCSVData(csvData, exerciseType);
    console.log('Validation result:', validation);
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
    console.log('Processing exercises, exerciseType:', exerciseType);
    const processedData = csvData.map((row, index) => {
      console.log(`Processing row ${index + 1}:`, row);
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
          
        case 'varnamala':
          exercise.teluguWord = row.telugu_word;
          exercise.englishMeaning = row.english_meaning;
          const varnamalaData = processVarnamalaWord(row.telugu_word);
          console.log(`Varnamala data for ${row.telugu_word}:`, varnamalaData);
          exercise.letters = varnamalaData;
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
          
        case 'handwriting':
          exercise.teluguWord = row.telugu_word;
          exercise.englishMeaning = row.english_meaning;
          break;
      }

      return exercise;
    });

    // Save to database
    console.log('Processed exercises:', processedData);
    
    // Save exercises to database
    console.log('About to save exercises. Type:', exerciseType, 'Count:', processedData.length);
    console.log('User info:', { userId: req.user?.id, user: req.user });
    const savedExercises = [];
    const saveErrors = [];
    
    for (const exercise of processedData) {
      try {
        let saved;
        if (exerciseType === 'varnamala') {
          console.log('Creating VarnamalaExercise with data:', exercise);
          const newExercise = new VarnamalaExercise({
            ...exercise,
            createdBy: req.user?.id || 'system'
          });
          saved = await newExercise.save();
          console.log('Saved VarnamalaExercise:', saved._id);
        } else if (exerciseType === 'handwriting') {
          console.log('Creating TeluguHandwritingExercise with data:', exercise);
          const newExercise = new TeluguHandwritingExercise({
            ...exercise,
            createdBy: req.user?.id || 'system'
          });
          saved = await newExercise.save();
          console.log('Saved TeluguHandwritingExercise:', saved._id);
        } else {
          const newExercise = new SentenceFormationExercise({
            ...exercise,
            createdBy: req.user.id
          });
          saved = await newExercise.save();
        }
        savedExercises.push(saved);
      } catch (error) {
        console.error('Error saving exercise:', error);
        console.error('Exercise data that failed:', exercise);
        saveErrors.push({
          exercise: exercise,
          error: error.message
        });
      }
    }
    
    console.log('Save results:', {
      totalProcessed: processedData.length,
      savedCount: savedExercises.length,
      errorCount: saveErrors.length,
      errors: saveErrors
    });
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Successfully processed and saved ${savedExercises.length} exercises`,
      data: {
        exerciseType,
        processedCount: savedExercises.length,
        exercises: savedExercises,
        debug: {
          csvRows: csvData.length,
          processedDataLength: processedData.length,
          validationPassed: validation.valid,
          validationErrors: validation.errors,
          saveErrors: saveErrors,
          saveErrorCount: saveErrors.length
        }
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
      
    case 'varnamala':
      template = 'telugu_word,english_meaning,difficulty\nకమలం,lotus,easy\nపుస్తకం,book,medium\nవిద్యార్థి,student,hard';
      filename = 'varnamala-template.csv';
      break;
      
    case 'sentence-formation':
      template = 'sentence_type,source_sentence,target_meaning,difficulty\nen-te,I am going to school,నేను పాఠశాలకు వెళుతున్నాను,easy\nen-te,Guests came to our house,మా ఇంటికి అతిథులు వచ్చారు,medium\nte-en,నేను పాఠశాలకు వెళుతున్నాను,I am going to school,easy\nte-en,మా ఇంటికి అతిథులు వచ్చారు,Guests came to our house,medium';
      filename = 'sentence-formation-template.csv';
      break;
      
    case 'handwriting':
      template = 'telugu_word,english_meaning,difficulty\nకమలం,lotus,easy\nపుస్తకం,book,medium\nవిద్యార్థి,student,hard';
      filename = 'handwriting-template.csv';
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
    
    // Fetch exercises from appropriate database based on type
    let exercises, total;
    if (type === 'varnamala') {
      exercises = await VarnamalaExercise.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email');
      total = await VarnamalaExercise.countDocuments(query);
    } else {
      exercises = await SentenceFormationExercise.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email');
      total = await SentenceFormationExercise.countDocuments(query);
    }
    
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

// Get exercises for learners (read-only access)
router.get('/learner/exercises/:type', auth, requireRole(['learner', 'trainer', 'admin']), async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 100 } = req.query;
    
    console.log(`📚 Learner requesting ${type} exercises, limit: ${limit}`);
    
    let exercises = [];
    
    if (type === 'varnamala') {
      exercises = await VarnamalaExercise.find({ isActive: true })
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .select('teluguWord englishMeaning difficulty letters isActive createdAt');
    } else if (type === 'sentence-formation') {
      exercises = await SentenceFormationExercise.find({ isActive: true })
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .select('exerciseType sourceSentence targetMeaning difficulty words isActive createdAt');
    } else if (type === 'handwriting') {
      exercises = await TeluguHandwritingExercise.find({ isActive: true })
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .select('teluguWord englishMeaning difficulty audioUrl isActive createdAt');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid exercise type. Must be one of: varnamala, sentence-formation, handwriting'
      });
    }
    
    console.log(`📚 Found ${exercises.length} ${type} exercises for learner`);
    
    res.json({
      success: true,
      data: exercises,
      count: exercises.length
    });
    
  } catch (error) {
    console.error('Error fetching exercises for learner:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching exercises',
      error: error.message
    });
  }
});

export default router;
