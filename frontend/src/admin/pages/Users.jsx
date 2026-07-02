import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../services/adminApi.js';

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Avatar({ email }) {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%',
      background: 'linear-gradient(135deg, #0d9488, #2563eb)',
      color: '#fff', fontSize: 14, fontWeight: 800,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {(email?.[0] || '?').toUpperCase()}
    </div>
  );
}

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [sort,    setSort]    = useState('createdAt');
  const [order,   setOrder]   = useState('desc');
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    fetchUsers({ search, sort, order })
      .then(r => { setUsers(r.data); setTotal(r.total); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, sort, order]);

  function toggleSort(col) {
    if (sort === col) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setOrder('asc'); }
  }

  const SortIndicator = ({ col }) =>
    sort === col ? <span style={{ marginLeft: 4, opacity: 0.7 }}>{order === 'asc' ? '↑' : '↓'}</span> : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Users</h2>
          <p className="page-header-sub">{total} registered account{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card">
        {/* Search bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
              strokeLinecap="round" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by email…"
              style={{ paddingLeft: 38, width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state" style={{ padding: 32 }}>Loading users…</div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <div className="empty-icon">👤</div>
            <h3>No users found</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('email')}>
                    Email <SortIndicator col="email" />
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('createdAt')}>
                    Date Joined <SortIndicator col="createdAt" />
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.email}>
                    <td><Avatar email={u.email} /></td>
                    <td style={{ fontWeight: 600 }}>{u.email}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{fmtDate(u.createdAt)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/admin/users/${encodeURIComponent(u.email)}`)}>
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
