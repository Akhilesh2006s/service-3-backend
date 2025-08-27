import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateLearnerToken = () => {
  const userId = '68983401de107c0a6acae2cf';
  const role = 'learner';
  
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  console.log('🔑 Generated fresh JWT token for learner:');
  console.log('User ID:', userId);
  console.log('Role:', role);
  console.log('JWT_SECRET set:', process.env.JWT_SECRET ? 'Yes' : 'No');
  console.log('Token:', token);
  
  // Decode to verify
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('\n✅ Token verification successful:');
    console.log('Decoded:', decoded);
  } catch (error) {
    console.log('\n❌ Token verification failed:', error.message);
  }
};

generateLearnerToken();

