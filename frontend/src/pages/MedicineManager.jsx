import { useState, useEffect } from 'react';
import {
  getMedicines, createMedicine, updateMedicine, deleteMedicine, getPrescriptions,
} from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import { IconPlus, IconEdit, IconTrash, IconPill, IconClock, IconFilter, IconUser } from '../components/Icons.jsx';

const UNITS = ['mg', 'ml', 'tablet', 'capsule', 'drops', 'puff', 'IU'];
const EMPTY = { prescriptionid: '', patientname: '', name: '', dosage: '', unit: 'mg', times: [], instructions: '' };

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timePillClass(hhmm) {
  const h = parseInt(hhmm.split(':')[0], 10);
  if (h >= 6  && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'night';
}

function MedCardIcon({ name }) {
  const colors = [
    ['#eff6ff', '#3b82f6'],
    ['#f0fdf4', '#10b981'],
    ['#fdf4ff', '#a855f7'],
    ['#fff7ed', '#f97316'],
    ['#fdf2f8', '#ec4899'],
    ['#f0fdfa', '#14b8a6'],
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  const [bg, color] = colors[idx];
  return (
    <div className="med-card-avatar" style={{ background: bg, color }}>
      <IconPill size={18} />
    </div>
  );
}

export default function MedicineManager() {
  const [medicines, setMedicines]         = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [editing, setEditing]             = useState(null);
  const [form, setForm]                   = useState(EMPTY);
  const [timeInput, setTimeInput]         = useState('');
  const [saving, setSaving]               = useState(false);
  const [filterPx, setFilterPx]           = useState('');
  const [showInactive, setShowInactive]   = useState(false);
  const toast = useToast();

  async function load(px) {
    try {
      const [mRes, pRes] = await Promise.all([getMedicines(px || undefined), getPrescriptions()]);
      setMedicines(mRes.documents || []);
      setPrescriptions(pRes.documents || []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }
  useEffect(() => { load(filterPx); }, [filterPx]);

  const displayed = showInactive ? medicines : medicines.filter(m => m.active !== false);

  function prescriptionLabel(id) {
    const p = prescriptions.find(p => p.$id === id);
    return p ? `${p.patientname} — ${p.doctornote || p.$id.slice(0, 8)}` : '—';
  }

  function openAdd()   { setEditing(null); setForm(EMPTY); setTimeInput(''); setShowModal(true); }
  function openEdit(m) {
    setEditing(m);
    setForm({
      prescriptionid: m.prescriptionid,
      patientname:    m.patientname,
      name:           m.name,
      dosage:         m.dosage,
      unit:           m.unit,
      times:          m.times || [],
      instructions:   m.instructions || '',
    });
    setTimeInput('');
    setShowModal(true);
  }

  function addTime() {
    const t = timeInput.trim();
    if (!t || form.times.includes(t)) return;
    setForm(f => ({ ...f, times: [...f.times, t].sort() }));
    setTimeInput('');
  }
  function removeTime(t) { setForm(f => ({ ...f, times: f.times.filter(x => x !== t) })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.times.length === 0) { toast('Add at least one reminder time.', 'error'); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateMedicine(editing.$id, form);
        setMedicines(prev => prev.map(m => m.$id === editing.$id ? updated : m));
        toast('Medicine updated');
      } else {
        await createMedicine({ ...form, active: true });
        await load(filterPx);
        toast('Medicine added');
      }
      setShowModal(false);
    } catch (e) { toast(e.message, 'error'); }
    finally     { setSaving(false); }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Remove "${name}" from medicines?`)) return;
    try {
      await deleteMedicine(id);
      setMedicines(prev => prev.filter(m => m.$id !== id));
      toast('Medicine removed', 'info');
    } catch (e) { toast(e.message, 'error'); }
  }

  async function toggleActive(m) {
    try {
      const updated = await updateMedicine(m.$id, { active: !m.active });
      setMedicines(prev => prev.map(x => x.$id === m.$id ? updated : x));
      toast(`${m.name} ${updated.active ? 'activated' : 'deactivated'}`, 'info');
    } catch (e) { toast(e.message, 'error'); }
  }

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>
            <IconPill size={20} style={{ color: '#8b5cf6' }} />
            Medicines
            <span className="count-badge">{displayed.length}</span>
          </h2>
          <p>Manage medicines with dose schedules for daily reminders</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <IconPlus size={14} /> Add Medicine
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="page-filters">
        <div className="filter-chip-row">
          <IconFilter size={13} style={{ color: 'var(--gray-400)' }} />
          <select
            value={filterPx}
            onChange={e => setFilterPx(e.target.value)}
            className="filter-select"
          >
            <option value="">All prescriptions</option>
            {prescriptions.map(p => (
              <option key={p.$id} value={p.$id}>
                {p.patientname} — {p.doctornote || p.$id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
        <button
          className={`btn btn-sm ${showInactive ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={() => setShowInactive(v => !v)}
        >
          {showInactive ? 'Showing all' : 'Show inactive'}
        </button>
      </div>

      {/* Medicine Cards */}
      {displayed.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '52px 24px' }}>
            <div className="empty-icon" style={{ width: 72, height: 72, background: 'var(--purple-50)', color: '#8b5cf6' }}>
              <IconPill size={32} />
            </div>
            <h3>No medicines yet</h3>
            <p>Add a medicine with reminder times to start tracking your daily doses.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>
              <IconPlus size={14} /> Add your first medicine
            </button>
          </div>
        </div>
      ) : (
        <div className="med-grid">
          {displayed.map(m => (
            <div key={m.$id} className={`med-card${m.active === false ? ' med-card-inactive' : ''}`}>
              {/* Card top */}
              <div className="med-card-header">
                <MedCardIcon name={m.name} />
                <div className="med-card-header-info">
                  <div className="med-card-name">{m.name}</div>
                  <div className="med-card-dosage-row">
                    <span className="badge badge-gray">{m.dosage} {m.unit}</span>
                  </div>
                </div>
                <button
                  className={`toggle-pill ${m.active !== false ? 'on' : 'off'}`}
                  onClick={() => toggleActive(m)}
                  title={m.active !== false ? 'Click to deactivate' : 'Click to activate'}
                  style={{ marginLeft: 'auto', flexShrink: 0 }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                  {m.active !== false ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Times */}
              <div className="med-card-body">
                {(m.times || []).length > 0 && (
                  <div className="med-card-times">
                    <IconClock size={11} style={{ color: 'var(--gray-400)', flexShrink: 0, marginTop: 1 }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(m.times || []).map(t => (
                        <span key={t} className={`time-pill ${timePillClass(t)}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {m.instructions && (
                  <div className="med-card-instructions">
                    <span style={{ color: 'var(--gray-400)', fontSize: 11 }}>📝</span>
                    {m.instructions}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="med-card-footer">
                <div className="med-card-patient">
                  <div className="patient-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                    {initials(m.patientname)}
                  </div>
                  <span className="med-card-patient-name">{m.patientname || '—'}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon edit" title="Edit" onClick={() => openEdit(m)}>
                    <IconEdit size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon danger" title="Remove" onClick={() => handleDelete(m.$id, m.name)}>
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? 'Edit Medicine' : 'Add Medicine'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Prescription *</label>
                <select required value={form.prescriptionid} onChange={set('prescriptionid')}>
                  <option value="">Select prescription…</option>
                  {prescriptions.map(p => (
                    <option key={p.$id} value={p.$id}>
                      {p.patientname} — {p.doctornote || p.$id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Patient Name *</label>
                <input required value={form.patientname} onChange={set('patientname')} placeholder="e.g. Ram Kumar" />
              </div>
              <div className="form-group">
                <label>Medicine Name *</label>
                <input required value={form.name} onChange={set('name')} placeholder="e.g. Metformin" />
              </div>
              <div className="form-group">
                <label>Dosage *</label>
                <input required value={form.dosage} onChange={set('dosage')} placeholder="e.g. 500" />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <select value={form.unit} onChange={set('unit')}>
                  {UNITS.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group form-full">
                <label>Instructions</label>
                <input value={form.instructions} onChange={set('instructions')} placeholder="e.g. After meals, with water" />
              </div>
              <div className="form-group form-full">
                <label>Reminder Times * (24-hour format)</label>
                <div className="time-adder">
                  <input
                    type="time"
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                    style={{ flex: 1, padding: '9px 13px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 14, fontFamily: 'var(--font)', outline: 'none', background: 'var(--surface)', color: 'var(--text)' }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={addTime}>
                    <IconPlus size={13} /> Add
                  </button>
                </div>
                <div className="times-input">
                  {form.times.length === 0
                    ? <span style={{ fontSize: 12.5, color: 'var(--gray-400)' }}>Pick a time above and click Add</span>
                    : form.times.map(t => (
                      <span key={t} className={`time-pill ${timePillClass(t)}`}>
                        {t}
                        <button type="button" className="time-pill-remove" onClick={() => removeTime(t)}>✕</button>
                      </span>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Medicine' : 'Add Medicine'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
