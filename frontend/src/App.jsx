import { useState, useEffect } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [apiMessage, setApiMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => {
        setBackendStatus(data.status);
        setApiMessage(data.service);
      })
      .catch(err => {
        setBackendStatus('error');
        setApiMessage('Cannot reach backend');
      });
  }, []);

  return (
    <div style={{ fontFamily: 'Arial', maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>MedTrack</h1>
      <h2>Medicine Reminder Platform</h2>
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Backend Status</h3>
        <p>Status: <strong>{backendStatus}</strong></p>
        <p>Service: <strong>{apiMessage}</strong></p>
      </div>
    </div>
  );
}

export default App;
