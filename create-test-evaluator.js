import bcrypt from 'bcryptjs';
import { addUser, getUserByEmailOrPhone } from './utils/userStorage.js';

console.log('Creating test evaluator with known password...');

const createTestEvaluator = async () => {
  // Known password for testing
  const plainPassword = 'test123';
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  
  // Create test evaluator
  const testEvaluator = {
    _id: Date.now().toString(),
    name: 'Test Evaluator',
    email: 'testevaluator@example.com',
    phone: '1234567890',
    password: hashedPassword,
    role: 'evaluator',
    trainerId: '1', // Associate with trainer ID 1
    isVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Add to storage
  addUser(testEvaluator);
  
  console.log('✅ Test evaluator created successfully!');
  console.log('📧 Email: testevaluator@example.com');
  console.log('🔑 Password: test123');
  console.log('👤 Role: evaluator');
  
  // Verify it was added
  const foundUser = getUserByEmailOrPhone('testevaluator@example.com', null);
  if (foundUser) {
    console.log('✅ User found in storage:', foundUser.name);
  } else {
    console.log('❌ User not found in storage');
  }
};

createTestEvaluator(); 