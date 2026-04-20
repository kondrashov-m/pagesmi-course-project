import fs from 'fs';
import path from 'path';

const USERS_DB_FILE = path.join(process.cwd(), 'users.csv');

interface User {
  id: string;
  username: string;
  password: string;
  projects?: string;
  createdAt?: string;
}

function escapeCSV(value: string): string {
  if (!value) return '';
  // Если значение содержит запятую, кавычку или перевод строки - оборачиваем в кавычки
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function ensureCSVFile(): void {
  if (!fs.existsSync(USERS_DB_FILE)) {
    // Создаём CSV с заголовками
    const header = 'id,username,password,projects,createdAt\n';
    fs.writeFileSync(USERS_DB_FILE, header, 'utf-8');
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    ensureCSVFile();
    
    const content = fs.readFileSync(USERS_DB_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length <= 1) return [];
    
    const users: User[] = [];
    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVLine(lines[i]);
      if (fields.length >= 2 && fields[0].trim()) {
        users.push({
          id: fields[0].trim(),
          username: fields[1].trim(),
          password: fields[2]?.trim() || '',
          projects: fields[3]?.trim() || '',
          createdAt: fields[4]?.trim() || ''
        });
      }
    }
    
    return users;
  } catch (error) {
    console.error('Ошибка при загрузке пользователей из CSV:', error);
    return [];
  }
}

export async function addUser(user: User): Promise<boolean> {
  try {
    ensureCSVFile();
    
    const line = [
      escapeCSV(user.id),
      escapeCSV(user.username),
      escapeCSV(user.password),
      escapeCSV(user.projects || ''),
      escapeCSV(user.createdAt || new Date().toISOString())
    ].join(',') + '\n';
    
    fs.appendFileSync(USERS_DB_FILE, line, 'utf-8');
    return true;
  } catch (error) {
    console.error('Ошибка при добавлении пользователя в CSV:', error);
    return false;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  try {
    ensureCSVFile();
    
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) return false;
    
    const user = users[userIndex];
    if (updates.password) user.password = updates.password;
    if (updates.projects) user.projects = updates.projects;
    if (updates.username) user.username = updates.username;
    
    // Переписываем весь файл
    const lines = ['id,username,password,projects,createdAt'];
    for (const u of users) {
      const line = [
        escapeCSV(u.id),
        escapeCSV(u.username),
        escapeCSV(u.password),
        escapeCSV(u.projects || ''),
        escapeCSV(u.createdAt || '')
      ].join(',');
      lines.push(line);
    }
    
    fs.writeFileSync(USERS_DB_FILE, lines.join('\n') + '\n', 'utf-8');
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении пользователя в CSV:', error);
    return false;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    ensureCSVFile();
    
    const users = await getUsers();
    const filtered = users.filter(u => u.id !== id);
    
    if (filtered.length === users.length) return false; // Пользователь не найден
    
    // Переписываем весь файл
    const lines = ['id,username,password,projects,createdAt'];
    for (const u of filtered) {
      const line = [
        escapeCSV(u.id),
        escapeCSV(u.username),
        escapeCSV(u.password),
        escapeCSV(u.projects || ''),
        escapeCSV(u.createdAt || '')
      ].join(',');
      lines.push(line);
    }
    
    fs.writeFileSync(USERS_DB_FILE, lines.join('\n') + '\n', 'utf-8');
    return true;
  } catch (error) {
    console.error('Ошибка при удалении пользователя из CSV:', error);
    return false;
  }
}

export async function userExists(username: string): Promise<boolean> {
  try {
    const users = await getUsers();
    return users.some(u => u.username === username);
  } catch (error) {
    console.error('Ошибка при проверке пользователя:', error);
    return false;
  }
}
