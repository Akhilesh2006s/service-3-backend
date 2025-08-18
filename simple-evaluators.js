import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI || mongoURI === 'mongodb+srv://username:password@cluster.mongodb.net/telugu-learning?retryWrites=true&w=majority') {
      console.log('❌ MongoDB URI not configured!');
      console.log('Please set MONGODB_URI in your .env file');
      console.log('Example: MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/telugu-learning');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// User Schema (for both trainers and evaluators)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['trainer', 'evaluator'], required: true },
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
connectDB();

// GET all evaluators
app.get('/api/evaluators', async (req, res) => {
  try {
    const evaluators = await User.find({ role: 'evaluator' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: evaluators
    });
  } catch (error) {
    console.error('Error fetching evaluators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch evaluators'
    });
  }
});

// POST add evaluator
app.post('/api/evaluators', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if evaluator already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }],
      role: 'evaluator'
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Evaluator with this email or phone already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create evaluator
    const evaluator = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'evaluator',
      isVerified: true,
      isActive: true
    });

    await evaluator.save();

    // Return evaluator without password
    const evaluatorResponse = evaluator.toObject();
    delete evaluatorResponse.password;

    res.status(201).json({
      success: true,
      message: 'Evaluator added successfully',
      data: evaluatorResponse
    });
  } catch (error) {
    console.error('Error adding evaluator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add evaluator'
    });
  }
});

// POST register trainer
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create trainer (only trainers can register)
    const trainer = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'trainer',
      isVerified: true,
      isActive: true
    });

    await trainer.save();

    // Return trainer without password
    const trainerResponse = trainer.toObject();
    delete trainerResponse.password;

    res.status(201).json({
      success: true,
      message: 'Trainer registered successfully',
      data: trainerResponse
    });
  } catch (error) {
    console.error('Error registering trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register trainer'
    });
  }
});

// POST login (for both trainers and evaluators)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Create user response without password
    const userResponse = user.toObject();
    delete userResponse.password;

    // Create token
    const token = `${user.role}-token-${user._id}-${Date.now()}`;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token: token
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// GET current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Extract user ID from token
    const tokenParts = token.split('-');
    if (tokenParts.length < 3) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const userId = tokenParts[2];
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current user'
    });
  }
});

// POST logout
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MongoDB Evaluators API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MongoDB Evaluators API running on port ${PORT}`);
  console.log(`🌐 Server accessible at: http://192.168.1.7:${PORT}`);
  console.log(`🗄️  Using MongoDB Atlas for data storage`);
}); 