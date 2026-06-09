import React, { createContext, useState, useEffect, useContext } from 'react';

const CATDataContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DEFAULT_TOPICS = [
  { topicId: 'varc-1', section: 'VARC', name: 'Reading Comprehension (RC)', level: 'Not Started', custom: false },
  { topicId: 'varc-2', section: 'VARC', name: 'Para Jumbles', level: 'Not Started', custom: false },
  { topicId: 'varc-3', section: 'VARC', name: 'Para Summary', level: 'Not Started', custom: false },
  { topicId: 'varc-4', section: 'VARC', name: 'Sentence Completion', level: 'Not Started', custom: false },
  { topicId: 'varc-5', section: 'VARC', name: 'Odd One Out', level: 'Not Started', custom: false },
  { topicId: 'varc-6', section: 'VARC', name: 'Grammar & Usage', level: 'Not Started', custom: false },
  { topicId: 'varc-7', section: 'VARC', name: 'Vocabulary & Verbal Reasoning', level: 'Not Started', custom: false },
  { topicId: 'dilr-1', section: 'DILR', name: 'Linear & Circular Arrangements', level: 'Not Started', custom: false },
  { topicId: 'dilr-2', section: 'DILR', name: 'Grid & Matrix Puzzles', level: 'Not Started', custom: false },
  { topicId: 'dilr-3', section: 'DILR', name: 'Tables & Caselets', level: 'Not Started', custom: false },
  { topicId: 'dilr-4', section: 'DILR', name: 'Bar, Line, & Pie Charts', level: 'Not Started', custom: false },
  { topicId: 'dilr-5', section: 'DILR', name: 'Venn Diagrams (2, 3, & 4-Set)', level: 'Not Started', custom: false },
  { topicId: 'dilr-6', section: 'DILR', name: 'Games & Tournaments', level: 'Not Started', custom: false },
  { topicId: 'dilr-7', section: 'DILR', name: 'Binary Logic & Truth-Liar Puzzles', level: 'Not Started', custom: false },
  { topicId: 'dilr-8', section: 'DILR', name: 'Routes & Network Diagrams', level: 'Not Started', custom: false },
  { topicId: 'qa-1', section: 'QA', name: 'Number Systems & Base Rules', level: 'Not Started', custom: false },
  { topicId: 'qa-2', section: 'QA', name: 'Percentages, Profit & Loss', level: 'Not Started', custom: false },
  { topicId: 'qa-3', section: 'QA', name: 'Ratio, Proportion & Mixture-Alligation', level: 'Not Started', custom: false },
  { topicId: 'qa-4', section: 'QA', name: 'Simple & Compound Interest', level: 'Not Started', custom: false },
  { topicId: 'qa-5', section: 'QA', name: 'Time, Work & Speed-Time-Distance', level: 'Not Started', custom: false },
  { topicId: 'qa-6', section: 'QA', name: 'Averages, Progressions (AP/GP)', level: 'Not Started', custom: false },
  { topicId: 'qa-7', section: 'QA', name: 'Linear & Quadratic Equations', level: 'Not Started', custom: false },
  { topicId: 'qa-8', section: 'QA', name: 'Functions & Graphs', level: 'Not Started', custom: false },
  { topicId: 'qa-9', section: 'QA', name: 'Logarithms & Inequalities', level: 'Not Started', custom: false },
  { topicId: 'qa-10', section: 'QA', name: 'Geometry & Mensuration', level: 'Not Started', custom: false },
  { topicId: 'qa-11', section: 'QA', name: 'Coordinate Geometry', level: 'Not Started', custom: false },
  { topicId: 'qa-12', section: 'QA', name: 'Permutations, Combinations & Probability', level: 'Not Started', custom: false }
];

export const CATDataProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cat_token'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [isLoading, setIsLoading] = useState(true);
  
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cat_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [topics, setTopics] = useState([]);
  const [calendarLogs, setCalendarLogs] = useState({});
  const [mocks, setMocks] = useState([]);
  const [notes, setNotes] = useState([]);

  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('cat_darkMode');
    if (saved) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('cat_darkMode', darkMode);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // Helper for auth requests
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Fetch data on mount if logged in
  useEffect(() => {
    if (isLoggedIn && token) {
      fetchAllData();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, token]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Init default topics if none exist
      await fetch(`${API_URL}/init-defaults`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ topics: DEFAULT_TOPICS })
      });

      // 2. Fetch all resources concurrently
      const [userRes, topicsRes, logsRes, mocksRes, notesRes] = await Promise.all([
        fetch(`${API_URL}/user/me`, { headers: authHeaders() }),
        fetch(`${API_URL}/topics`, { headers: authHeaders() }),
        fetch(`${API_URL}/calendarLogs`, { headers: authHeaders() }),
        fetch(`${API_URL}/mocks`, { headers: authHeaders() }),
        fetch(`${API_URL}/notes`, { headers: authHeaders() })
      ]);

      if (userRes.ok) setUser(await userRes.json());
      if (topicsRes.ok) setTopics((await topicsRes.json()).map(t => ({...t, id: t.topicId}))); 
      if (logsRes.ok) setCalendarLogs(await logsRes.json());
      if (mocksRes.ok) setMocks(await mocksRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());

    } catch (error) {
      console.error("Failed to fetch data:", error);
      // If unauthorized, token might be expired
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('cat_token', data.token);
        localStorage.setItem('cat_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('cat_token', data.token);
        localStorage.setItem('cat_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: "Network error" };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    setTopics([]);
    setCalendarLogs({});
    setMocks([]);
    setNotes([]);
    localStorage.removeItem('cat_token');
    localStorage.removeItem('cat_user');
  };

  const updateProfile = async (updatedFields) => {
    try {
      const res = await fetch(`${API_URL}/user`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('cat_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await fetch(`${API_URL}/user/password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Password update failed", error);
      return { success: false, message: "Network error" };
    }
  };

  const updateTopicLevel = async (id, level) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    try {
      setTopics(prev => prev.map(t => t.id === id ? { ...t, level } : t));
      await fetch(`${API_URL}/topics/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ ...topic, level, topicId: id })
      });
    } catch (error) {
      console.error("Topic update failed", error);
    }
  };

  const addTopic = async (section, name) => {
    const newId = `${section.toLowerCase()}-${Date.now()}`;
    const newTopic = { topicId: newId, section, name, level: 'Not Started', custom: true };
    try {
      setTopics(prev => [...prev, { ...newTopic, id: newId }]);
      await fetch(`${API_URL}/topics`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newTopic)
      });
    } catch (error) {
      console.error("Add topic failed", error);
    }
  };

  const deleteTopic = async (id) => {
    try {
      setTopics(prev => prev.filter(t => t.id !== id));
      await fetch(`${API_URL}/topics/${id}`, { method: 'DELETE', headers: authHeaders() });
    } catch (error) {
      console.error("Delete topic failed", error);
    }
  };

  const saveCalendarLog = async (date, log) => {
    try {
      setCalendarLogs(prev => {
        const updated = { ...prev };
        if (!log || (!log.notes.trim() && !log.hours && (!log.plannedTopics || log.plannedTopics.length === 0))) {
          delete updated[date];
        } else {
          updated[date] = { notes: log.notes || '', hours: parseFloat(log.hours) || 0, plannedTopics: log.plannedTopics || [] };
        }
        return updated;
      });
      await fetch(`${API_URL}/calendarLogs/${date}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(log || { notes: '', hours: 0, plannedTopics: [] })
      });
    } catch (error) {
      console.error("Save log failed", error);
    }
  };

  const addMockScore = async (name, date, varc, dilr, qa) => {
    const varcNum = parseInt(varc) || 0;
    const dilrNum = parseInt(dilr) || 0;
    const qaNum = parseInt(qa) || 0;
    const newMock = {
      mockId: `mock-${Date.now()}`,
      name,
      date: date || new Date().toISOString().split('T')[0],
      varc: varcNum, dilr: dilrNum, qa: qaNum, total: varcNum + dilrNum + qaNum
    };
    try {
      setMocks(prev => [...prev, newMock].sort((a, b) => new Date(a.date) - new Date(b.date)));
      await fetch(`${API_URL}/mocks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newMock)
      });
    } catch (error) {
      console.error("Add mock failed", error);
    }
  };

  const deleteMockScore = async (id) => {
    try {
      setMocks(prev => prev.filter(m => m.mockId !== id && m.id !== id && m._id !== id));
      await fetch(`${API_URL}/mocks/${id}`, { method: 'DELETE', headers: authHeaders() });
    } catch (error) {
      console.error("Delete mock failed", error);
    }
  };

  // --- Notes Actions ---
  const addNote = async (title, content, tags = []) => {
    const newNote = { title, content, tags };
    try {
      const res = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newNote)
      });
      const savedNote = await res.json();
      setNotes(prev => [savedNote, ...prev]);
    } catch (error) {
      console.error("Add note failed", error);
    }
  };

  const updateNote = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_URL}/notes/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updatedNote = await res.json();
        setNotes(prev => prev.map(n => n._id === id ? updatedNote : n));
      }
    } catch (error) {
      console.error("Update note failed", error);
    }
  };

  const deleteNote = async (id) => {
    try {
      setNotes(prev => prev.filter(n => n._id !== id));
      await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE', headers: authHeaders() });
    } catch (error) {
      console.error("Delete note failed", error);
    }
  };

  const resetAllData = () => {
    logout();
  };

  return (
    <CATDataContext.Provider value={{
      isLoggedIn, isLoading, user, topics, calendarLogs, mocks, notes, darkMode,
      login, signup, logout, updateProfile, changePassword, updateTopicLevel, addTopic,
      deleteTopic, saveCalendarLog, addMockScore, deleteMockScore, resetAllData,
      addNote, updateNote, deleteNote, toggleTheme
    }}>
      {children}
    </CATDataContext.Provider>
  );
};

export const useCATData = () => {
  const context = useContext(CATDataContext);
  if (!context) throw new Error('useCATData must be used within a CATDataProvider');
  return context;
};
