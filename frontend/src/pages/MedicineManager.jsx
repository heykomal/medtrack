import { useState, useEffect } from 'react';
import {
  getMedicines, createMedicine, updateMedicine, deleteMedicine, getPrescriptions,
} from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import { IconPlus, IconEdit, IconTrash, IconPill, IconClock, IconFilter } from '../components/Icons.jsx';

const UNITS = ['mg', 'ml', 'tablet', 'capsule', 'drops', 'puff', 'IU'];
const EMPTY = { prescriptionid: '', patientname: '', name: '', dosage: '', unit: 'mg', times: [], instructions: '' };

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
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
  const [filterPx, setFilterPx]          = useState('');
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

  function prescriptionLabel(id) {
    const p = prescriptions.find(p => p.$id === id);
    return p ? `${p.patientname} — ${p.doctornote || p.$id.slice(0,8)}` : id;
  }

  function openAdd()  { setEditing(null); setForm(EMPTY); setTimeInput(''); setShowModal(true); }
  function openEdit(m) {
    setEditing(m);
    setForm({ prescriptionid: m.prescriptionid, patientname: m.patientname, name: m.name,
              dosage: m.dosage, unit: m.unit, times: m.times || [], instructions: m.instructions || '' });
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
    if (!confirm(`Remove "${name}" from active medicines?`)) return;
    try {
      await deleteMedicine(id);
      setMedicines(prev => prev.filter(m => m.$id !== id));
      toast('Medicine removed', 'info');
    } catch (e) { toast(e.message, 'error'); }
  }

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Medicines <span className="count-badge">{medicines.length}</span></h2>
          <p>Manage medicines with dose schedules for automatic reminders</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <IconPlus size={15} /> Add Medicine
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="filter-bar">
        <IconFilter size={15} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
        <label>Filter by Prescription</label>
        <select value={filterPx} onChange={e => setFilterPx(e.target.value)}>
          <option value="">All prescriptions</option>
          {prescriptions.map(p => (
            <option key={p.$id} value={p.$id}>
              {p.patientname} — {p.doctornote || p.$id.slice(0,8)}
            </option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {medicines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconPill size={34} /></div>
            <h3>No medicines found</h3>
            <p>Add a medicine with reminder times to start receiving dose notifications.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Patient</th>
                  <th>Dose</th>
                  <th><IconClock size={13} style={{ verticalAlign: 'middle' }} /> Reminder Times</th>
                  <th>Instructions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(m => (
                  <tr key={m.$id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="patient-avatar" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', borderRadius: 8 }}>
                          <IconPill size={14} />
                        </div>
                        <span className="td-primary">{m.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="patient-cell">
                        <div className="patient-avatar">{initials(m.patientname)}</div>
                        <span style={{ fontSize: 13.5, color: 'var(--gray-700)' }}>{m.patientname}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{m.dosage} {m.unit}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(m.times || []).map(t => (
                          <span key={t} className="badge badge-blue">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="td-muted">{m.instructions || <span style={{ color: 'var(--gray-300)' }}>—</span>}</td>
                    <td>
                      <span className={`badge ${m.active ? 'badge-green' : 'badge-gray'}`}>
                        {m.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon edit" title="Edit" onClick={() => openEdit(m)}>
                          <IconEdit size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon danger" title="Remove" onClick={() => handleDelete(m.$id, m.name)}>
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                      {p.patientname} — {p.doctornote || p.$id.slice(0,8)}
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
                <label>Reminder Times * (24h format)</label>
                <div className="time-adder">
                  <input
                    type="time"
                    value={timeInput}
                    onChange={e => setTimeInput(e.target.value)}
                    style={{ flex: 1, padding: '9px 13px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--r-md)', fontSize: 14, fontFamily: 'var(--font)' }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={addTime}>
                    <IconPlus size={14} /> Add
                  </button>
                </div>
                <div className="times-input">
                  {form.times.length === 0
                    ? <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>No times added yet — pick a time and click Add</span>
                    : form.times.map(t => (
                      <span key={t} className="time-pill">
                        {t}
                        <button type="button" className="time-pill-remove" onClick={() => removeTime(t)}>✕</button>
                      </span>
                    ))}
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
