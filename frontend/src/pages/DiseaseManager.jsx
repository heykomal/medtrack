import { useState, useEffect } from 'react';
import { getDiseases, createDisease, updateDisease, deleteDisease } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import { IconPlus, IconEdit, IconTrash, IconVirus, IconCalendar, IconUser } from '../components/Icons.jsx';

const EMPTY = { patientName: '', diseaseName: '', description: '', status: 'Active', diagnosedDate: '' };

const STATUS_MAP = {
  Active:    { cls: 'badge-red',   dot: '#ef4444', label: 'Active'    },
  Managed:   { cls: 'badge-amber', dot: '#f59e0b', label: 'Managed'   },
  Recovered: { cls: 'badge-green', dot: '#10b981', label: 'Recovered' },
};

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw + (raw.includes('T') ? '' : 'T00:00:00'));
  return isNaN(d) ? raw : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function avatarColor(name) {
  const colors = [
    ['#fdf2f8', '#ec4899'], ['#fdf4ff', '#a855f7'], ['#eff6ff', '#3b82f6'],
    ['#f0fdfa', '#14b8a6'], ['#f0fdf4', '#10b981'], ['#fff7ed', '#f97316'],
  ];
  const i = (name || '').charCodeAt(0) % colors.length;
  return colors[i];
}

export default function DiseaseManager() {
  const [diseases, setDiseases]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();

  async function load() {
    try {
      const res = await getDiseases();
      setDiseases(res.documents || []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(d) {
    setEditing(d);
    setForm({
      patientName:   d.patientname,
      diseaseName:   d.diseasename,
      description:   d.description || '',
      status:        d.status,
      diagnosedDate: d.diagnoseDate || '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateDisease(editing.$id, {
          patientname:  form.patientName,
          diseasename:  form.diseaseName,
          description:  form.description,
          status:       form.status,
          diagnoseDate: form.diagnosedDate,
        });
        setDiseases(prev => prev.map(d => d.$id === editing.$id ? updated : d));
        toast('Disease updated successfully');
      } else {
        await createDisease(form);
        await load();
        toast('Disease added successfully');
      }
      setShowModal(false);
    } catch (e) { toast(e.message, 'error'); }
    finally     { setSaving(false); }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteDisease(id);
      setDiseases(prev => prev.filter(d => d.$id !== id));
      toast('Disease record deleted', 'info');
    } catch (e) { toast(e.message, 'error'); }
  }

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const displayed = statusFilter ? diseases.filter(d => d.status === statusFilter) : diseases;

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>
            <IconVirus size={20} style={{ color: '#14b8a6' }} />
            Diseases
            <span className="count-badge">{diseases.length}</span>
          </h2>
          <p>Track patient health conditions and diagnoses</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <IconPlus size={14} /> Add Disease
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Status filter chips */}
      {diseases.length > 0 && (
        <div className="page-filters">
          <div className="filter-chip-row">
            {['', 'Active', 'Managed', 'Recovered'].map(s => (
              <button
                key={s || 'all'}
                className={`filter-chip${statusFilter === s ? ' active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s || 'All'}
                {s && (
                  <span className="filter-chip-count">
                    {diseases.filter(d => d.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '52px 24px' }}>
            <div className="empty-icon" style={{ width: 72, height: 72, background: 'var(--teal-100)', color: 'var(--teal-600)' }}>
              <IconVirus size={32} />
            </div>
            <h3>{statusFilter ? `No ${statusFilter.toLowerCase()} conditions` : 'No diseases recorded'}</h3>
            <p>
              {statusFilter
                ? `No diseases with "${statusFilter}" status found.`
                : 'Add a disease to start tracking patient health conditions and treatment.'}
            </p>
            {!statusFilter && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>
                <IconPlus size={14} /> Add first disease
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="disease-grid">
          {displayed.map(d => {
            const sm = STATUS_MAP[d.status] || { cls: 'badge-gray', dot: 'var(--gray-400)', label: d.status };
            const [avatarBg, avatarColor_] = avatarColor(d.patientname);
            return (
              <div className="disease-card" key={d.$id}>
                <div className="disease-card-top">
                  <div className="disease-card-top-left">
                    <div className="patient-avatar" style={{ background: avatarBg, color: avatarColor_ }}>
                      {initials(d.patientname)}
                    </div>
                    <div>
                      <div className="disease-name">{d.diseasename}</div>
                      <div className="disease-patient">
                        <IconUser size={10} />
                        {d.patientname}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${sm.cls}`} style={{ flexShrink: 0 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: sm.dot, display: 'inline-block' }} />
                    {sm.label}
                  </span>
                </div>

                {d.description && (
                  <p className="disease-desc">
                    {d.description.length > 100 ? d.description.slice(0, 100) + '…' : d.description}
                  </p>
                )}

                <div className="disease-card-footer">
                  <div className="disease-date">
                    <IconCalendar size={11} />
                    {fmtDate(d.diagnoseDate) || 'No date recorded'}
                  </div>
                  <div className="disease-actions">
                    <button className="btn btn-ghost btn-icon edit" title="Edit" onClick={() => openEdit(d)}>
                      <IconEdit size={14} />
                    </button>
                    <button className="btn btn-ghost btn-icon danger" title="Delete" onClick={() => handleDelete(d.$id, d.diseasename)}>
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Disease' : 'Add Disease'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Patient Name *</label>
                <input required value={form.patientName} onChange={set('patientName')} placeholder="e.g. Ram Kumar" />
              </div>
              <div className="form-group">
                <label>Disease Name *</label>
                <input required value={form.diseaseName} onChange={set('diseaseName')} placeholder="e.g. Diabetes Type 2" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={set('status')}>
                  <option>Active</option>
                  <option>Managed</option>
                  <option>Recovered</option>
                </select>
              </div>
              <div className="form-group">
                <label>Diagnosed Date</label>
                <input type="date" value={form.diagnosedDate} onChange={set('diagnosedDate')} />
              </div>
              <div className="form-group form-full">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Notes about severity, symptoms, treatment plan…"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Disease' : 'Add Disease'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
