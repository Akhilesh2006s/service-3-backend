import jwt from 'jsonwebtoken';
import { getUserById } from './utils/userStorage.js';

// Test token generation
const testUserId = 'test-user-123';
const testRole = 'learner';

// Generate a test JWT token
const token = jwt.sign(
  { userId: testUserId, role: testRole },
  process.env.JWT_SECRET || 'fallback-secret-key',
  { expiresIn: '24h' }
);

console.log('Generated test token:', token);
console.log('Test with this token in your frontend localStorage');

// Also generate a fallback token
const fallbackToken = `test-token-${testUserId}-${testRole}`;
console.log('Fallback token:', fallbackToken);
