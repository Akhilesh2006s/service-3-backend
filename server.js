import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import activityRoutes from './routes/activities.js';
import evaluatorRoutes from './routes/evaluators.js';
import studentRoutes from './routes/students.js';
import submissionRoutes from './routes/submissions.js';
import examRoutes from './routes/exams.js';
import uploadRoutes from './routes/uploads.js';
import examAttemptsRoutes from './routes/exam-attempts.js';
import videoLectureRoutes from './routes/video-lectures.js';
import teluguStoriesRoutes from './routes/teluguStories.js';
import teluguUnitsRoutes from './routes/teluguUnits.js';
import sentenceFormationRoutes from './routes/sentence-formation.js';
import teluguSpellingRoutes from './routes/telugu-spelling.js';
import learningProgressRoutes from './routes/learning-progress.js';
import voiceExaminationRoutes from './routes/voice-examinations.js';
import dictationExerciseRoutes from './routes/dictation-exercises.js';
import csvUploadRoutes from './routes/csv-upload.js';

// Load environment variables
dotenv.config();

// Initialize storage systems
import './utils/userStorage.js';
import { loadSubmissions } from './utils/submissionStorage.js';

// Load saved submissions on server start
loadSubmissions();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://localhost:8080',
  'http://192.168.1.7:8080',
  'http://192.168.1.7:3000',
  'http://192.168.1.7:5173',
  'https://service-3-frontend.vercel.app',
  'https://service-3-frontend-git-main-akhilesh2006s.vercel.app'
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any Vercel subdomain for your project
    if (origin.includes('vercel.app') && origin.includes('service-3-frontend')) {
      return callback(null, true);
    }
    
    // Allow any Railway subdomain for your backend
    if (origin.includes('railway.app') && origin.includes('service-3-backend')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased to 1000 requests per windowMs for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Telugu Basics API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/evaluators', evaluatorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/exam-attempts', examAttemptsRoutes);
app.use('/api/video-lectures', videoLectureRoutes);
app.use('/api/telugu-stories', teluguStoriesRoutes);
app.use('/api/telugu-units', teluguUnitsRoutes);
app.use('/api/sentence-formation', sentenceFormationRoutes);
app.use('/api/telugu-spelling', teluguSpellingRoutes);
app.use('/api/learning-progress', learningProgressRoutes);
app.use('/api/voice-examinations', voiceExaminationRoutes);
app.use('/api/dictation-exercises', dictationExerciseRoutes);
app.use('/api/csv-upload', csvUploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌐 Server accessible at: http://192.168.1.7:${PORT}`);
});