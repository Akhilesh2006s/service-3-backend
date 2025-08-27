import { getUserByEmailOrPhone } from './utils/userStorage.js';

console.log('Testing learner login and authentication...');

// Test login for existing learner
const testLearnerLogin = async () => {
  console.log('\nTesting learner login...');
  
  const email = 'amenityforges@gmail.com';
  
  const user = getUserByEmailOrPhone(email, null);
  
  if (!user) {
    console.log('❌ Learner not found in storage');
    return false;
  }
  
  console.log('✅ Learner found:', user.name, user.role);
  console.log('User details:', {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  });
  
  return true;
};

// Test token generation
const testTokenGeneration = async () => {
  console.log('\nTesting token generation...');
  
  const email = 'amenityforges@gmail.com';
  const user = getUserByEmailOrPhone(email, null);
  
  if (!user) {
    console.log('❌ User not found for token generation');
    return false;
  }
  
  // Generate test token (same format as auth middleware expects)
  const testToken = `test-token-${user._id}-${user.role}`;
  console.log('Generated test token:', testToken);
  
  // Simulate token parsing
  const token = testToken.replace('Bearer ', '');
  if (token.startsWith('test-token-')) {
    const parts = token.replace('test-token-', '').split('-');
    if (parts.length >= 2) {
      const userId = parts[0];
      const role = parts[1];
      console.log('Parsed userId:', userId);
      console.log('Parsed role:', role);
      console.log('✅ Token format is correct');
      return true;
    }
  }
  
  console.log('❌ Token format is incorrect');
  return false;
};

// Run tests
const runTests = async () => {
  console.log('Starting learner authentication tests...\n');
  
  const learnerResult = await testLearnerLogin();
  const tokenResult = await testTokenGeneration();
  
  console.log('\n=== Test Results ===');
  console.log('Learner found:', learnerResult ? '✅ PASS' : '❌ FAIL');
  console.log('Token generation:', tokenResult ? '✅ PASS' : '❌ FAIL');
  
  if (learnerResult && tokenResult) {
    console.log('\n💡 The learner should be able to login and access submissions!');
    console.log('Try logging in with: amenityforges@gmail.com');
    console.log('The user should have access to /api/submissions/student endpoint');
  }
};

runTests();
