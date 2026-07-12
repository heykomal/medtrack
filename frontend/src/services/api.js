import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: BASE_URL });

// Inject the logged-in user's email into every request for server-side data isolation
api.interceptors.request.use(config => {
  try {
    const stored = localStorage.getItem('medtrack-user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.email) config.headers['X-User-Email'] = user.email.trim().toLowerCase();
    }
  } catch { /* ignore parse errors */ }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authRegister = (email, password) => api.post('/api/auth/register', { email, password }).then(r => r.data);
export const authLogin    = (email, password) => api.post('/api/auth/login',    { email, password }).then(r => r.data);

// ── Diseases ──────────────────────────────────────────────────────────────────
export const getDiseases = () => api.get('/api/diseases').then(r => r.data);
export const getDisease = (id) => api.get(`/api/diseases/${id}`).then(r => r.data);
export const createDisease = (data) => api.post('/api/diseases', data).then(r => r.data);
export const updateDisease = (id, data) => api.put(`/api/diseases/${id}`, data).then(r => r.data);
export const deleteDisease = (id) => api.delete(`/api/diseases/${id}`).then(r => r.data);

// ── Prescriptions ─────────────────────────────────────────────────────────────
export const getPrescriptions = () => api.get('/api/prescriptions').then(r => r.data);
export const getPrescription = (id) => api.get(`/api/prescriptions/${id}`).then(r => r.data);
export const createPrescription = (data) => api.post('/api/prescriptions', data).then(r => r.data);
export const updatePrescription = (id, data) => api.put(`/api/prescriptions/${id}`, data).then(r => r.data);
export const deletePrescription = (id) => api.delete(`/api/prescriptions/${id}`).then(r => r.data);

// ── Medicines ─────────────────────────────────────────────────────────────────
export const getMedicines = (prescriptionid) => {
  const params = prescriptionid ? { prescriptionid } : {};
  return api.get('/api/medicines', { params }).then(r => r.data);
};
export const getMedicine = (id) => api.get(`/api/medicines/${id}`).then(r => r.data);
export const createMedicine = (data) => api.post('/api/medicines', data).then(r => r.data);
export const updateMedicine = (id, data) => api.put(`/api/medicines/${id}`, data).then(r => r.data);
export const deleteMedicine = (id) => api.delete(`/api/medicines/${id}`).then(r => r.data);

// ── Dose Logs ─────────────────────────────────────────────────────────────────
export const getDoseLogs = (params) => api.get('/api/dose-logs', { params }).then(r => r.data);
export const createDoseLog = (data) => api.post('/api/dose-logs', data).then(r => r.data);
export const updateDoseLog = (id, data) => api.put(`/api/dose-logs/${id}`, data).then(r => r.data);
export const deleteDoseLog = (id) => api.delete(`/api/dose-logs/${id}`).then(r => r.data);