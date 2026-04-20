import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import type { User } from '@/types';

// In-memory user store (for demo purposes)
// In production, use a real database
const USERS_DB_FILE = path.join(process.cwd(), 'users.data.json');

interface StoredUser extends User {
  password: string;
}

let usersCache: StoredUser[] = [];
let cacheLoaded = false;

// Load users from file
function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_DB_FILE)) {
      const data = fs.readFileSync(USERS_DB_FILE, 'utf-8');
      usersCache = JSON.parse(data);
    } else {
      usersCache = [];
    }
    cacheLoaded = true;
  } catch (error) {
    console.error('Error loading users:', error);
    usersCache = [];
  }

  return usersCache;
}

// Save users to file
function saveUsers(users: StoredUser[]): void {
  try {
    fs.writeFileSync(USERS_DB_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Find user by email
export function findUserByEmail(email: string): StoredUser | undefined {
  const users = loadUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Find user by ID
export function findUserById(id: string): StoredUser | undefined {
  const users = loadUsers();
  return users.find(u => u.id === id);
}

// Create user
export async function createUser(email: string, password: string, displayName: string): Promise<User> {
  console.log(`👤 Creating user: ${email}`);
  
  const users = loadUsers();

  // Check if user exists
  if (findUserByEmail(email)) {
    throw new Error('User already exists');
  }

  const hashedPassword = await hashPassword(password);
  console.log(`🔒 Password hashed: ${hashedPassword.substring(0, 20)}...`);
  
  const newUser: StoredUser = {
    id: `user_${Date.now()}`,
    email,
    displayName,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.push(newUser);
  saveUsers(users);
  usersCache = users;
  console.log(`✅ User saved to file. Total users: ${users.length}`);

  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  console.log(`🔐 Attempting to authenticate user: ${email}`);
  
  const user = findUserByEmail(email);
  
  if (!user) {
    console.error(`❌ User not found: ${email}`);
    console.log(`📋 Available users: ${JSON.stringify(loadUsers().map(u => u.email))}`);
    return null;
  }

  console.log(`✓ User found: ${email}`);
  console.log(`🔒 Stored password hash: ${user.password.substring(0, 20)}...`);
  
  const isPasswordValid = await verifyPassword(password, user.password);
  console.log(`🔑 Password valid: ${isPasswordValid}`);

  if (!isPasswordValid) {
    console.error(`❌ Password verification failed for: ${email}`);
    return null;
  }

  console.log(`✅ Authentication successful for: ${email}`);
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Update user
export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const users = loadUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date(),
  };

  usersCache = users;
  saveUsers(users);

  const { password: _, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
}

// Delete user
export async function deleteUser(id: string): Promise<void> {
  const users = loadUsers();
  const filteredUsers = users.filter(u => u.id !== id);

  if (filteredUsers.length === users.length) {
    throw new Error('User not found');
  }

  usersCache = filteredUsers;
  saveUsers(filteredUsers);
}

// Get all users (for admin)
export function getAllUsers(): User[] {
  const users = loadUsers();
  return users.map(({ password: _, ...userWithoutPassword }) => userWithoutPassword);
}
