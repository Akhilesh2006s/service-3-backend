import { auth } from './middleware/auth.js';
import { getAllUsers, getUserById } from './utils/userStorage.js';

console.log('Testing auth middleware...');

// Load users
const users = getAllUsers();
console.log('Total users loaded:', users.length);

// Test with a valid user
const testUser = getUserById('1754484858934');
console.log('Test user:', testUser);

if (testUser) {
  console.log('✅ User found in storage');
  
  // Test token format
  const testToken = `test-token-${testUser._id}-${testUser.role}`;
  console.log('Test token:', testToken);
  
  // Simulate auth middleware logic
  const token = testToken.replace('Bearer ', '');
  console.log('Token after Bearer removal:', token);
  
  if (token.startsWith('test-token-')) {
    const parts = token.replace('test-token-', '').split('-');
    console.log('Token parts:', parts);
    
    if (parts.length >= 2) {
      const userId = parts[0];
      const role = parts[1];
      console.log('Extracted userId:', userId);
      console.log('Extracted role:', role);
      
      // Check if user exists
      const user = getUserById(userId);
      console.log('User found by ID:', user ? 'YES' : 'NO');
      
      if (user) {
        console.log('✅ Auth middleware should work for this token');
      } else {
        console.log('❌ User not found by ID');
      }
    }
  }
} else {
  console.log('❌ Test user not found');
}
