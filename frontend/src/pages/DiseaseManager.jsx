import { useState, useEffect } from 'react';
import { getDiseases, createDisease, updateDisease, deleteDisease } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import { IconPlus, IconEdit, IconTrash, IconVirus, IconCalendar } from '../components/Icons.jsx';

const EMPTY = { patientName: '', diseaseName: '', description: '', status: 'Active', diagnosedDate: '' };

const STATUS_BADGE = {
  Active:    'badge-red',
  Managed:   'badge-amber',
  Recovered: 'badge-green',
};

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function DiseaseManager() {
  const [diseases, setDiseases]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const toast = useToast();

  async function load() {
    try {
      const res = await getDiseases();
      setDiseases(res.documents || []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openAdd()  { setEditing(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(d) {
    setEditing(d);
    setForm({ patientName: d.patientname, diseaseName: d.diseasename,
              description: d.description || '', status: d.status, diagnosedDate: d.diagnoseDate || '' });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateDisease(editing.$id, {
          patientname: form.patientName, diseasename: form.diseaseName,
          description: form.description, status: form.status, diagnoseDate: form.diagnosedDate,
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

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>
            Diseases
            <span className="count-badge">{diseases.length}</span>
          </h2>
          <p>Track patient diseases and diagnoses</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <IconPlus size={15} /> Add Disease
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ padding: 0 }}>
        {diseases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconVirus size={34} /></div>
            <h3>No diseases recorded</h3>
            <p>Add a disease to start tracking patient health conditions.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Disease</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th><IconCalendar size={13} style={{ verticalAlign: 'middle' }} /> Diagnosed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {diseases.map(d => (
                  <tr key={d.$id}>
                    <td>
                      <div className="patient-cell">
                        <div className="patient-avatar">{initials(d.patientname)}</div>
                        <span className="patient-name">{d.patientname}</span>
                      </div>
                    </td>
                    <td className="td-primary">{d.diseasename}</td>
                    <td className="td-muted" style={{ maxWidth: 220 }}>
                      {d.description
                        ? <span title={d.description}>{d.description.length > 50 ? d.description.slice(0,50) + '…' : d.description}</span>
                        : <span style={{ color: 'var(--gray-300)' }}>—</span>}
                    </td>
                    <td><span className={`badge ${STATUS_BADGE[d.status] || 'badge-gray'}`}>{d.status}</span></td>
                    <td className="td-muted">{d.diagnoseDate || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon edit" title="Edit" onClick={() => openEdit(d)}>
                          <IconEdit size={15} />
                        </button>
                        <button className="btn btn-ghost btn-icon danger" title="Delete" onClick={() => handleDelete(d.$id, d.diseasename)}>
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
                <textarea value={form.description} onChange={set('description')} placeholder="Notes about the disease, severity, treatment plan…" />
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
