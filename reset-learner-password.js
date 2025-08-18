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

// Find the learner user
const learnerEmail = 'amenityforges@gmail.com';
let learnerUser = null;

for (const [id, user] of users) {
  if (user.email === learnerEmail) {
    learnerUser = user;
    break;
  }
}

if (!learnerUser) {
  console.log('❌ Learner user not found');
  process.exit(1);
}

console.log('✅ Found learner user:');
console.log(`  - Name: ${learnerUser.name}`);
console.log(`  - Email: ${learnerUser.email}`);
console.log(`  - Role: ${learnerUser.role}`);

// Reset password to 'password123'
const hashedPassword = await bcrypt.hash('password123', 10);
learnerUser.password = hashedPassword;
learnerUser.updatedAt = new Date();

// Update the user in the map
users.set(learnerUser._id, learnerUser);

// Save to file
const usersData = Object.fromEntries(users);
fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));

console.log('✅ Password reset successfully');
console.log('📧 Email: amenityforges@gmail.com');
console.log('🔑 New Password: password123');
console.log('🎯 Role: learner');
console.log('');
console.log('Now you can login with these credentials!');






