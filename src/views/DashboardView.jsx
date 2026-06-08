import React, { useState, useEffect } from 'react';
import { useCATData } from '../context/CATDataContext';
import Card from '../components/Card';
import ProgressRing from '../components/ProgressRing';

const DashboardView = () => {
  const { user, topics, calendarLogs, mocks, addMockScore, deleteMockScore } = useCATData();

  // Mock Form State
  const [mockName, setMockName] = useState('');
  const [mockDate, setMockDate] = useState('');
  const [varcScore, setVarcScore] = useState('');
  const [dilrScore, setDilrScore] = useState('');
  const [qaScore, setQaScore] = useState('');
  const [formError, setFormError] = useState('');

  // Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Update Countdown Timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(`${user.examDate}T09:00:00`); // CAT typically starts morning
      const now = new Date();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [user.examDate]);

  // Preparation Calculations
  const getPrepWeight = (level) => {
    switch (level) {
      case 'Mastered': return 1.0;
      case 'Advanced': return 0.75;
      case 'Intermediate': return 0.5;
      case 'Basic': return 0.25;
      default: return 0.0;
    }
  };

  const getSectionStats = (sectionName) => {
    const sectionTopics = topics.filter(t => t.section === sectionName);
    if (sectionTopics.length === 0) return 0;
    const totalWeight = sectionTopics.reduce((sum, t) => sum + getPrepWeight(t.level), 0);
    return (totalWeight / sectionTopics.length) * 100;
  };

  const varcProgress = getSectionStats('VARC');
  const dilrProgress = getSectionStats('DILR');
  const qaProgress = getSectionStats('QA');
  const overallProgress = (varcProgress + dilrProgress + qaProgress) / 3;

  // Study hours calculation
  const totalStudyHours = Object.values(calendarLogs).reduce((sum, log) => sum + (log.hours || 0), 0);

  // Study streak calculation
  const calculateStreak = () => {
    const dates = Object.keys(calendarLogs)
      .filter(date => calendarLogs[date].hours > 0)
      .sort((a, b) => new Date(b) - new Date(a)); // Sort descending (newest first)

    if (dates.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date(); // Start checking from today
    checkDate.setHours(0, 0, 0, 0);

    // If no study today, check if study happened yesterday
    const todayStr = checkDate.toISOString().split('T')[0];
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!calendarLogs[todayStr] && !calendarLogs[yesterdayStr]) {
      return 0; // Streak broken if no study today or yesterday
    }

    // Determine starting date for streak count
    let currentCheckStr = calendarLogs[todayStr] && calendarLogs[todayStr].hours > 0 ? todayStr : yesterdayStr;

    while (true) {
      if (calendarLogs[currentCheckStr] && calendarLogs[currentCheckStr].hours > 0) {
        streak++;
        // Move checkDate back by 1 day
        const prevDay = new Date(currentCheckStr);
        prevDay.setDate(prevDay.getDate() - 1);
        currentCheckStr = prevDay.toISOString().split('T')[0];
      } else {
        break;
      }
    }
    return streak;
  };

  const activeStreak = calculateStreak();

  // Mock Average calculation
  const averageMockScore = mocks.length > 0 
    ? Math.round(mocks.reduce((sum, m) => sum + m.total, 0) / mocks.length) 
    : 0;

  // Form Submit Handler
  const handleAddMock = (e) => {
    e.preventDefault();
    setFormError('');

    if (!mockName.trim()) {
      setFormError('Please enter a mock test name');
      return;
    }

    const varc = parseInt(varcScore);
    const dilr = parseInt(dilrScore);
    const qa = parseInt(qaScore);

    if (isNaN(varc) || varc < -22 || varc > 72 || 
        isNaN(dilr) || dilr < -15 || dilr > 60 || 
        isNaN(qa) || qa < -22 || qa > 66) {
      setFormError('Scores must be realistic (Max scores: VARC 72, DILR 60, QA 66)');
      return;
    }

    addMockScore(mockName, mockDate, varc, dilr, qa);
    setMockName('');
    setMockDate('');
    setVarcScore('');
    setDilrScore('');
    setVarcScore('');
    setQaScore('');
    setDilrScore('');
  };

  // Render dynamic advice
  const getStudyAdvice = () => {
    const sections = [
      { name: 'VARC', progress: varcProgress },
      { name: 'DILR', progress: dilrProgress },
      { name: 'QA', progress: qaProgress }
    ];
    sections.sort((a, b) => a.progress - b.progress);
    
    if (overallProgress === 100) {
      return "Amazing work! You have fully mastered all topics. Focus entirely on revision, mock tests, and timing optimization.";
    }
    if (overallProgress === 0) {
      return "Welcome! Get started by exploring the Syllabus Checklist and completing foundation concepts in your chosen section.";
    }

    const lowest = sections[0];
    if (lowest.name === 'QA') {
      return "Study Advice: Quantitative Aptitude is currently your lowest area. Focus on Arithmetic first, as it covers nearly 40-50% of the QA section weightage.";
    } else if (lowest.name === 'DILR') {
      return "Study Advice: Data Interpretation & Logical Reasoning requires consistent daily solving. Try solving at least 2 untimed DILR sets today to build structure recognition.";
    } else {
      return "Study Advice: Verbal Ability & Reading Comprehension can be improved by reading diverse editorial pieces (Aeon, The Hindu) and analyzing RC passage schemas.";
    }
  };

  // Render SVG Chart coordinates
  const renderSVGChart = () => {
    if (mocks.length < 2) {
      return (
        <div style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          Log at least 2 Mock Tests to visualize progress trends.
        </div>
      );
    }

    const svgWidth = 500;
    const svgHeight = 200;
    const padding = 25;

    // Find min and max values to fit chart
    const maxVal = Math.max(...mocks.map(m => m.total), 120); // CAT maximum is 198, but let's base it on score
    const minVal = Math.min(...mocks.map(m => m.total), 0);
    const range = maxVal - minVal || 1;

    const points = mocks.map((mock, index) => {
      const x = padding + (index / (mocks.length - 1)) * (svgWidth - padding * 2);
      const y = svgHeight - padding - ((mock.total - minVal) / range) * (svgHeight - padding * 2);
      return { x, y, ...mock };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Area path closing the shape at the bottom
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Y Axis Grid lines */}
          <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3,3" />
          <line x1={padding} y1={svgHeight/2} x2={svgWidth - padding} y2={svgHeight/2} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3,3" />
          <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="var(--border-color)" strokeWidth="1" />
          
          {/* Gradient area */}
          <path d={areaPath} fill="url(#chartGradient)" />
          
          {/* Main line */}
          <path d={linePath} fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Data Points */}
          {points.map((p, i) => (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-secondary)" stroke="var(--accent-primary)" strokeWidth="2" />
              <text x={p.x} y={p.y - 10} fontSize="10" fontWeight="bold" fill="var(--text-primary)" textAnchor="middle">
                {p.total}
              </text>
              <text x={p.x} y={svgHeight - 8} fontSize="9" fill="var(--text-secondary)" textAnchor="middle">
                {p.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Timer Panel */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '28px', 
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-secondary) 100%)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          COUNTDOWN TO EXAM ({user.examDate})
        </span>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Days', val: timeLeft.days },
            { label: 'Hours', val: timeLeft.hours },
            { label: 'Minutes', val: timeLeft.minutes },
            { label: 'Seconds', val: timeLeft.seconds }
          ].map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              minWidth: '90px',
              padding: '12px 8px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {String(item.val).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Overview Statistics */}
      <div className="grid-cols-4">
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Syllabus Covered</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{Math.round(overallProgress)}%</span>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${overallProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'var(--transition)' }} />
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Study Streak</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--warning)' }}>{activeStreak} Days</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>Keep logging hours daily!</span>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Study Time</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)' }}>{totalStudyHours} Hrs</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>Notes added on planner</span>
          </div>
        </Card>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Average Mock Score</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--purple)' }}>{averageMockScore || 'N/A'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>Target: Percentile {user.targetPercentile}%</span>
          </div>
        </Card>
      </div>

      {/* 3. Section breakdowns and Analytics */}
      <div className="grid-cols-3">
        <Card title="Syllabus Breakdown" subtitle="Weighted progress per CAT Section">
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '16px 0', flexWrap: 'wrap', gap: '16px' }}>
            <ProgressRing radius={55} stroke={7} progress={varcProgress} color="var(--accent-primary)" subtitle="VARC" />
            <ProgressRing radius={55} stroke={7} progress={dilrProgress} color="var(--warning)" subtitle="DILR" />
            <ProgressRing radius={55} stroke={7} progress={qaProgress} color="var(--success)" subtitle="Quant" />
          </div>
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            lineHeight: 1.4
          }}>
            {getStudyAdvice()}
          </div>
        </Card>

        <Card title="Mock Test Analytics" subtitle="Track score progress" className="grid-colspan-2">
          {renderSVGChart()}
        </Card>
      </div>

      {/* 4. Mocks Entry and History */}
      <div className="grid-cols-2">
        <Card title="Log Mock Test" subtitle="Record new mock percentile indicators">
          <form onSubmit={handleAddMock} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Mock Name</label>
                <input 
                  type="text" 
                  value={mockName} 
                  onChange={(e) => setMockName(e.target.value)} 
                  placeholder="e.g. SIMCAT 1"
                  required
                />
              </div>
              <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date Taken</label>
                <input 
                  type="date" 
                  value={mockDate} 
                  onChange={(e) => setMockDate(e.target.value)} 
                  required
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>VARC Score</label>
                <input 
                  type="number" 
                  value={varcScore} 
                  onChange={(e) => setVarcScore(e.target.value)} 
                  placeholder="Max 72"
                  min="-22"
                  max="72"
                  required
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>DILR Score</label>
                <input 
                  type="number" 
                  value={dilrScore} 
                  onChange={(e) => setDilrScore(e.target.value)} 
                  placeholder="Max 60"
                  min="-15"
                  max="60"
                  required
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Quant Score</label>
                <input 
                  type="number" 
                  value={qaScore} 
                  onChange={(e) => setQaScore(e.target.value)} 
                  placeholder="Max 66"
                  min="-22"
                  max="66"
                  required
                />
              </div>
            </div>

            {formError && (
              <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 500 }}>{formError}</span>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Record Mock Score
            </button>
          </form>
        </Card>

        <Card title="Mock Test History" subtitle="List of recent simulated test attempts">
          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {mocks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
                No mocks recorded yet.
              </div>
            ) : (
              mocks.slice().reverse().map(mock => (
                <div 
                  key={mock.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{mock.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mock.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--accent-primary)' }}>V:{mock.varc}</span>
                      <span style={{ color: 'var(--warning)' }}>D:{mock.dilr}</span>
                      <span style={{ color: 'var(--success)' }}>Q:{mock.qa}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                      {mock.total}
                    </span>
                    <button 
                      onClick={() => deleteMockScore(mock.id)} 
                      className="btn-icon-only" 
                      style={{ color: 'var(--danger)', padding: '2px', fontSize: '0.9rem', fontWeight: 'bold' }}
                      aria-label={`Delete ${mock.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default DashboardView;
