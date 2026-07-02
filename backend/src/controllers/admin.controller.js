import { databases, DB_ID, COLLECTIONS } from '../config/appwrite.js';
import { Query } from 'node-appwrite';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir   = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dir, '../../data/users.json');

function loadUsers() {
  if (!existsSync(DB_PATH)) return {};
  try { return JSON.parse(readFileSync(DB_PATH, 'utf8')); } catch { return {}; }
}

async function listAll(collectionId, extraQueries = []) {
  return databases.listDocuments(DB_ID, collectionId, [
    Query.limit(500), Query.orderDesc('$createdAt'), ...extraQueries,
  ]);
}

/* ── Auth ── */
export function adminLogin(req, res) {
  const { password } = req.body;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) {
    return res.status(401).json({ error: 'Invalid admin password.' });
  }
  res.json({ ok: true });
}

/* ── Overview stats ── */
export async function getStats(req, res) {
  try {
    const users = loadUsers();
    const [diseases, prescriptions, medicines, doseLogs] = await Promise.all([
      databases.listDocuments(DB_ID, COLLECTIONS.DISEASES,      [Query.limit(1)]),
      databases.listDocuments(DB_ID, COLLECTIONS.PRESCRIPTIONS, [Query.limit(1)]),
      databases.listDocuments(DB_ID, COLLECTIONS.MEDICINES,     [Query.limit(1)]),
      databases.listDocuments(DB_ID, COLLECTIONS.DOSE_LOGS,     [Query.limit(1)]),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const newToday = Object.values(users).filter(u => u.createdAt?.startsWith(today)).length;

    res.json({
      users:         Object.keys(users).length,
      newToday,
      diseases:      diseases.total,
      prescriptions: prescriptions.total,
      medicines:     medicines.total,
      doseLogs:      doseLogs.total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ── Users ── */
export function getUsers(req, res) {
  const users = loadUsers();
  const list  = Object.values(users).map(u => ({ email: u.email, createdAt: u.createdAt }));

  const { search = '', sort = 'createdAt', order = 'desc' } = req.query;
  let filtered = list;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(u => u.email.toLowerCase().includes(q));
  }
  filtered.sort((a, b) => {
    if (sort === 'email')
      return order === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
    return order === 'asc'
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json({ total: filtered.length, data: filtered });
}

export function getUserDetail(req, res) {
  const users = loadUsers();
  const user  = users[decodeURIComponent(req.params.email)];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ email: user.email, createdAt: user.createdAt });
}

/* ── Data ── */
export async function getDiseases(req, res) {
  try { res.json(await listAll(COLLECTIONS.DISEASES)); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getPrescriptions(req, res) {
  try { res.json(await listAll(COLLECTIONS.PRESCRIPTIONS)); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getMedicines(req, res) {
  try { res.json(await listAll(COLLECTIONS.MEDICINES)); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getDoseLogs(req, res) {
  try { res.json(await listAll(COLLECTIONS.DOSE_LOGS)); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

/* ── Analytics ── */
export async function getAnalytics(req, res) {
  try {
    const users = loadUsers();
    const [diseases, medicines, doseLogs] = await Promise.all([
      databases.listDocuments(DB_ID, COLLECTIONS.DISEASES,  [Query.limit(500)]),
      databases.listDocuments(DB_ID, COLLECTIONS.MEDICINES, [Query.limit(500)]),
      databases.listDocuments(DB_ID, COLLECTIONS.DOSE_LOGS, [Query.limit(500)]),
    ]);

    // Top diseases
    const diseaseCounts = {};
    diseases.documents.forEach(d => {
      const k = (d.diseasename || 'Unknown').trim();
      diseaseCounts[k] = (diseaseCounts[k] || 0) + 1;
    });
    const topDiseases = Object.entries(diseaseCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([name, count]) => ({ name, count }));

    // Top medicines
    const medCounts = {};
    medicines.documents.forEach(m => {
      const k = (m.name || 'Unknown').trim();
      medCounts[k] = (medCounts[k] || 0) + 1;
    });
    const topMedicines = Object.entries(medCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([name, count]) => ({ name, count }));

    // Dose status breakdown
    const doseStatus = { taken: 0, skipped: 0, pending: 0 };
    doseLogs.documents.forEach(d => {
      const s = d.status || 'pending';
      doseStatus[s] = (doseStatus[s] || 0) + 1;
    });

    const logged    = doseStatus.taken + doseStatus.skipped;
    const adherence = logged > 0 ? Math.round((doseStatus.taken / logged) * 100) : 0;

    // Weekly registrations (last 7 days)
    const now = new Date();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    const weeklyRegs = weekDays.map(day => ({
      day:   day.slice(5),   // MM-DD
      count: Object.values(users).filter(u => u.createdAt?.startsWith(day)).length,
    }));

    res.json({ topDiseases, topMedicines, doseStatus, adherence, weeklyRegs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ── Activity log ── */
export async function getLogs(req, res) {
  try {
    const [diseases, prescriptions, medicines, doseLogs] = await Promise.all([
      databases.listDocuments(DB_ID, COLLECTIONS.DISEASES,      [Query.limit(15), Query.orderDesc('$createdAt')]),
      databases.listDocuments(DB_ID, COLLECTIONS.PRESCRIPTIONS, [Query.limit(15), Query.orderDesc('$createdAt')]),
      databases.listDocuments(DB_ID, COLLECTIONS.MEDICINES,     [Query.limit(15), Query.orderDesc('$createdAt')]),
      databases.listDocuments(DB_ID, COLLECTIONS.DOSE_LOGS,     [Query.limit(15), Query.orderDesc('$createdAt')]),
    ]);

    const entries = [
      ...diseases.documents.map(d      => ({ type: 'Disease',      label: d.diseasename,                        patient: d.patientname,  at: d.$createdAt })),
      ...prescriptions.documents.map(d => ({ type: 'Prescription', label: `Rx — ${d.doctornote || 'No note'}`, patient: d.patientname,  at: d.$createdAt })),
      ...medicines.documents.map(d     => ({ type: 'Medicine',     label: d.name,                               patient: d.patientname,  at: d.$createdAt })),
      ...doseLogs.documents.map(d      => ({ type: 'Dose Log',     label: `${d.medicinename} — ${d.status}`,   patient: d.patientname,  at: d.$createdAt })),
    ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 50);

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/* ── System ── */
export async function getSystem(req, res) {
  try {
    let dbStatus = 'Connected';
    try { await databases.listDocuments(DB_ID, COLLECTIONS.DISEASES, [Query.limit(1)]); }
    catch { dbStatus = 'Error'; }

    const users = loadUsers();

    res.json({
      env:              process.env.NODE_ENV     || 'development',
      port:             process.env.PORT         || 5000,
      appwriteEndpoint: process.env.APPWRITE_ENDPOINT,
      appwriteProject:  process.env.APPWRITE_PROJECT_ID,
      dbStatus,
      totalUsers:       Object.keys(users).length,
      uptime:           Math.floor(process.uptime()),
      nodeVersion:      process.version,
      platform:         process.platform,
      timestamp:        new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
