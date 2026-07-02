import { useState, useEffect, useCallback } from 'react';
import { getDoseLogs, getMedicines, createDoseLog, updateDoseLog } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { IconCheckSquare, IconCheck, IconX, IconClock, IconCalendar, IconPill, IconActivity } from '../components/Icons.jsx';

function todayISO() { return new Date().toISOString().split('T')[0]; }

function isoToLocal(iso) {
  const d = new Date(iso + 'T00:00:00');
  return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), num: d.getDate() };
}

function getLast14Days() {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const grid = [];
  const startPad = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < startPad; i++) grid.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    grid.push(new Date(year, month, d));
  }
  return grid;
}

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function heatClass(taken, total, isFuture) {
  if (isFuture)   return 'hc-future';
  if (total === 0) return 'hc-nodata';
  const r = taken / total;
  if (r === 1)    return 'hc-full';
  if (r >= 0.75)  return 'hc-good';
  if (r >= 0.25)  return 'hc-partial';
  if (r > 0)      return 'hc-poor';
  return 'hc-none';
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function DoseLogger() {
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [medicines, setMedicines]       = useState([]);
  const [logs, setLogs]                 = useState([]);
  const [allLogs, setAllLogs]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [calSummaries, setCalSummaries] = useState({});
  const [viewMode, setViewMode]         = useState('heatmap');
  const [heatYear, setHeatYear]   = useState(new Date().getFullYear());
  const [heatMonth, setHeatMonth] = useState(new Date().getMonth());
  const toast = useToast();
  const days  = getLast14Days();

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

  const loadCalendar = useCallback(async () => {
    try {
      const res  = await getDoseLogs();
      const docs = res.documents || [];
      setAllLogs(docs);
      const summaries = {};
      for (const d of days) {
        const dl = docs.filter(l => l.date === d);
        summaries[d] = {
          taken:   dl.filter(l => l.status === 'taken').length,
          skipped: dl.filter(l => l.status === 'skipped').length,
          pending: dl.filter(l => l.status === 'pending').length,
        };
      }
      setCalSummaries(summaries);
    } catch (_) {}
  }, []);
  useEffect(() => { loadCalendar(); }, []);

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
      const updated  = existing
        ? await updateDoseLog(existing.$id, { status })
        : await createDoseLog({
            medicineid:    med.$id,
            medicinename:  med.name,
            patientname:   med.patientname,
            date:          selectedDate,
            scheduledtime: time,
            status,
          });
      setLogs(prev => {
        const filtered = prev.filter(l => !(l.medicineid === med.$id && l.scheduledtime === time));
        return [...filtered, updated];
      });
      setAllLogs(prev => {
        const filtered = prev.filter(l => !(l.medicineid === med.$id && l.scheduledtime === time && l.date === selectedDate));
        return [...filtered, updated];
      });
      toast(status === 'taken' ? `${med.name} marked taken ✓` : `${med.name} skipped`, status === 'taken' ? 'success' : 'info');
    } catch (e) { toast(e.message, 'error'); }
  }

  const takenN   = schedule.filter(s => s.log?.status === 'taken').length;
  const skippedN = schedule.filter(s => s.log?.status === 'skipped').length;
  const pendingN = schedule.filter(s => !s.log || s.log.status === 'pending').length;
  const totalN   = schedule.length;
  const adherencePct = totalN > 0 ? Math.round((takenN / totalN) * 100) : 0;

  const selectedLabel = selectedDate === today
    ? 'Today'
    : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  const monthGrid = getMonthGrid(heatYear, heatMonth);
  const todayD    = new Date();

  function heatCellData(dateObj) {
    if (!dateObj) return { cls: 'hc-empty', num: '' };
    const iso      = toISO(dateObj);
    const isFuture = dateObj > todayD && iso !== today;
    const dl       = allLogs.filter(l => l.date === iso);
    const taken    = dl.filter(l => l.status === 'taken').length;
    const total    = dl.length;
    const isToday  = iso === today;
    const isSel    = iso === selectedDate;
    return {
      iso,
      cls: [heatClass(taken, total, isFuture), isToday ? 'hc-today' : '', isSel ? 'hc-sel' : ''].filter(Boolean).join(' '),
      num: dateObj.getDate(),
      taken,
      total,
    };
  }

  function prevMonth() {
    if (heatMonth === 0) { setHeatMonth(11); setHeatYear(y => y-1); }
    else setHeatMonth(m => m-1);
  }
  function nextMonth() {
    if (heatYear > todayD.getFullYear() || (heatYear === todayD.getFullYear() && heatMonth >= todayD.getMonth())) return;
    if (heatMonth === 11) { setHeatMonth(0); setHeatYear(y => y+1); }
    else setHeatMonth(m => m+1);
  }
  const canGoNext = !(heatYear === todayD.getFullYear() && heatMonth >= todayD.getMonth());

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>
            <IconCheckSquare size={20} style={{ color: '#10b981' }} />
            Dose Log
          </h2>
          <p>Track daily medicine doses and view adherence history</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn btn-sm ${viewMode === 'heatmap' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('heatmap')}
          >
            📊 Heatmap
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'strip' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('strip')}
          >
            📅 14-Day
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Calendar views */}
      {viewMode === 'heatmap' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <IconActivity size={14} style={{ verticalAlign: 'middle' }} />
              Adherence Heatmap
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={prevMonth}>‹</button>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', minWidth: 120, textAlign: 'center' }}>
                {MONTHS[heatMonth]} {heatYear}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth} disabled={!canGoNext}
                style={{ opacity: canGoNext ? 1 : 0.3 }}>›</button>
            </div>
          </div>
          <div className="heatmap-grid">
            {DOW.map(d => <div key={d} className="heatmap-dow">{d}</div>)}
            {monthGrid.map((dateObj, i) => {
              const { iso, cls, num, taken, total } = heatCellData(dateObj);
              if (!dateObj) return <div key={`e${i}`} className="heatmap-cell hc-empty" />;
              return (
                <div key={iso} className={`heatmap-cell ${cls}`}
                  title={total > 0 ? `${taken}/${total} taken` : iso}
                  onClick={() => { if (iso <= today) setSelectedDate(iso); }}>
                  <span className="heatmap-cell-num">{num}</span>
                </div>
              );
            })}
          </div>
          <div className="heatmap-legend">
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Less</span>
            {[
              { bg: 'var(--gray-100)' },
              { bg: '#fca5a5' },
              { bg: '#fcd34d' },
              { bg: '#86efac' },
              { bg: '#22c55e' },
            ].map(({ bg }, i) => (
              <div key={i} className="heatmap-lswatch" style={{ background: bg }} />
            ))}
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Full</span>
          </div>
        </div>
      )}

      {viewMode === 'strip' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <IconCalendar size={14} style={{ verticalAlign: 'middle' }} />
              Last 14 Days
            </span>
          </div>
          <div className="cal-strip">
            {days.map(day => {
              const s = calSummaries[day];
              const total = s ? s.taken + s.skipped + s.pending : 0;
              const { day: dl, num } = isoToLocal(day);
              return (
                <button key={day}
                  className={`cal-day${selectedDate === day ? ' selected' : ''}`}
                  onClick={() => setSelectedDate(day)}>
                  <div className="cal-day-label">{dl}</div>
                  <div className="cal-day-num">{num}</div>
                  <div className="cal-day-dots">
                    {s && s.taken   > 0 && <span className="cal-dot taken" />}
                    {s && s.skipped > 0 && <span className="cal-dot skipped" />}
                    {s && s.pending > 0 && <span className="cal-dot pending" />}
                    {(!s || total === 0) && <span className="cal-dot pending" style={{ opacity: .25 }} />}
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
      )}

      {/* Daily dose panel */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <IconCheckSquare size={14} style={{ verticalAlign: 'middle' }} />
            {selectedLabel}
          </span>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13, fontFamily: 'var(--font)', color: 'var(--text)', background: 'var(--surface)', outline: 'none' }}
          />
        </div>

        {loading ? (
          <div className="spinner-wrap" style={{ minHeight: 100 }}><div className="spinner" /></div>
        ) : schedule.length === 0 ? (
          <div className="empty-state" style={{ padding: '36px 24px' }}>
            <div className="empty-icon"><IconPill size={26} /></div>
            <h3>No medicines scheduled</h3>
            <p>Add medicines with reminder times from the Medicines page to begin logging doses.</p>
          </div>
        ) : (
          <>
            {/* Summary chips */}
            <div className="dl-summary-row">
              <div className="dl-summary-chip dl-taken">
                <div className="dl-summary-num">{takenN}</div>
                <div className="dl-summary-label">Taken</div>
              </div>
              <div className="dl-summary-chip dl-skipped">
                <div className="dl-summary-num">{skippedN}</div>
                <div className="dl-summary-label">Skipped</div>
              </div>
              <div className="dl-summary-chip dl-pending">
                <div className="dl-summary-num">{pendingN}</div>
                <div className="dl-summary-label">Pending</div>
              </div>
              <div className="dl-summary-chip dl-adherence">
                <div className="dl-summary-num" style={{ color: adherencePct >= 80 ? '#10b981' : adherencePct >= 50 ? '#f59e0b' : '#ef4444' }}>
                  {adherencePct}%
                </div>
                <div className="dl-summary-label">Adherence</div>
              </div>
            </div>

            {/* Dose rows */}
            <div className="schedule-list">
              {schedule.map(({ med, time, log }) => {
                const status  = log?.status;
                const timeCls = status === 'taken' ? 'taken' : status === 'skipped' ? 'skipped' : '';
                return (
                  <div key={`${med.$id}-${time}`} className="dose-row">
                    <div className={`dose-time-badge ${timeCls}`}>
                      <IconClock size={9} style={{ display: 'inline', marginRight: 2, verticalAlign: 'middle' }} />
                      {time}
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
                          <span className="badge badge-green"><IconCheck size={10} /> Taken</span>
                          <button className="btn btn-ghost btn-xs" onClick={() => markDose(med, time, 'skipped')}>Undo</button>
                        </>
                      )}
                      {status === 'skipped' && (
                        <>
                          <span className="badge badge-red"><IconX size={10} /> Skipped</span>
                          <button className="btn btn-ghost btn-xs" onClick={() => markDose(med, time, 'taken')}>Undo</button>
                        </>
                      )}
                      {(!status || status === 'pending') && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => markDose(med, time, 'taken')}>
                            <IconCheck size={12} /> Taken
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
