import { useState, useEffect } from 'react';
import {
  getPrescriptions, createPrescription, updatePrescription, deletePrescription, getDiseases,
} from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import { IconPlus, IconEdit, IconTrash, IconClipboard, IconCalendar, IconUser, IconVirus } from '../components/Icons.jsx';

const EMPTY = { diseaseid: '', patientname: '', doctornote: '', startdate: '', enddate: '', active: true };

function fmtDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? raw : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function PrescriptionManager() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [diseases, setDiseases]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [editing, setEditing]             = useState(null);
  const [form, setForm]                   = useState(EMPTY);
  const [saving, setSaving]               = useState(false);
  const toast = useToast();

  async function load() {
    try {
      const [pRes, dRes] = await Promise.all([getPrescriptions(), getDiseases()]);
      setPrescriptions(pRes.documents || []);
      setDiseases(dRes.documents || []);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function diseaseLabel(id) {
    const d = diseases.find(d => d.$id === id);
    return d ? d.diseasename : '—';
  }
  function diseasePatient(id) {
    const d = diseases.find(d => d.$id === id);
    return d ? d.patientname : '';
  }

  function openAdd()  { setEditing(null); setForm(EMPTY); setShowModal(true); }
  function openEdit(p) {
    setEditing(p);
    setForm({
      diseaseid:   p.diseaseid,
      patientname: p.patientname,
      doctornote:  p.doctornote || '',
      startdate:   p.startdate ? p.startdate.split('T')[0] : '',
      enddate:     p.enddate   ? p.enddate.split('T')[0]   : '',
      active:      p.active,
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await updatePrescription(editing.$id, form);
        setPrescriptions(prev => prev.map(p => p.$id === editing.$id ? updated : p));
        toast('Prescription updated');
      } else {
        await createPrescription(form);
        await load();
        toast('Prescription added');
      }
      setShowModal(false);
    } catch (e) { toast(e.message, 'error'); }
    finally     { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this prescription?')) return;
    try {
      await deletePrescription(id);
      setPrescriptions(prev => prev.filter(p => p.$id !== id));
      toast('Prescription deleted', 'info');
    } catch (e) { toast(e.message, 'error'); }
  }

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>
            <IconClipboard size={20} style={{ color: '#3b82f6' }} />
            Prescriptions
            <span className="count-badge">{prescriptions.length}</span>
          </h2>
          <p>Link prescriptions to diseases and track treatment regimens</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <IconPlus size={14} /> Add Prescription
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {prescriptions.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '52px 24px' }}>
            <div className="empty-icon" style={{ width: 72, height: 72, background: 'var(--primary-50)', color: 'var(--primary)' }}>
              <IconClipboard size={32} />
            </div>
            <h3>No prescriptions yet</h3>
            <p>Add a disease first, then create prescriptions linked to doctor visits.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>
              <IconPlus size={14} /> Add first prescription
            </button>
          </div>
        </div>
      ) : (
        <div className="prx-grid">
          {prescriptions.map(p => (
            <div key={p.$id} className={`prx-card${!p.active ? ' prx-card-inactive' : ''}`}>
              {/* Header */}
              <div className="prx-card-header">
                <div className="patient-cell" style={{ flex: 1, minWidth: 0 }}>
                  <div className="patient-avatar">{initials(p.patientname)}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="prx-patient-name">{p.patientname}</div>
                    <div className="prx-disease-tag">
                      <IconVirus size={10} />
                      {diseaseLabel(p.diseaseid)}
                    </div>
                  </div>
                </div>
                <span className={`badge ${p.active ? 'badge-green' : 'badge-gray'}`}>
                  {p.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Body */}
              <div className="prx-card-body">
                {p.doctornote ? (
                  <div className="prx-note">
                    <span className="prx-note-icon">📋</span>
                    <span>{p.doctornote.length > 100 ? p.doctornote.slice(0, 100) + '…' : p.doctornote}</span>
                  </div>
                ) : (
                  <div className="prx-note prx-note-empty">No doctor note added</div>
                )}
              </div>

              {/* Footer */}
              <div className="prx-card-footer">
                <div className="prx-dates">
                  <IconCalendar size={11} style={{ flexShrink: 0 }} />
                  <span>
                    {fmtDate(p.startdate) || 'No start'}
                    {fmtDate(p.enddate) ? ` → ${fmtDate(p.enddate)}` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon edit" title="Edit" onClick={() => openEdit(p)}>
                    <IconEdit size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon danger" title="Delete" onClick={() => handleDelete(p.$id)}>
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Prescription' : 'Add Prescription'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Disease *</label>
                <select required value={form.diseaseid} onChange={set('diseaseid')}>
                  <option value="">Select disease…</option>
                  {diseases.map(d => (
                    <option key={d.$id} value={d.$id}>{d.diseasename} — {d.patientname}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Patient Name *</label>
                <input required value={form.patientname} onChange={set('patientname')} placeholder="e.g. Ram Kumar" />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={form.startdate} onChange={set('startdate')} />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={form.enddate} onChange={set('enddate')} />
              </div>
              <div className="form-group form-full">
                <label>Doctor Note</label>
                <textarea value={form.doctornote} onChange={set('doctornote')} placeholder="Low dose regimen, review after 3 months…" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.active ? 'active' : 'inactive'}
                  onChange={e => setForm(f => ({ ...f, active: e.target.value === 'active' }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Prescription' : 'Add Prescription'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
