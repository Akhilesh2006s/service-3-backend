import { loadUsers, getAllUsers, getUserById } from './utils/userStorage.js';
import path from 'path';
import fs from 'fs';

console.log('Testing user loading...');

// Check if users.json exists
const usersFilePath = path.join(process.cwd(), 'users.json');
console.log('Users file path:', usersFilePath);
console.log('File exists:', fs.existsSync(usersFilePath));

if (fs.existsSync(usersFilePath)) {
  const fileContent = fs.readFileSync(usersFilePath, 'utf8');
  console.log('File content length:', fileContent.length);
  console.log('File content preview:', fileContent.substring(0, 200) + '...');
  
  try {
    const parsedUsers = JSON.parse(fileContent);
    console.log('Parsed users count:', Object.keys(parsedUsers).length);
    console.log('User IDs:', Object.keys(parsedUsers));
  } catch (error) {
    console.error('Error parsing users.json:', error);
  }
}

// Load users
loadUsers();

// Check loaded users
const users = getAllUsers();
console.log('Loaded users count:', users.length);

// Test specific user
const testUser = getUserById('1754484858934');
console.log('Test user (1754484858934):', testUser ? 'Found' : 'Not found');
if (testUser) {
  console.log('User role:', testUser.role);
  console.log('User name:', testUser.name);
}

// Test learner user
const learnerUsers = users.filter(u => u.role === 'learner');
console.log('Learner users count:', learnerUsers.length);
learnerUsers.forEach(user => {
  console.log(`- Learner: ${user.name} (${user._id})`);
});
