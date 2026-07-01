import { useState, useEffect } from 'react';
import { getDoseLogs, getMedicines, createDoseLog } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { IconActivity, IconCheck, IconX, IconClock, IconPill, IconBell } from '../components/Icons.jsx';

function today()       { return new Date().toISOString().split('T')[0]; }
function nowHHMM()     { const n = new Date(); return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`; }
function greeting()    { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

function AdherenceColor(pct) {
  if (pct >= 80) return 'var(--success)';
  if (pct >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

export default function Dashboard() {
  const [medicines, setMedicines] = useState([]);
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const toast = useToast();
  const todayDate = today();

  useEffect(() => {
    async function load() {
      try {
        const [medRes, logRes] = await Promise.all([
          getMedicines(),
          getDoseLogs({ date: todayDate }),
        ]);
        setMedicines((medRes.documents || []).filter(m => m.active));
        setLogs(logRes.documents || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Build today's schedule from medicines × times — logic unchanged
  const schedule = [];
  for (const med of medicines) {
    for (const t of (med.times || [])) {
      const log = logs.find(l => l.medicineid === med.$id && l.scheduledtime === t);
      schedule.push({ med, time: t, log });
    }
  }
  schedule.sort((a, b) => a.time.localeCompare(b.time));

  const taken    = schedule.filter(s => s.log?.status === 'taken').length;
  const skipped  = schedule.filter(s => s.log?.status === 'skipped').length;
  const pending  = schedule.filter(s => !s.log || s.log.status === 'pending').length;
  const total    = schedule.length;
  const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

  async function markDose(med, time, status) {
    try {
      const log = await createDoseLog({
        medicineid:   med.$id,
        medicinename: med.name,
        patientname:  med.patientname,
        date:         todayDate,
        scheduledtime: time,
        status,
      });
      setLogs(prev => {
        const filtered = prev.filter(l => !(l.medicineid === med.$id && l.scheduledtime === time));
        return [...filtered, log];
      });
      toast(status === 'taken' ? `${med.name} marked as taken ✓` : `${med.name} skipped`, status === 'taken' ? 'success' : 'info');
    } catch (e) {
      toast('Failed to log dose: ' + e.message, 'error');
    }
  }

  if (loading) return (
    <div className="spinner-wrap"><div className="spinner" /></div>
  );

  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>{greeting()}, welcome back 👋</h2>
          <p>{dateStr}</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><IconBell size={16} />{error}</div>}

      {/* Stat cards */}
      <div className="stats-grid">
        {[
          { label: 'Doses Today', value: total,   color: 'blue',  Icon: IconPill     },
          { label: 'Taken',       value: taken,   color: 'green', Icon: IconCheck    },
          { label: 'Skipped',     value: skipped, color: 'red',   Icon: IconX        },
          { label: 'Pending',     value: pending, color: 'amber', Icon: IconClock    },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className="stat-card-top">
              <div className="stat-icon"><Icon size={20} /></div>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Adherence */}
      <div className="adherence-card">
        <div className="adherence-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconActivity size={16} style={{ color: 'var(--gray-500)' }} />
            <span className="adherence-label">Today's Adherence</span>
          </div>
          <span className="adherence-pct" style={{ color: AdherenceColor(adherence) }}>
            {adherence}%
          </span>
        </div>
        <div className="adherence-bar-bg">
          <div
            className="adherence-bar-fill"
            style={{ width: `${adherence}%`, background: AdherenceColor(adherence) }}
          />
        </div>
        {total > 0 && (
          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>
            {taken} of {total} doses taken today
          </p>
        )}
      </div>

      {/* Schedule */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Today's Medicine Schedule</span>
          <span className="badge badge-blue">{schedule.length} doses</span>
        </div>

        {schedule.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconPill size={34} /></div>
            <h3>No medicines scheduled</h3>
            <p>Add medicines with reminder times from the Medicines page to get started.</p>
          </div>
        ) : (
          <div className="schedule-list">
            {schedule.map(({ med, time, log }) => {
              const status = log?.status;
              const isPast = time <= nowHHMM();
              const timeCls = status === 'taken' ? 'taken' : status === 'skipped' ? 'skipped' : isPast ? 'past' : '';
              return (
                <div key={`${med.$id}-${time}`} className="dose-row">
                  <div className={`dose-time-badge ${timeCls}`}>{time}</div>
                  <div className="dose-info">
                    <div className="dose-info-name">{med.name} · {med.dosage} {med.unit}</div>
                    <div className="dose-info-sub">
                      {med.patientname}{med.instructions ? ` · ${med.instructions}` : ''}
                    </div>
                  </div>
                  <div className="dose-actions">
                    {status === 'taken' && <span className="badge badge-green">✓ Taken</span>}
                    {status === 'skipped' && <span className="badge badge-red">✗ Skipped</span>}
                    {(!status || status === 'pending') && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => markDose(med, time, 'taken')}>
                          <IconCheck size={13} /> Take
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => markDose(med, time, 'skipped')}>
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}