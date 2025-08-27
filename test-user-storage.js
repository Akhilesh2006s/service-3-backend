import { getAllUsers, getUserById, loadUsers } from './utils/userStorage.js';

console.log('Testing user storage...');

// Load users
loadUsers();

// Get all users
const users = getAllUsers();
console.log('Total users:', users.length);

// Check specific user
const user = getUserById('1754484858934');
console.log('User 1754484858934:', user);

// List all user IDs
users.forEach(u => {
  console.log(`User ID: ${u._id}, Name: ${u.name}, Role: ${u.role}`);
}); 