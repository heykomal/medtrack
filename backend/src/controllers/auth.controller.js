import bcrypt from 'bcryptjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir   = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dir, '../../data/users.json');

function loadUsers() {
  if (!existsSync(DB_PATH)) return {};
  try { return JSON.parse(readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}

function saveUsers(users) {
  writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

function sanitizeEmail(raw) {
  return (raw || '').trim().toLowerCase();
}

/* POST /api/auth/register
   Body: { email, password }
*/
export async function register(req, res) {
  const email    = sanitizeEmail(req.body.email);
  const password = String(req.body.password || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const users = loadUsers();
  if (users[email]) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const hash = await bcrypt.hash(password, 12);
  users[email] = { email, hash, createdAt: new Date().toISOString() };
  saveUsers(users);

  return res.status(201).json({ success: true, email });
}

/* POST /api/auth/login
   Body: { email, password }
*/
export async function login(req, res) {
  const email    = sanitizeEmail(req.body.email);
  const password = String(req.body.password || '').trim();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = loadUsers();
  const user  = users[email];

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  return res.json({ success: true, email });
}
