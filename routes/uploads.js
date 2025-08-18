import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { auth, requireRole } from '../middleware/auth.js';
import FileUpload from '../models/FileUpload.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow PDF, images, audio, video, and common document formats
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'video/mp4',
    'video/avi',
    'video/mov',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, images, audio, video, and documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { examId, submissionId } = req.body;
    
    // Determine file type
    let fileType = 'document';
    if (req.file.mimetype === 'application/pdf') {
      fileType = 'pdf';
    } else if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
    } else if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
    }

    // Create file upload record
    const fileUpload = new FileUpload({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.userId,
      examId: examId || null,
      submissionId: submissionId || null,
      fileType: fileType
    });

    await fileUpload.save();

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: fileUpload._id,
        filename: fileUpload.filename,
        originalName: fileUpload.originalName,
        url: fileUpload.url,
        size: fileUpload.size,
        fileType: fileUpload.fileType
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
});

// Get files for a submission
router.get('/submission/:submissionId', auth, async (req, res) => {
  try {
    const files = await FileUpload.find({
      submissionId: req.params.submissionId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files'
    });
  }
});

// Get files for an exam
router.get('/exam/:examId', auth, async (req, res) => {
  try {
    const files = await FileUpload.find({
      examId: req.params.examId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: files
    });

  } catch (error) {
    console.error('Get exam files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam files'
    });
  }
});

// Delete file
router.delete('/:fileId', auth, async (req, res) => {
  try {
    const file = await FileUpload.findById(req.params.fileId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if user owns the file or is admin
    if (file.uploadedBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await FileUpload.findByIdAndDelete(req.params.fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

export default router;
