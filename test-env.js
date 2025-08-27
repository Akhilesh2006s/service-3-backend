import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('=== Environment Variables Test ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');

if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI length:', process.env.MONGODB_URI.length);
  console.log('MONGODB_URI preview:', process.env.MONGODB_URI.substring(0, 50) + '...');
}





