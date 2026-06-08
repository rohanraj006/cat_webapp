import React, { createContext, useState, useEffect, useContext } from 'react';

const CATDataContext = createContext();

const DEFAULT_TOPICS = [
  // VARC
  { id: 'varc-1', section: 'VARC', name: 'Reading Comprehension (RC)', level: 'Not Started', custom: false },
  { id: 'varc-2', section: 'VARC', name: 'Para Jumbles', level: 'Not Started', custom: false },
  { id: 'varc-3', section: 'VARC', name: 'Para Summary', level: 'Not Started', custom: false },
  { id: 'varc-4', section: 'VARC', name: 'Sentence Completion', level: 'Not Started', custom: false },
  { id: 'varc-5', section: 'VARC', name: 'Odd One Out', level: 'Not Started', custom: false },
  { id: 'varc-6', section: 'VARC', name: 'Grammar & Usage', level: 'Not Started', custom: false },
  { id: 'varc-7', section: 'VARC', name: 'Vocabulary & Verbal Reasoning', level: 'Not Started', custom: false },
  
  // DILR
  { id: 'dilr-1', section: 'DILR', name: 'Linear & Circular Arrangements', level: 'Not Started', custom: false },
  { id: 'dilr-2', section: 'DILR', name: 'Grid & Matrix Puzzles', level: 'Not Started', custom: false },
  { id: 'dilr-3', section: 'DILR', name: 'Tables & Caselets', level: 'Not Started', custom: false },
  { id: 'dilr-4', section: 'DILR', name: 'Bar, Line, & Pie Charts', level: 'Not Started', custom: false },
  { id: 'dilr-5', section: 'DILR', name: 'Venn Diagrams (2, 3, & 4-Set)', level: 'Not Started', custom: false },
  { id: 'dilr-6', section: 'DILR', name: 'Games & Tournaments', level: 'Not Started', custom: false },
  { id: 'dilr-7', section: 'DILR', name: 'Binary Logic & Truth-Liar Puzzles', level: 'Not Started', custom: false },
  { id: 'dilr-8', section: 'DILR', name: 'Routes & Network Diagrams', level: 'Not Started', custom: false },

  // QA
  { id: 'qa-1', section: 'QA', name: 'Number Systems & Base Rules', level: 'Not Started', custom: false },
  { id: 'qa-2', section: 'QA', name: 'Percentages, Profit & Loss', level: 'Not Started', custom: false },
  { id: 'qa-3', section: 'QA', name: 'Ratio, Proportion & Mixture-Alligation', level: 'Not Started', custom: false },
  { id: 'qa-4', section: 'QA', name: 'Simple & Compound Interest', level: 'Not Started', custom: false },
  { id: 'qa-5', section: 'QA', name: 'Time, Work & Speed-Time-Distance', level: 'Not Started', custom: false },
  { id: 'qa-6', section: 'QA', name: 'Averages, Progressions (AP/GP)', level: 'Not Started', custom: false },
  { id: 'qa-7', section: 'QA', name: 'Linear & Quadratic Equations', level: 'Not Started', custom: false },
  { id: 'qa-8', section: 'QA', name: 'Functions & Graphs', level: 'Not Started', custom: false },
  { id: 'qa-9', section: 'QA', name: 'Logarithms & Inequalities', level: 'Not Started', custom: false },
  { id: 'qa-10', section: 'QA', name: 'Geometry & Mensuration', level: 'Not Started', custom: false },
  { id: 'qa-11', section: 'QA', name: 'Coordinate Geometry', level: 'Not Started', custom: false },
  { id: 'qa-12', section: 'QA', name: 'Permutations, Combinations & Probability', level: 'Not Started', custom: false }
];

export const CATDataProvider = ({ children }) => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('cat_isLoggedIn') === 'true';
  });

  // User Profile State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cat_user');
    return saved ? JSON.parse(saved) : {
      name: 'davaladarshini',
      targetPercentile: '99.5',
      examDate: '2026-11-29',
      avatarColor: '#2563eb'
    };
  });

  // Checklist Topics State
  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('cat_topics');
    return saved ? JSON.parse(saved) : DEFAULT_TOPICS;
  });

  // Calendar Planner Logs State
  const [calendarLogs, setCalendarLogs] = useState(() => {
    const saved = localStorage.getItem('cat_calendarLogs');
    return saved ? JSON.parse(saved) : {};
  });

  // Mock Test Scores State
  const [mocks, setMocks] = useState(() => {
    const saved = localStorage.getItem('cat_mocks');
    return saved ? JSON.parse(saved) : [];
  });

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('cat_darkMode');
    if (saved) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('cat_darkMode', darkMode);
  }, [darkMode]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('cat_isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('cat_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cat_topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('cat_calendarLogs', JSON.stringify(calendarLogs));
  }, [calendarLogs]);

  useEffect(() => {
    localStorage.setItem('cat_mocks', JSON.stringify(mocks));
  }, [mocks]);

  // Theme Toggle Actions
  const toggleTheme = () => setDarkMode(!darkMode);

  // Authentication Actions
  const login = (username, password) => {
    if (username.trim().toLowerCase() === 'davaladarshini' && password === 'davala@11') {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  // Profile Actions
  const updateProfile = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  // Topics / Checklist Actions
  const updateTopicLevel = (id, level) => {
    setTopics(prev => prev.map(topic => 
      topic.id === id ? { ...topic, level } : topic
    ));
  };

  const addTopic = (section, name) => {
    const newTopic = {
      id: `${section.toLowerCase()}-${Date.now()}`,
      section,
      name,
      level: 'Not Started',
      custom: true
    };
    setTopics(prev => [...prev, newTopic]);
  };

  const deleteTopic = (id) => {
    setTopics(prev => prev.filter(topic => topic.id !== id));
  };

  // Calendar Logs Actions
  const saveCalendarLog = (date, log) => {
    setCalendarLogs(prev => {
      const updated = { ...prev };
      if (!log || (!log.notes.trim() && !log.hours && (!log.plannedTopics || log.plannedTopics.length === 0))) {
        delete updated[date];
      } else {
        updated[date] = {
          notes: log.notes || '',
          hours: parseFloat(log.hours) || 0,
          plannedTopics: log.plannedTopics || []
        };
      }
      return updated;
    });
  };

  // Mock Test Scores Actions
  const addMockScore = (name, date, varc, dilr, qa) => {
    const varcNum = parseInt(varc) || 0;
    const dilrNum = parseInt(dilr) || 0;
    const qaNum = parseInt(qa) || 0;
    const totalNum = varcNum + dilrNum + qaNum;

    const newMock = {
      id: `mock-${Date.now()}`,
      name,
      date: date || new Date().toISOString().split('T')[0],
      varc: varcNum,
      dilr: dilrNum,
      qa: qaNum,
      total: totalNum
    };
    
    // Keep mocks sorted by date ascending
    setMocks(prev => [...prev, newMock].sort((a, b) => new Date(a.date) - new Date(b.date)));
  };

  const deleteMockScore = (id) => {
    setMocks(prev => prev.filter(mock => mock.id !== id));
  };

  // Reset Actions
  const resetAllData = () => {
    setTopics(DEFAULT_TOPICS);
    setCalendarLogs({});
    setMocks([]);
    setUser({
      name: 'davaladarshini',
      targetPercentile: '99.5',
      examDate: '2026-11-29',
      avatarColor: '#2563eb'
    });
    setIsLoggedIn(false);
    localStorage.clear();
  };

  return (
    <CATDataContext.Provider value={{
      isLoggedIn,
      user,
      topics,
      calendarLogs,
      mocks,
      darkMode,
      login,
      logout,
      toggleTheme,
      updateProfile,
      updateTopicLevel,
      addTopic,
      deleteTopic,
      saveCalendarLog,
      addMockScore,
      deleteMockScore,
      resetAllData
    }}>
      {children}
    </CATDataContext.Provider>
  );
};

export const useCATData = () => {
  const context = useContext(CATDataContext);
  if (!context) {
    throw new Error('useCATData must be used within a CATDataProvider');
  }
  return context;
};
