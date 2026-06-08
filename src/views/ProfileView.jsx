import React, { useState } from 'react';
import { useCATData } from '../context/CATDataContext';
import Card from '../components/Card';

const ProfileView = () => {
  const { user, updateProfile, resetAllData } = useCATData();

  // Profile Form State
  const [name, setName] = useState(user.name || '');
  const [targetPercentile, setTargetPercentile] = useState(user.targetPercentile || '');
  const [examDate, setExamDate] = useState(user.examDate || '');
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || '#2563eb');
  const [message, setMessage] = useState('');

  const colors = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' }
  ];

  const getInitials = (nameStr) => {
    if (!nameStr) return 'DA';
    const clean = nameStr.trim().replace(/[^a-zA-Z ]/g, '');
    const words = clean.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
  };

  const handleSave = (e) => {
    e.preventDefault();
    setMessage('');
    
    const percentileNum = parseFloat(targetPercentile);
    if (isNaN(percentileNum) || percentileNum < 0 || percentileNum > 100) {
      setMessage('Target Percentile must be between 0 and 100');
      return;
    }

    updateProfile({
      name: name.trim(),
      targetPercentile: percentileNum.toFixed(2),
      examDate,
      avatarColor
    });

    setMessage('Profile settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Export Data Backup Helper
  const handleExportBackup = () => {
    const backup = {
      user: JSON.parse(localStorage.getItem('cat_user')),
      topics: JSON.parse(localStorage.getItem('cat_topics')),
      calendarLogs: JSON.parse(localStorage.getItem('cat_calendarLogs')),
      mocks: JSON.parse(localStorage.getItem('cat_mocks')),
      exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cat_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Reset Trigger
  const handleReset = () => {
    const confirmReset = window.confirm(
      "WARNING: This will permanently wipe all your preparation logs, topics list, mock scores, and settings. Are you sure you want to reset everything?"
    );
    if (confirmReset) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', padding: '10px 0' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: avatarColor,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          fontWeight: 700,
          border: 'none',
          boxShadow: 'var(--shadow-md)',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          {getInitials(name)}
        </div>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{user.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Preparing for CAT Exam | Target: {user.targetPercentile} Percentile
          </p>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: '24px' }}>
        {/* Personal details customization */}
        <Card title="Edit Profile Details" subtitle="Update your targets & personalization details">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Color Avatar Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Profile Theme Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {colors.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAvatarColor(c.value)}
                    style={{
                      backgroundColor: c.value,
                      padding: '0',
                      border: avatarColor === c.value ? '3px solid var(--text-primary)' : '1px solid var(--border-color)',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      width: '32px',
                      height: '32px',
                      transition: 'var(--transition)'
                    }}
                    title={c.name}
                    aria-label={`Select ${c.name} theme color`}
                  />
                ))}
              </div>
            </div>

            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="profileName" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Display Name</label>
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. davaladarshini"
                required
              />
            </div>

            {/* Target score */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="targetPercentile" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Target CAT Percentile</label>
              <input
                id="targetPercentile"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={targetPercentile}
                onChange={(e) => setTargetPercentile(e.target.value)}
                placeholder="e.g. 99.9"
                required
              />
            </div>

            {/* Exam Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="examDate" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Target Exam Date</label>
              <input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>

            {message && (
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'center',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: message.includes('successfully') ? 'var(--success-light)' : 'var(--danger-light)',
                color: message.includes('successfully') ? 'var(--success)' : 'var(--danger)',
                border: `1px solid ${message.includes('successfully') ? 'var(--success)' : 'var(--danger)'}`
              }}>
                {message}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Save Settings
            </button>
          </form>
        </Card>

        {/* Database & Data Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Data Management" subtitle="Save or restore local tracking databases">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your progress information is saved directly in this browser's internal local storage database. It is fast, private, and works offline.
              </p>
              
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleExportBackup}
                style={{ justifyContent: 'flex-start' }}
              >
                Export JSON Backup
              </button>

              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleReset}
                style={{ justifyContent: 'flex-start' }}
              >
                Clear Databases (Factory Reset)
              </button>
            </div>
          </Card>

          <Card title="Security & Login Credentials" subtitle="Access configuration and login keys">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                The tracking portal is locked behind a dashboard check. For safety during mock distributions, credentials can only be verified against default profile keys.
              </p>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                marginTop: '4px'
              }}>
                <strong>Default Login Details:</strong><br />
                • Username: <code style={{ fontSize: '0.8rem' }}>davaladarshini</code><br />
                • Password: <code style={{ fontSize: '0.8rem' }}>davala@11</code>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
    </div>
  );
};

export default ProfileView;
