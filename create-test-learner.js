import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const USERS_FILE = path.join(process.cwd(), 'users.json');

// Load existing users
let users = new Map();
try {
  if (fs.existsSync(USERS_FILE)) {
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    users = new Map(Object.entries(usersData));
    console.log(`Loaded ${users.size} existing users`);
  }
} catch (error) {
  console.log('No existing users file found');
}

// Create test learner
const testLearnerId = 'test-user-123';
const hashedPassword = await bcrypt.hash('password123', 10);

const testLearner = {
  _id: testLearnerId,
  name: 'Test Learner',
  email: 'learner@test.com',
  phone: '1234567890',
  password: hashedPassword,
  role: 'learner',
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

users.set(testLearnerId, testLearner);

// Save to file
const usersData = Object.fromEntries(users);
fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));

console.log('✅ Test learner created successfully!');
console.log('📧 Email: learner@test.com');
console.log('🔑 Password: password123');
console.log('🎯 Role: learner');
console.log('🆔 ID: test-user-123');
console.log('');
console.log('Now you can login with these credentials!');
