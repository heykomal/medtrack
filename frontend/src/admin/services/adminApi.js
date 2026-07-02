const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/admin';

function token() { return sessionStorage.getItem('admin-token') || ''; }

function headers() {
  return { 'Content-Type': 'application/json', 'x-admin-token': token() };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const get  = path        => request('GET',  path);
const post = (path, b)   => request('POST', path, b);

export const adminLogin       = (password)  => post('/login', { password });
export const fetchStats       = ()          => get('/stats');
export const fetchUsers       = (params)    => get(`/users?${new URLSearchParams(params || {})}`);
export const fetchUserDetail  = (email)     => get(`/users/${encodeURIComponent(email)}`);
export const fetchDiseases    = ()          => get('/diseases');
export const fetchPrescriptions = ()        => get('/prescriptions');
export const fetchMedicines   = ()          => get('/medicines');
export const fetchDoseLogs    = ()          => get('/dose-logs');
export const fetchAnalytics   = ()          => get('/analytics');
export const fetchLogs        = ()          => get('/logs');
export const fetchSystem      = ()          => get('/system');
