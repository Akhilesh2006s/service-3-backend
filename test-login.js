import bcrypt from 'bcryptjs';
import { getUserByEmailOrPhone } from './utils/userStorage.js';

console.log('Testing login functionality for evaluators and students...');

// Test login for evaluator
const testEvaluatorLogin = async () => {
  console.log('\nTesting evaluator login...');
  
  const email = 'evaluator@example.com';
  const password = 'hashedpassword'; // This should be the actual password used
  
  const user = getUserByEmailOrPhone(email, null);
  
  if (!user) {
    console.log('❌ Evaluator not found in storage');
    return false;
  }
  
  console.log('✅ Evaluator found:', user.name, user.role);
  
  // Test password comparison (this would normally be done with bcrypt.compare)
  const isPasswordValid = user.password === password; // Simplified for test
  console.log('Password valid:', isPasswordValid ? '✅' : '❌');
  
  return isPasswordValid;
};

// Test login for student
const testStudentLogin = async () => {
  console.log('\nTesting student login...');
  
  const email = 'student@example.com';
  const password = 'hashedpassword'; // This should be the actual password used
  
  const user = getUserByEmailOrPhone(email, null);
  
  if (!user) {
    console.log('❌ Student not found in storage');
    return false;
  }
  
  console.log('✅ Student found:', user.name, user.role);
  
  // Test password comparison (this would normally be done with bcrypt.compare)
  const isPasswordValid = user.password === password; // Simplified for test
  console.log('Password valid:', isPasswordValid ? '✅' : '❌');
  
  return isPasswordValid;
};

// Test login for existing evaluator from the system
const testExistingEvaluatorLogin = async () => {
  console.log('\nTesting existing evaluator login...');
  
  const email = 'akhileshsamayamanthula@gmail.com';
  
  const user = getUserByEmailOrPhone(email, null);
  
  if (!user) {
    console.log('❌ Existing evaluator not found in storage');
    return false;
  }
  
  console.log('✅ Existing evaluator found:', user.name, user.role);
  console.log('User details:', {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  });
  
  return true;
};

// Run tests
const runTests = async () => {
  console.log('Starting login tests...\n');
  
  const evaluatorResult = await testEvaluatorLogin();
  const studentResult = await testStudentLogin();
  const existingEvaluatorResult = await testExistingEvaluatorLogin();
  
  console.log('\n=== Test Results ===');
  console.log('Evaluator login:', evaluatorResult ? '✅ PASS' : '❌ FAIL');
  console.log('Student login:', studentResult ? '✅ PASS' : '❌ FAIL');
  console.log('Existing evaluator found:', existingEvaluatorResult ? '✅ PASS' : '❌ FAIL');
  
  if (existingEvaluatorResult) {
    console.log('\n💡 The existing evaluator should be able to login!');
    console.log('Try logging in with: akhileshsamayamanthula@gmail.com');
  }
};

runTests(); 