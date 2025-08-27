import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { getUserByEmailOrPhone } from './utils/userStorage.js';

const testCorrectToken = async () => {
  console.log('Testing submissions endpoint with correct JWT token...\n');
  
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
  
  // Generate correct JWT token
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
  
  console.log('Generated correct JWT token:', token.substring(0, 50) + '...');
  
  try {
    // Test the submissions endpoint
    const response = await fetch('https://service-3-backend-production.up.railway.app/api/submissions/student', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Submissions endpoint working correctly with JWT token!');
    } else {
      console.log('❌ Submissions endpoint failed');
    }
    
    // Test the exams endpoint
    console.log('\nTesting exams endpoint...');
    const examsResponse = await fetch('https://service-3-backend-production.up.railway.app/api/exams/student', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Exams response status:', examsResponse.status);
    
    const examsResponseText = await examsResponse.text();
    console.log('Exams response body:', examsResponseText);
    
    if (examsResponse.ok) {
      console.log('✅ Exams endpoint working correctly with JWT token!');
    } else {
      console.log('❌ Exams endpoint failed');
    }
    
  } catch (error) {
    console.error('Error testing endpoints:', error);
  }
};

// Start the test
testCorrectToken();
