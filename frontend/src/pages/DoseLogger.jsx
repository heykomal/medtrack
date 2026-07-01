import { useState, useEffect } from 'react';
import { getDoseLogs, getMedicines, createDoseLog, updateDoseLog } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { IconCheckSquare, IconCheck, IconX, IconClock, IconCalendar, IconPill } from '../components/Icons.jsx';

function getLast14Days() {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function dayLabel(iso) {
  const d = new Date(iso + 'T00:00:00');
  return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), num: d.getDate() };
}

function isToday(iso) { return iso === new Date().toISOString().split('T')[0]; }

export default function DoseLogger() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicines, setMedicines]       = useState([]);
  const [logs, setLogs]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [calSummaries, setCalSummaries] = useState({});
  const toast = useToast();
  const days = getLast14Days();

  async function load(date) {
    setLoading(true);
    try {
      const [mRes, lRes] = await Promise.all([getMedicines(), getDoseLogs({ date })]);
      setMedicines((mRes.documents || []).filter(m => m.active));
      setLogs(lRes.documents || []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }
  useEffect(() => { load(selectedDate); }, [selectedDate]);

  // Build schedule: medicine × times — logic unchanged
  const schedule = [];
  for (const med of medicines) {
    for (const t of (med.times || [])) {
      const log = logs.find(l => l.medicineid === med.$id && l.scheduledtime === t);
      schedule.push({ med, time: t, log });
    }
  }
  schedule.sort((a, b) => a.time.localeCompare(b.time));

  async function markDose(med, time, status) {
    try {
      const existing = schedule.find(s => s.med.$id === med.$id && s.time === time)?.log;
      const updated = existing
        ? await updateDoseLog(existing.$id, { status })
        : await createDoseLog({ medicineid: med.$id, medicinename: med.name,
            patientname: med.patientname, date: selectedDate, scheduledtime: time, status });
      setLogs(prev => {
        const filtered = prev.filter(l => !(l.medicineid === med.$id && l.scheduledtime === time));
        return [...filtered, updated];
      });
      toast(status === 'taken' ? `${med.name} marked taken ✓` : `${med.name} skipped`, status === 'taken' ? 'success' : 'info');
    } catch (e) { toast(e.message, 'error'); }
  }

  // Load calendar summaries once on mount
  useEffect(() => {
    async function loadCal() {
      const summaries = {};
      for (const day of days) {
        try {
          const res = await getDoseLogs({ date: day });
          const dl = res.documents || [];
          summaries[day] = {
            taken:   dl.filter(l => l.status === 'taken').length,
            skipped: dl.filter(l => l.status === 'skipped').length,
            pending: dl.filter(l => l.status === 'pending').length,
          };
        } catch (_) { summaries[day] = { taken: 0, skipped: 0, pending: 0 }; }
      }
      setCalSummaries(summaries);
    }
    loadCal();
  }, []);

  const takenN   = schedule.filter(s => s.log?.status === 'taken').length;
  const skippedN = schedule.filter(s => s.log?.status === 'skipped').length;
  const pendingN = schedule.filter(s => !s.log || s.log.status === 'pending').length;

  const selectedLabel = isToday(selectedDate)
    ? 'Today'
    : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Dose Log</h2>
          <p>Track daily medicine doses across the calendar</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* 14-day strip */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><IconCalendar size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Last 14 Days</span>
        </div>
        <div className="cal-strip">
          {days.map(day => {
            const s = calSummaries[day];
            const total = s ? s.taken + s.skipped + s.pending : 0;
            return (
              <button key={day} className={`cal-day${selectedDate === day ? ' selected' : ''}`} onClick={() => setSelectedDate(day)}>
                <div className="cal-day-label">{dayLabel(day).day}</div>
                <div className="cal-day-num">{dayLabel(day).num}</div>
                <div className="cal-day-dots">
                  {s && s.taken   > 0 && <span className="cal-dot taken"   title={`${s.taken} taken`} />}
                  {s && s.skipped > 0 && <span className="cal-dot skipped" title={`${s.skipped} skipped`} />}
                  {s && s.pending > 0 && <span className="cal-dot pending" title={`${s.pending} pending`} />}
                  {(!s || total === 0) && <span className="cal-dot pending" style={{ opacity: 0.3 }} />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="cal-legend">
          <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--success)' }} />Taken</div>
          <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--danger)' }} />Skipped</div>
          <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--gray-300)' }} />Pending</div>
        </div>
      </div>

      {/* Daily log */}
      <div className="card">
        <div className="date-picker-row">
          <span className="card-title">
            <IconCheckSquare size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {selectedLabel}
          </span>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : schedule.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconPill size={34} /></div>
            <h3>No medicines scheduled</h3>
            <p>Add medicines with reminder times from the Medicines page to begin logging doses.</p>
          </div>
        ) : (
          <>
            <div className="dose-summary-row">
              <div className="dose-summary-chip taken">
                <div className="dose-summary-num">{takenN}</div>
                <div className="dose-summary-label">Taken</div>
              </div>
              <div className="dose-summary-chip skipped">
                <div className="dose-summary-num">{skippedN}</div>
                <div className="dose-summary-label">Skipped</div>
              </div>
              <div className="dose-summary-chip pending">
                <div className="dose-summary-num">{pendingN}</div>
                <div className="dose-summary-label">Pending</div>
              </div>
            </div>

            <div className="schedule-list">
              {schedule.map(({ med, time, log }) => {
                const status = log?.status;
                const timeCls = status === 'taken' ? 'taken' : status === 'skipped' ? 'skipped' : '';
                return (
                  <div key={`${med.$id}-${time}`} className="dose-row">
                    <div className={`dose-time-badge ${timeCls}`}>
                      <IconClock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{time}
                    </div>
                    <div className="dose-info">
                      <div className="dose-info-name">{med.name} · {med.dosage} {med.unit}</div>
                      <div className="dose-info-sub">
                        {med.patientname}{med.instructions ? ` · ${med.instructions}` : ''}
                      </div>
                    </div>
                    <div className="dose-actions">
                      {status === 'taken' && (
                        <>
                          <span className="badge badge-green"><IconCheck size={11} /> Taken</span>
                          <button className="btn btn-ghost btn-xs" onClick={() => markDose(med, time, 'skipped')}>Undo</button>
                        </>
                      )}
                      {status === 'skipped' && (
                        <>
                          <span className="badge badge-red"><IconX size={11} /> Skipped</span>
                          <button className="btn btn-ghost btn-xs" onClick={() => markDose(med, time, 'taken')}>Undo</button>
                        </>
                      )}
                      {(!status || status === 'pending') && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => markDose(med, time, 'taken')}>
                            <IconCheck size={13} /> Taken
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
          </>
        )}
      </div>
    </div>
  );
}
