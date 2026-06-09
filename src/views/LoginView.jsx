import React, { useState } from 'react';
import { useCATData } from '../context/CATDataContext';
import Card from '../components/Card';

const LoginView = () => {
  const { login, signup, darkMode, toggleTheme } = useCATData();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetPercentile, setTargetPercentile] = useState('');
  const [examDate, setExamDate] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    let result;
    if (isLogin) {
      result = await login(username, password);
    } else {
      result = await signup({ username, password, name, targetPercentile, examDate });
    }
    
    if (!result.success) {
      setError(result.message || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-primary)',
      transition: 'var(--transition)',
      position: 'relative'
    }}>
      {/* Top right floating theme toggler */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
          {darkMode ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </span>
        <label className="theme-switch" aria-label="Toggle Light/Dark Mode">
          <input type="checkbox" checked={darkMode} onChange={toggleTheme} />
          <span className="switch-slider"></span>
        </label>
      </div>

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
            <line x1="18" y1="20" x2="18" y2="10" strokeWidth="3" />
            <line x1="12" y1="20" x2="12" y2="4" strokeWidth="3" />
            <line x1="6" y1="20" x2="6" y2="14" strokeWidth="3" />
          </svg>
          <h1 style={{ fontSize: '2.2rem', margin: '0 0 6px 0', letterSpacing: '-0.03em' }}>
            CAT<span style={{ color: 'var(--accent-primary)' }}>Tracker</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track syllabus, log study hours, and plan mock tests.
          </p>
        </div>

        <Card className="animate-fade-in" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', fontWeight: 600, textAlign: 'center' }}>
            {isLogin ? 'Sign In to Dashboard' : 'Create an Account'}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {!isLogin && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="name" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Full Name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required style={{ fontSize: '1rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <label htmlFor="target" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Target Percentile</label>
                    <input id="target" type="number" step="0.01" value={targetPercentile} onChange={(e) => setTargetPercentile(e.target.value)} placeholder="99.5" required style={{ fontSize: '1rem' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <label htmlFor="examDate" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Exam Date</label>
                    <input id="examDate" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required style={{ fontSize: '1rem' }} />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="username" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
                style={{ fontSize: '1rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ fontSize: '1rem' }}
              />
            </div>

            {error && (
              <div style={{
                color: 'var(--danger)',
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                textAlign: 'center',
                fontWeight: 500
              }}>
                {error}
              </div>
            )}

            <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing...' : (isLogin ? 'Access Dashboard' : 'Create Account')}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginView;
