import jwt from 'jsonwebtoken';
import { getUserByEmailOrPhone } from './utils/userStorage.js';

const generateCorrectToken = () => {
  console.log('Generating correct JWT token for in-memory user...\n');
  
  // Get the learner user from in-memory storage
  const learnerEmail = 'amenityforges@gmail.com';
  const user = getUserByEmailOrPhone(learnerEmail, null);
  
  if (!user) {
    console.log('❌ Learner user not found in in-memory storage');
    return;
  }
  
  console.log('Found user:', {
    name: user.name,
    email: user.email,
    role: user.role,
    id: user._id
  });
  
  // Generate JWT token (same format as the login route)
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
  
  console.log('Generated JWT token:', token);
  console.log('\nToken details:');
  console.log('- User ID in token:', user._id);
  console.log('- Role in token:', user.role);
  console.log('- Token length:', token.length);
  
  // Decode token to verify
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('\nDecoded token:', decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
  }
  
  console.log('\n💡 Use this token in the frontend localStorage:');
  console.log(`localStorage.setItem('telugu-basics-token', '${token}');`);
  
  return token;
};

generateCorrectToken();
