import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Use correct database URI
const MONGODB_URI = 'mongodb+srv://akhileshsamayamanthula:rxvIPIT4Bzobk9Ne@cluster0.4ej8ne2.mongodb.net/TELUGU-BHASHaa?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected to TELUGU-BHASHaa');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
};

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is working',
    database: 'TELUGU-BHASHaa',
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
    console.log(`📊 Database: TELUGU-BHASHaa`);
  });
};

startServer();


