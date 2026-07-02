import { useState, useEffect } from 'react';
import { fetchDiseases, fetchPrescriptions, fetchMedicines, fetchDoseLogs } from '../services/adminApi.js';

const TABS = ['Diseases', 'Prescriptions', 'Medicines', 'Dose Logs'];

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Badge({ text, color }) {
  const colors = {
    green:  { bg: '#f0fdf4', text: '#059669', border: '#bbf7d0' },
    red:    { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    blue:   { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    amber:  { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    purple: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  };
  const c = colors[color] || colors.blue;
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>{text}</span>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
        strokeLinecap="round" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder="Search…" style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
      />
    </div>
  );
}

function DiseasesTable({ data }) {
  const [q, setQ] = useState('');
  const rows = data.filter(d =>
    !q || [d.diseasename, d.patientname, d.status].some(v => v?.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <>
      <SearchBar value={q} onChange={setQ} />
      <table className="adm-table">
        <thead><tr><th>Patient</th><th>Disease</th><th>Status</th><th>Diagnosed</th></tr></thead>
        <tbody>{rows.map(d => (
          <tr key={d.$id}>
            <td style={{ fontWeight: 600 }}>{d.patientname}</td>
            <td>{d.diseasename}</td>
            <td><Badge text={d.status} color={d.status === 'Active' ? 'green' : 'red'} /></td>
            <td style={{ color: 'var(--muted)', fontSize: 13 }}>{fmtDate(d.$createdAt)}</td>
          </tr>
        ))}</tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{rows.length} record{rows.length !== 1 ? 's' : ''}</div>
    </>
  );
}

function PrescriptionsTable({ data }) {
  const [q, setQ] = useState('');
  const rows = data.filter(d =>
    !q || [d.patientname, d.doctornote].some(v => v?.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <>
      <SearchBar value={q} onChange={setQ} />
      <table className="adm-table">
        <thead><tr><th>Patient</th><th>Doctor Note</th><th>Status</th><th>Start Date</th></tr></thead>
        <tbody>{rows.map(d => (
          <tr key={d.$id}>
            <td style={{ fontWeight: 600 }}>{d.patientname}</td>
            <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.doctornote || '—'}</td>
            <td><Badge text={d.active ? 'Active' : 'Inactive'} color={d.active ? 'green' : 'red'} /></td>
            <td style={{ color: 'var(--muted)', fontSize: 13 }}>{fmtDate(d.startdate)}</td>
          </tr>
        ))}</tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{rows.length} record{rows.length !== 1 ? 's' : ''}</div>
    </>
  );
}

function MedicinesTable({ data }) {
  const [q, setQ] = useState('');
  const rows = data.filter(d =>
    !q || [d.name, d.patientname, d.unit].some(v => v?.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <>
      <SearchBar value={q} onChange={setQ} />
      <table className="adm-table">
        <thead><tr><th>Patient</th><th>Medicine</th><th>Dosage</th><th>Times</th><th>Status</th></tr></thead>
        <tbody>{rows.map(d => (
          <tr key={d.$id}>
            <td style={{ fontWeight: 600 }}>{d.patientname}</td>
            <td>{d.name}</td>
            <td style={{ color: 'var(--muted)', fontSize: 13 }}>{d.dosage} {d.unit}</td>
            <td style={{ fontSize: 12 }}>{(d.times || []).join(', ') || '—'}</td>
            <td><Badge text={d.active ? 'Active' : 'Inactive'} color={d.active ? 'green' : 'red'} /></td>
          </tr>
        ))}</tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{rows.length} record{rows.length !== 1 ? 's' : ''}</div>
    </>
  );
}

function DoseLogsTable({ data }) {
  const [q, setQ] = useState('');
  const rows = data.filter(d =>
    !q || [d.medicinename, d.patientname, d.status].some(v => v?.toLowerCase().includes(q.toLowerCase()))
  );
  const statusColor = { taken: 'green', skipped: 'red', pending: 'amber' };
  return (
    <>
      <SearchBar value={q} onChange={setQ} />
      <table className="adm-table">
        <thead><tr><th>Patient</th><th>Medicine</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
        <tbody>{rows.map(d => (
          <tr key={d.$id}>
            <td style={{ fontWeight: 600 }}>{d.patientname}</td>
            <td>{d.medicinename}</td>
            <td style={{ color: 'var(--muted)', fontSize: 13 }}>{d.date}</td>
            <td style={{ color: 'var(--muted)', fontSize: 13 }}>{d.scheduledtime}</td>
            <td><Badge text={d.status} color={statusColor[d.status] || 'blue'} /></td>
          </tr>
        ))}</tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{rows.length} record{rows.length !== 1 ? 's' : ''}</div>
    </>
  );
}

export default function Data() {
  const [tab,     setTab]     = useState(0);
  const [all,     setAll]     = useState({ diseases: [], prescriptions: [], medicines: [], doseLogs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDiseases(), fetchPrescriptions(), fetchMedicines(), fetchDoseLogs()])
      .then(([diseases, prescriptions, medicines, doseLogs]) => {
        setAll({
          diseases:      diseases.documents      || [],
          prescriptions: prescriptions.documents || [],
          medicines:     medicines.documents     || [],
          doseLogs:      doseLogs.documents      || [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = [all.diseases.length, all.prescriptions.length, all.medicines.length, all.doseLogs.length];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Data</h2>
          <p className="page-header-sub">Browse all records across every collection</p>
        </div>
      </div>

      <div className="card">
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1.5px solid var(--border)', paddingBottom: 0 }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{
              padding: '9px 16px', fontSize: 13.5, fontWeight: 700,
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === i ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: tab === i ? 'var(--primary)' : 'var(--muted)',
              marginBottom: -1.5,
              transition: 'all 180ms',
            }}>
              {t}
              {!loading && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, opacity: 0.7 }}>({counts[i]})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state" style={{ padding: 40 }}>Loading data…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {tab === 0 && <DiseasesTable      data={all.diseases}      />}
            {tab === 1 && <PrescriptionsTable data={all.prescriptions} />}
            {tab === 2 && <MedicinesTable     data={all.medicines}     />}
            {tab === 3 && <DoseLogsTable      data={all.doseLogs}      />}
          </div>
        )}
      </div>
    </div>
  );
}
