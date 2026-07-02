import { useState, useEffect } from 'react';
import { fetchLogs } from '../services/adminApi.js';

const TYPE_META = {
  Disease:      { color: '#0d9488', bg: '#f0fdfa', label: 'Disease'      },
  Prescription: { color: '#7c3aed', bg: '#f5f3ff', label: 'Prescription' },
  Medicine:     { color: '#059669', bg: '#f0fdf4', label: 'Medicine'     },
  'Dose Log':   { color: '#d97706', bg: '#fffbeb', label: 'Dose Log'     },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1) return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function fmtDateTime(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function Logs() {
  const [logs,    setLogs]    = useState([]);
  const [filter,  setFilter]  = useState('All');
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs().then(setLogs).finally(() => setLoading(false));
  }, []);

  const types   = ['All', ...Object.keys(TYPE_META)];
  const visible = logs.filter(l => {
    if (filter !== 'All' && l.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return [l.label, l.patient, l.type].some(v => v?.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Activity Logs</h2>
          <p className="page-header-sub">Recent platform-wide events</p>
        </div>
      </div>

      <div className="card">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {types.map(t => {
            const m = TYPE_META[t];
            const active = filter === t;
            return (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: '5px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 20,
                border: active ? 'none' : '1.5px solid var(--border)',
                background: active ? (m?.bg || 'var(--primary)') : 'transparent',
                color: active ? (m?.color || 'var(--primary)') : 'var(--muted)',
                cursor: 'pointer', transition: 'all 160ms',
              }}>{t}</button>
            );
          })}
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
              strokeLinecap="round" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search logs…" style={{ paddingLeft: 32, fontSize: 13, height: 34, width: 180 }} />
          </div>
        </div>

        {loading ? (
          <div className="empty-state" style={{ padding: 32 }}>Loading logs…</div>
        ) : visible.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <div className="empty-icon">📋</div>
            <h3>No entries found</h3>
          </div>
        ) : (
          <div>
            {visible.map((log, i) => {
              const m = TYPE_META[log.type] || {};
              return (
                <div key={i} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '12px 4px',
                  borderBottom: i < visible.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  {/* Type badge */}
                  <span style={{
                    flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 9px',
                    borderRadius: 20, background: m.bg || '#f1f5f9', color: m.color || '#64748b',
                    whiteSpace: 'nowrap', marginTop: 2,
                  }}>{log.type}</span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      Patient: {log.patient} &nbsp;·&nbsp; {fmtDateTime(log.at)}
                    </div>
                  </div>

                  {/* Time ago */}
                  <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {timeAgo(log.at)}
                  </span>
                </div>
              );
            })}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
              Showing {visible.length} of {logs.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
