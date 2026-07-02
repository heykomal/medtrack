import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../components/AuthProvider.jsx';
import { useToast } from '../components/Toast.jsx';

const RELATIONSHIPS = ['Mother', 'Father', 'Brother', 'Sister', 'Spouse', 'Child', 'Friend', 'Other'];

export default function ProfileSetup() {
  const [role, setRole]         = useState(''); // 'patient' | 'caretaker'
  const [step, setStep]         = useState('role'); // 'role' | 'details'
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({
    name: '', dob: '',
    patientName: '', patientDob: '', relationship: 'Mother',
  });

  const { updateProfile } = useAuth();
  const navigate          = useNavigate();
  const toast             = useToast();

  const set = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }));

  function handleRoleSelect(r) {
    setRole(r);
    setStep('details');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const missing = role === 'patient'
      ? (!form.name.trim() || !form.dob)
      : (!form.name.trim() || !form.patientName.trim() || !form.patientDob);
    if (missing) { toast('Please fill in all required fields.', 'error'); return; }

    setSaving(true);
    await new Promise(r => setTimeout(r, 800));

    updateProfile(
      role === 'patient'
        ? { role, name: form.name.trim(), dob: form.dob }
        : { role, name: form.name.trim(), patientName: form.patientName.trim(), patientDob: form.patientDob, relationship: form.relationship }
    );

    toast('Profile saved! Welcome to MedTrack 👋', 'success');
    navigate('/');
  }

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-card">
        <div className="profile-setup-logo">
          <Logo height={40} />
        </div>

        {step === 'role' ? (
          <>
            <div className="profile-setup-header">
              <h2>Who are you managing health for?</h2>
              <p>This helps us personalise your experience.</p>
            </div>
            <div className="role-grid">
              <button className="role-card" onClick={() => handleRoleSelect('patient')}>
                <div className="role-emoji">🧑‍⚕️</div>
                <div className="role-title">Patient</div>
                <div className="role-desc">
                  I am managing my own health, medicines, and appointments.
                </div>
                <div className="role-cta">Choose Patient →</div>
              </button>
              <button className="role-card" onClick={() => handleRoleSelect('caretaker')}>
                <div className="role-emoji">🤝</div>
                <div className="role-title">Caretaker</div>
                <div className="role-desc">
                  I am helping manage someone else's health, medicines, and doses.
                </div>
                <div className="role-cta">Choose Caretaker →</div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="profile-setup-header">
              <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}
                onClick={() => setStep('role')}>
                ← Back
              </button>
              <h2>
                {role === 'patient' ? 'Tell us about yourself' : 'Tell us about you & your patient'}
              </h2>
              <p>
                {role === 'patient'
                  ? 'We\'ll use this to personalise your health dashboard.'
                  : 'We\'ll use this to personalise the dashboard for your patient.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              {role === 'patient' ? (
                <>
                  <div className="form-group">
                    <label>Your Full Name *</label>
                    <input required value={form.name} onChange={set('name')}
                      placeholder="e.g. Ram Kumar" autoFocus />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input required type="date" value={form.dob} onChange={set('dob')} />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Your Full Name *</label>
                    <input required value={form.name} onChange={set('name')}
                      placeholder="e.g. Priya Singh" autoFocus />
                  </div>
                  <div className="form-group">
                    <label>Patient&apos;s Full Name *</label>
                    <input required value={form.patientName} onChange={set('patientName')}
                      placeholder="e.g. Ram Kumar" />
                  </div>
                  <div className="form-group">
                    <label>Patient&apos;s Date of Birth *</label>
                    <input required type="date" value={form.patientDob} onChange={set('patientDob')} />
                  </div>
                  <div className="form-group">
                    <label>Your Relationship to Patient</label>
                    <select value={form.relationship} onChange={set('relationship')}>
                      {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </>
              )}

              <button className="btn btn-primary btn-full btn-lg" disabled={saving} style={{ marginTop: 8 }}>
                {saving
                  ? <><span className="btn-spinner" />Saving…</>
                  : 'Save & Continue →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
