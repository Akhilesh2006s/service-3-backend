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

// Create test trainer
const testTrainerId = Date.now().toString();
const hashedPassword = await bcrypt.hash('password123', 10);

const testTrainer = {
  _id: testTrainerId,
  name: 'Test Trainer',
  email: 'trainer@test.com',
  phone: '1234567890',
  password: hashedPassword,
  role: 'trainer',
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

users.set(testTrainerId, testTrainer);

// Save to file
const usersData = Object.fromEntries(users);
fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));

console.log('✅ Test trainer created successfully!');
console.log('📧 Email: trainer@test.com');
console.log('🔑 Password: password123');
console.log('🎯 Role: trainer');
console.log('');
console.log('Now you can login with these credentials!'); 