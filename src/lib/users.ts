
// ВНИМАНИЕ: Это хранилище пользователей теперь использует JSON-файл.
// Пароли по-прежнему хранятся в открытом виде в файле, что НЕБЕЗОПАСНО для реальных приложений.
// В реальном приложении используйте базу данных и хеширование паролей (например, bcrypt).

import fs from 'fs';
import path from 'path';
import crypto from 'crypto'; // Ensure crypto is available

export interface UserRecord {
  id: string;
  email: string;
  password?: string;
  displayName?: string;
}

const DATA_FILE_PATH = path.join(process.cwd(), 'users.data.json');
let users: UserRecord[] = [];

function loadUsers(): void {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileData = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      users = JSON.parse(fileData);
      console.log('Данные пользователей успешно загружены из users.data.json');
    } else {
      // Файл не найден, инициализируем с тестовыми данными и создаем файл
      users = [
        { id: 'user-1-id-sample', email: 'test1@example.com', displayName: 'Тестовый Пользователь 1', password: 'password123' },
        { id: 'user-2-id-sample', email: 'another@example.com', displayName: 'Другой Тестер', password: 'password456' },
        { id: 'user-3-id-sample', email: 'dev@example.dev', displayName: 'Разработчик', password: 'devpassword' },
      ];
      saveUsers();
      console.log('Файл users.data.json не найден. Инициализирован с тестовыми данными и создан.');
    }
  } catch (error) {
    console.error('Ошибка загрузки данных пользователей из users.data.json:', error);
    console.log('Используются стандартные тестовые пользователи из-за ошибки загрузки.');
    // В случае ошибки парсинга или другой ошибки чтения, используем дефолтных пользователей
    users = [
      { id: 'user-1-id-sample', email: 'test1@example.com', displayName: 'Тестовый Пользователь 1', password: 'password123' },
      { id: 'user-2-id-sample', email: 'another@example.com', displayName: 'Другой Тестер', password: 'password456' },
      { id: 'user-3-id-sample', email: 'dev@example.dev', displayName: 'Разработчик', password: 'devpassword' },
    ];
  }
}

function saveUsers(): void {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    console.log('Данные пользователей успешно сохранены в users.data.json');
  } catch (error) {
    console.error('Ошибка сохранения данных пользователей в users.data.json:', error);
  }
}

// Загружаем пользователей при первом импорте модуля
loadUsers();

export function findUserByEmail(email: string): UserRecord | undefined {
  const lowercasedEmail = email.toLowerCase();
  const user = users.find(u => u.email === lowercasedEmail);
  console.log('findUserByEmail called for:', lowercasedEmail, '. Found:', user ? user.id : null);
  return user;
}

export function findUserById(id: string): UserRecord | undefined {
  const user = users.find(u => u.id === id);
  console.log('findUserById called for:', id, '. Found:', user ? user.id : null);
  return user;
}

export function createUser(userData: Omit<UserRecord, 'id'>): UserRecord | null {
  const lowercasedEmail = userData.email.toLowerCase();
  if (users.find(u => u.email === lowercasedEmail)) {
    console.warn('Attempt to create user with existing email:', lowercasedEmail);
    return null; // User with this email already exists
  }
  const newUser: UserRecord = {
    id: crypto.randomUUID(),
    email: lowercasedEmail,
    displayName: userData.displayName,
    password: userData.password, // Storing password in plain text - insecure!
  };
  users.push(newUser);
  saveUsers(); // Сохраняем изменения
  console.log('New user added:', newUser.email, newUser.id);
  return newUser;
}

export function getAllUsers(): UserRecord[] {
  console.log('getAllUsers called.');
  return [...users];
}

export function deleteUserById(id: string): boolean {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex > -1) {
    const deletedUser = users.splice(userIndex, 1);
    saveUsers(); // Сохраняем изменения
    console.log('User deleted:', deletedUser[0]?.email);
    return true;
  }
  console.log('User not found for deletion with ID:', id);
  return false;
}

export function updateUserPassword(userId: string, newPassword?: string): boolean {
  const user = users.find(u => u.id === userId);
  if (user && newPassword) {
    user.password = newPassword; // Storing password in plain text - insecure!
    saveUsers(); // Сохраняем изменения
    console.log('Password updated for user:', user.email);
    return true;
  }
  if (!user) console.log('User not found for password update with ID:', userId);
  if (!newPassword) console.log('New password not provided for user ID:', userId);
  return false;
}
