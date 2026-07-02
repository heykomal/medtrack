const STEPS = [
  {
    emoji: '💊',
    tag: 'Step 1 of 4',
    title: 'Welcome to MedTrack',
    desc: 'MedTrack helps you manage chronic disease treatment from diagnosis to daily dose — all in one place. Never miss a dose again with smart reminders and adherence tracking.',
  },
  {
    emoji: '🦠',
    tag: 'Step 2 of 4',
    title: 'Track Your Diseases',
    desc: 'Start by adding a disease in the Diseases section. Record the diagnosis date, status (Active / Managed / Recovered), and any notes. Each disease becomes the root of your treatment tree.',
  },
  {
    emoji: '💉',
    tag: 'Step 3 of 4',
    title: 'Prescriptions & Medicines',
    desc: 'Link a Prescription to each disease, then add Medicines to that prescription with dosage and reminder times. The cron service will automatically email you at each scheduled time.',
  },
  {
    emoji: '📅',
    tag: 'Step 4 of 4',
    title: 'Log Doses Every Day',
    desc: 'Use the Dose Log to mark each medicine as Taken or Skipped. The dashboard shows your live adherence percentage and today\'s full schedule. Your 14-day calendar heatmap makes trends visible at a glance.',
  },
];

import { useState } from 'react';

export default function OnboardingTutorial({ onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  function next() {
    if (isLast) { onClose(); return; }
    setStep(s => s + 1);
  }

  return (
    <div className="onboarding-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="onboarding-modal">
        <div className={`onboarding-banner s${step}`}>
          {current.emoji}
        </div>

        <div className="onboarding-body">
          <div className="onboarding-step-tag">{current.tag}</div>
          <div className="onboarding-title">{current.title}</div>
          <div className="onboarding-desc">{current.desc}</div>
        </div>

        <div className="onboarding-footer">
          <div className="onboarding-dots">
            {STEPS.map((_, i) => (
              <button
                key={i}
                className={`onboarding-dot${i === step ? ' active' : ''}`}
                onClick={() => setStep(i)}
                style={{ border: 'none', cursor: 'pointer', padding: 0 }}
              />
            ))}
          </div>
          <div className="onboarding-actions">
            {!isLast && (
              <button className="btn btn-ghost btn-sm" onClick={onClose}>
                Skip
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={next}>
              {isLast ? 'Get started' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
