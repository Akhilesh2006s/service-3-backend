import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'server', 'users.json');

// Shared user storage
let users = new Map();

// Load users from file
export const loadUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      users = new Map(Object.entries(usersData));
      console.log(`Shared user storage - Loaded ${users.size} users from file`);
    }
  } catch (error) {
    console.log('Shared user storage - No existing users file found, starting fresh');
  }
};

// Save users to file
export const saveUsers = () => {
  try {
    const usersData = Object.fromEntries(users);
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
    console.log(`Shared user storage - Saved ${users.size} users to file`);
  } catch (error) {
    console.error('Shared user storage - Error saving users:', error);
  }
};

// Get all users
export const getAllUsers = () => {
  return Array.from(users.values());
};

// Get user by ID
export const getUserById = (id) => {
  return users.get(id);
};

// Get user by email or phone
export const getUserByEmailOrPhone = (email, phone) => {
  return Array.from(users.values()).find(
    user => (email && user.email === email) || (phone && user.phone === phone)
  );
};

// Add user
export const addUser = (user) => {
  users.set(user._id, user);
  saveUsers();
};

// Update user
export const updateUser = (id, updates) => {
  const user = users.get(id);
  if (user) {
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    users.set(id, updatedUser);
    saveUsers();
    return updatedUser;
  }
  return null;
};

// Delete user
export const deleteUser = (id) => {
  const deleted = users.delete(id);
  if (deleted) {
    saveUsers();
  }
  return deleted;
};

// Get users by role
export const getUsersByRole = (role) => {
  return Array.from(users.values()).filter(user => user.role === role);
};

// Initialize user storage
loadUsers(); 