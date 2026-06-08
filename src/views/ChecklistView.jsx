import React, { useState } from 'react';
import { useCATData } from '../context/CATDataContext';
import Card from '../components/Card';

const ChecklistView = () => {
  const { topics, updateTopicLevel, addTopic, deleteTopic } = useCATData();
  const [activeSection, setActiveSection] = useState('VARC');
  const [newTopicName, setNewTopicName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const sections = ['VARC', 'DILR', 'QA'];

  const filteredTopics = topics.filter(t => t.section === activeSection);

  // Status Colors Mapping
  const getPillClass = (level) => {
    switch (level) {
      case 'Mastered': return 'pill-mastered';
      case 'Advanced': return 'pill-advanced';
      case 'Intermediate': return 'pill-intermediate';
      case 'Basic': return 'pill-basic';
      default: return 'pill-not-started';
    }
  };

  const getPrepWeight = (level) => {
    switch (level) {
      case 'Mastered': return 1.0;
      case 'Advanced': return 0.75;
      case 'Intermediate': return 0.5;
      case 'Basic': return 0.25;
      default: return 0.0;
    }
  };

  const sectionTotal = filteredTopics.length;
  const sectionCompleted = filteredTopics.filter(t => t.level !== 'Not Started').length;
  const sectionWeight = filteredTopics.reduce((sum, t) => sum + getPrepWeight(t.level), 0);
  const sectionProgress = sectionTotal > 0 ? (sectionWeight / sectionTotal) * 100 : 0;

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    addTopic(activeSection, newTopicName.trim());
    setNewTopicName('');
    setShowAddForm(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header with Tab Switches */}
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
        <div style={{ display: 'flex', gap: '10px' }}>
          {sections.map(section => {
            const isActive = activeSection === section;
            return (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {section}
              </button>
            );
          })}
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Close Form' : 'Add Custom Topic'}
        </button>
      </div>

      {/* 2. Add Custom Topic Inline Form */}
      {showAddForm && (
        <Card title={`Add Topic to ${activeSection}`} className="animate-fade-in" style={{ padding: '20px' }}>
          <form onSubmit={handleAddTopic} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Topic Name</label>
              <input 
                type="text" 
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="e.g. Work and Time Advanced Questions"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '45px' }}>
              Create Topic
            </button>
          </form>
        </Card>
      )}

      {/* 3. Section Progress Info */}
      <div className="grid-cols-3">
        <Card style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Completed Topics</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>{sectionCompleted} / {sectionTotal}</span>
        </Card>
        
        <Card style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Overall Section Prep Weight</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{Math.round(sectionProgress)}%</span>
        </Card>

        <Card style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Mastery Status</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            <span className="pill pill-mastered" style={{ fontSize: '0.65rem' }}>
              Mastered: {filteredTopics.filter(t => t.level === 'Mastered').length}
            </span>
            <span className="pill pill-advanced" style={{ fontSize: '0.65rem' }}>
              Adv: {filteredTopics.filter(t => t.level === 'Advanced').length}
            </span>
          </div>
        </Card>
      </div>

      {/* 4. Topics Checklist Table */}
      <Card title={`${activeSection} Syllabus Checklist`} subtitle="Track topic completion & depth levels">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTopics.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
              No topics in this section. Add custom ones!
            </div>
          ) : (
            filteredTopics.map((topic, index) => (
              <div
                key={topic.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  gap: '16px',
                  flexWrap: 'wrap',
                  transition: 'var(--transition)'
                }}
              >
                {/* Topic info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                  <span style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: topic.level === 'Mastered' ? 'var(--success-light)' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--success)',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    {topic.level === 'Mastered' ? '✓' : ''}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {topic.name}
                    </h4>
                    {topic.custom && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Custom
                      </span>
                    )}
                  </div>
                </div>

                {/* Level selector and actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {/* Visual level pill */}
                  <span className={`pill ${getPillClass(topic.level)}`}>
                    {topic.level}
                  </span>

                  {/* Dropdown */}
                  <select
                    value={topic.level}
                    onChange={(e) => updateTopicLevel(topic.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      width: '150px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Basic">Basic Concepts</option>
                    <option value="Intermediate">Intermediate Prep</option>
                    <option value="Advanced">Advanced solving</option>
                    <option value="Mastered">Mastered / Mock-Ready</option>
                  </select>

                  {/* Custom Topic Delete Action */}
                  {topic.custom && (
                    <button 
                      onClick={() => deleteTopic(topic.id)} 
                      className="btn-icon-only"
                      style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 'bold' }}
                      title="Delete Custom Topic"
                      aria-label={`Delete custom topic ${topic.name}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      
    </div>
  );
};

export default ChecklistView;
