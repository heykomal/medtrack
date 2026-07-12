import { useState, useEffect } from 'react';

const STEPS = [
  {
    emoji: '🏥',
    title: 'Welcome to MedTrack',
    body: 'Your personal medicine reminder platform. Let\'s get you set up in 4 easy steps.',
  },
  {
    emoji: '🦠',
    title: 'Add Your Disease',
    body: 'Start by recording your health condition. Go to Diseases → Add Disease.',
  },
  {
    emoji: '📋',
    title: 'Create a Prescription',
    body: "Link a doctor's prescription to your disease with start and end dates.",
  },
  {
    emoji: '💊',
    title: 'Schedule Medicines',
    body: "Add medicines with exact dose times. We'll remind you automatically.",
  },
];

const KEY = 'medtrack_tutorial_done';

export default function Tutorial() {
  const [step,    setStep]    = useState(0);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      // Small delay so the page renders first
      const t = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(KEY, '1');
      setVisible(false);
      setClosing(false);
    }, 300);
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  }

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div className={`tut-backdrop${closing ? ' closing' : ''}`} onClick={e => { if (e.target === e.currentTarget) dismiss(); }}>
      <div className={`tut-modal${closing ? ' closing' : ''}`} role="dialog" aria-modal="true" aria-label="Welcome tutorial">

        {/* Header */}
        <div className="tut-header">
          <button className="tut-close" onClick={dismiss} aria-label="Close tutorial">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Step content — slides */}
        <div className="tut-body" key={step}>
          <div className="tut-emoji">{current.emoji}</div>
          <h2 className="tut-title">{current.title}</h2>
          <p className="tut-text">{current.body}</p>
        </div>

        {/* Progress dots */}
        <div className="tut-dots" role="tablist" aria-label="Tutorial progress">
          {STEPS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === step}
              className={`tut-dot${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="tut-actions">
          <button className="tut-skip" onClick={dismiss}>Skip</button>
          <button className="tut-next" onClick={next}>
            {step < STEPS.length - 1 ? 'Next →' : 'Get Started ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}
