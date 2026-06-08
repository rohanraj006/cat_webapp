import React, { useState } from 'react';
import { useCATData } from '../context/CATDataContext';
import Card from '../components/Card';
import Modal from '../components/Modal';

const CalendarView = () => {
  const { calendarLogs, saveCalendarLog, topics } = useCATData();

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Log Form State
  const [notes, setNotes] = useState('');
  const [hours, setHours] = useState('');
  const [plannedTopics, setPlannedTopics] = useState([]);
  const [topicSearch, setTopicSearch] = useState('');

  // Date Navigation Helpers
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'month') {
      nextDate.setMonth(nextDate.getMonth() - 1);
    } else {
      nextDate.setDate(nextDate.getDate() - 7);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'month') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month Math
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday...
  };

  // Generate Month Grid Data
  const generateMonthDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayIndex = getFirstDayOfMonth(currentDate);
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    
    const cells = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i);
      cells.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      cells.push({ date: d, isCurrentMonth: true });
    }

    // Next month filler days
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const nextDaysNeeded = totalCells - cells.length;
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      cells.push({ date: d, isCurrentMonth: false });
    }

    return cells;
  };

  // Generate Week Grid Data
  const generateWeekDays = () => {
    const cells = [];
    const dayOfWeek = currentDate.getDay(); // 0-6
    // Start of the week is Sunday
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      cells.push({ date: d, isCurrentMonth: d.getMonth() === currentDate.getMonth() });
    }
    return cells;
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarCells = viewMode === 'month' ? generateMonthDays() : generateWeekDays();

  // Open Modal and populate form
  const handleDayClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDateStr(dateStr);
    
    const log = calendarLogs[dateStr] || { notes: '', hours: '', plannedTopics: [] };
    setNotes(log.notes || '');
    setHours(log.hours || '');
    setPlannedTopics(log.plannedTopics || []);
    setTopicSearch('');
    setIsModalOpen(true);
  };

  // Save Modal Form Content
  const handleSaveLog = (e) => {
    e.preventDefault();
    if (!selectedDateStr) return;

    saveCalendarLog(selectedDateStr, {
      notes,
      hours: hours !== '' ? parseFloat(hours) : 0,
      plannedTopics
    });
    
    setIsModalOpen(false);
  };

  // Clear log
  const handleClearLog = () => {
    if (!selectedDateStr) return;
    saveCalendarLog(selectedDateStr, null);
    setIsModalOpen(false);
  };

  // Filter topics for modal checklist selection
  const filteredTopicList = topics.filter(t => 
    t.name.toLowerCase().includes(topicSearch.toLowerCase()) ||
    t.section.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const togglePlannedTopic = (topicId) => {
    setPlannedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId) 
        : [...prev, topicId]
    );
  };

  // Helpers to get topic detail by ID
  const getTopicDetail = (id) => {
    return topics.find(t => t.id === id);
  };

  // Formatting date for title
  const formatHeaderDate = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    } else {
      const weekDays = generateWeekDays();
      const first = weekDays[0].date;
      const last = weekDays[6].date;
      return `${first.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${last.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Calendar Controls */}
      <div 
        className="glass-panel" 
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={handleToday}>Today</button>
          <button className="btn btn-secondary" onClick={handlePrev}>&lt; Prev</button>
          <button className="btn btn-secondary" onClick={handleNext}>Next &gt;</button>
          <h2 style={{ fontSize: '1.25rem', margin: '0 12px', fontWeight: 600 }}>
            {formatHeaderDate()}
          </h2>
        </div>

        {/* Month/Week Switch */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px'
        }}>
          <button
            onClick={() => setViewMode('month')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'month' ? 'var(--bg-secondary)' : 'transparent',
              color: viewMode === 'month' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: viewMode === 'month' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Month View
          </button>
          <button
            onClick={() => setViewMode('week')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: viewMode === 'week' ? 'var(--bg-secondary)' : 'transparent',
              color: viewMode === 'week' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: viewMode === 'week' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)'
            }}
          >
            Week View
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <Card style={{ padding: '20px' }}>
        {/* Days of week header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          textAlign: 'center', 
          fontWeight: 600,
          color: 'var(--text-secondary)',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px',
          marginBottom: '10px'
        }}>
          {daysOfWeek.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Day Cells */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          minHeight: viewMode === 'month' ? '350px' : '100px'
        }}>
          {calendarCells.map((cell, idx) => {
            const cellDateStr = cell.date.toISOString().split('T')[0];
            const isToday = cellDateStr === new Date().toISOString().split('T')[0];
            const log = calendarLogs[cellDateStr];
            const hasHours = log && log.hours > 0;
            const hasNotes = log && log.notes.trim().length > 0;

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(cell.date)}
                style={{
                  border: isToday ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: viewMode === 'month' ? '75px' : '90px',
                  backgroundColor: cell.isCurrentMonth ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  color: cell.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  cursor: 'pointer',
                  opacity: cell.isCurrentMonth ? 1 : 0.5,
                  transition: 'var(--transition)',
                  position: 'relative'
                }}
                className="calendar-cell"
              >
                {/* Date Number */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'var(--accent-primary)' : 'inherit'
                  }}>
                    {cell.date.getDate()}
                  </span>
                  
                  {/* Hours Badge */}
                  {hasHours && (
                    <span style={{ 
                      fontSize: '0.7rem', 
                      backgroundColor: 'var(--accent-light)', 
                      color: 'var(--accent-primary)',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      {log.hours}h
                    </span>
                  )}
                </div>

                {/* Indicators indicator (notes, plans) */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px', minHeight: '8px' }}>
                  {hasNotes && (
                    <span 
                      style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }} 
                      title="Has study notes"
                    />
                  )}
                  {log?.plannedTopics?.length > 0 && (
                    <span 
                      style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--purple)' }} 
                      title={`${log.plannedTopics.length} planned topics`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 5. Calendar Modal for Logging Studies */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDateStr ? `Study Log: ${selectedDateStr}` : 'Study Log'}
      >
        <form onSubmit={handleSaveLog} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Note inputs */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="logHours" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Study Hours Logged
              </label>
              <input
                id="logHours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 2.5"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="logNotes" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Daily Study Notes / Insights
            </label>
            <textarea
              id="logNotes"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared Arithmetic concepts, solved 2 RC passages under 15 mins..."
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          {/* Topic link planning */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Link syllabus topics ({plannedTopics.length} linked)
            </label>
            <input 
              type="text" 
              placeholder="Filter topics list..."
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.85rem', marginBottom: '8px' }}
            />
            
            <div style={{ 
              maxHeight: '140px', 
              overflowY: 'auto', 
              border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-sm)',
              padding: '8px',
              backgroundColor: 'var(--bg-tertiary)'
            }}>
              {filteredTopicList.map(t => {
                const isSelected = plannedTopics.includes(t.id);
                return (
                  <label 
                    key={t.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      fontSize: '0.85rem', 
                      padding: '4px 0',
                      cursor: 'pointer' 
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => togglePlannedTopic(t.id)}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 600, 
                      padding: '1px 4px', 
                      borderRadius: '4px',
                      backgroundColor: t.section === 'VARC' ? 'var(--accent-light)' : t.section === 'DILR' ? 'var(--warning-light)' : 'var(--success-light)',
                      color: t.section === 'VARC' ? 'var(--accent-primary)' : t.section === 'DILR' ? 'var(--warning)' : 'var(--success)'
                    }}>
                      {t.section}
                    </span>
                    <span style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {t.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Planned topics summary pill */}
          {plannedTopics.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {plannedTopics.map(id => {
                const detail = getTopicDetail(id);
                if (!detail) return null;
                return (
                  <span 
                    key={id} 
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 8px', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {detail.name}
                    <span 
                      style={{ cursor: 'pointer', color: 'var(--danger)' }} 
                      onClick={() => togglePlannedTopic(id)}
                    >
                      ✕
                    </span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              Save Entry
            </button>
            <button 
              type="button" 
              className="btn btn-danger" 
              style={{ flex: 1 }}
              onClick={handleClearLog}
            >
              Clear Day
            </button>
          </div>

        </form>
      </Modal>

      {/* Styled hovering animations */}
      <style>{`
        .calendar-cell:hover {
          background-color: var(--bg-tertiary) !important;
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
      `}</style>
      
    </div>
  );
};

export default CalendarView;
