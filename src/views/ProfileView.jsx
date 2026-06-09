import React, { useState } from 'react';
import { useCATData } from '../context/CATDataContext';
import Card from '../components/Card';

const ProfileView = () => {
  const { user, updateProfile, changePassword } = useCATData();

  // Profile Form State
  const [name, setName] = useState(user.name || '');
  const [targetPercentile, setTargetPercentile] = useState(user.targetPercentile || '');
  const [examDate, setExamDate] = useState(user.examDate || '');
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || '#2563eb');
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
  const [profileMessage, setProfileMessage] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setProfilePicture(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileMessage('');
    
    const percentileNum = parseFloat(targetPercentile);
    if (isNaN(percentileNum) || percentileNum < 0 || percentileNum > 100) {
      setProfileMessage('Target Percentile must be between 0 and 100');
      return;
    }

    updateProfile({
      name: name.trim(),
      targetPercentile: percentileNum.toFixed(2),
      examDate,
      avatarColor,
      profilePicture
    });

    setProfileMessage('Profile settings saved successfully!');
    setTimeout(() => setProfileMessage(''), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords don't match", type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: "Password must be at least 6 characters long", type: 'error' });
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordMessage({ text: "Password updated successfully!", type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMessage({ text: result.message || "Failed to update password", type: 'error' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', padding: '10px 0' }}>
        {profilePicture ? (
          <img 
            src={profilePicture} 
            alt="Profile" 
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--accent-primary)',
              boxShadow: 'var(--shadow-md)'
            }}
          />
        ) : (
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
        )}
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
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Custom Picture Upload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="profilePicture" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Upload Profile Picture</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    flex: 1
                  }}
                />
                {profilePicture && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setProfilePicture('')}
                    style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Color Avatar Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Or select a Theme Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {colors.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => { setAvatarColor(c.value); setProfilePicture(''); }}
                    style={{
                      backgroundColor: c.value,
                      padding: '0',
                      border: avatarColor === c.value && !profilePicture ? '3px solid var(--text-primary)' : '1px solid var(--border-color)',
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

            {profileMessage && (
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'center',
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: profileMessage.includes('successfully') ? 'var(--success-light)' : 'var(--danger-light)',
                color: profileMessage.includes('successfully') ? 'var(--success)' : 'var(--danger)',
                border: `1px solid ${profileMessage.includes('successfully') ? 'var(--success)' : 'var(--danger)'}`
              }}>
                {profileMessage}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Save Settings
            </button>
          </form>
        </Card>

        {/* Database & Data Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <Card title="Security Settings" subtitle="Change your password">
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {passwordMessage.text && (
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: passwordMessage.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                  color: passwordMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  border: `1px solid ${passwordMessage.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
                }}>
                  {passwordMessage.text}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                Change Password
              </button>
            </form>
          </Card>
        </div>
      </div>
      
    </div>
  );
};

export default ProfileView;
