import React, { useState, useEffect } from 'react';
import { useCATData } from '../context/CATDataContext';
import Card from '../components/Card';

function NotesView() {
  const { notes, addNote, updateNote, deleteNote } = useCATData();
  const [activeNote, setActiveNote] = useState(null);
  
  // Editor State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  // Whenever the active note changes, update the editor fields
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title || '');
      setContent(activeNote.content || '');
      setTags(activeNote.tags ? activeNote.tags.join(', ') : '');
    } else {
      setTitle('');
      setContent('');
      setTags('');
    }
  }, [activeNote]);

  const handleCreateNew = () => {
    setActiveNote(null);
    setTitle('');
    setContent('');
    setTags('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '');
    
    if (activeNote) {
      updateNote(activeNote._id, { title: title || 'Untitled Note', content, tags: tagsArray });
      // Update local state so it doesn't flicker
      setActiveNote({ ...activeNote, title: title || 'Untitled Note', content, tags: tagsArray });
    } else {
      // If it's a new note
      const newNoteTitle = title || 'Untitled Note';
      addNote(newNoteTitle, content, tagsArray);
      // We don't automatically set it as active because addNote is async and the DB generates the _id.
      // But the user can select it from the list.
      handleCreateNew(); 
    }
  };

  const handleDelete = () => {
    if (activeNote) {
      if (window.confirm('Are you sure you want to delete this note?')) {
        deleteNote(activeNote._id);
        handleCreateNew();
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: '20px' }}>
      
      {/* Left Sidebar: List of Notes */}
      <Card style={{ 
        width: '30%', 
        minWidth: '250px', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '16px',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Your Notes</h2>
          <button 
            onClick={handleCreateNew}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            + New
          </button>
        </div>

        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          paddingRight: '4px'
        }}>
          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0', fontSize: '0.9rem' }}>
              No notes yet. Create one!
            </div>
          ) : (
            notes.map(note => {
              const isActive = activeNote && activeNote._id === note._id;
              return (
                <div 
                  key={note._id}
                  onClick={() => setActiveNote(note)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                    border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <h4 style={{ 
                    fontSize: '1rem', 
                    fontWeight: 600, 
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {note.title || 'Untitled Note'}
                  </h4>
                  <p style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {note.content || 'No content...'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Right Side: Note Editor */}
      <Card style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '24px',
        overflow: 'hidden'
      }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                color: 'var(--text-primary)',
                padding: '0'
              }}
            />
            {activeNote && (
              <button 
                type="button" 
                onClick={handleDelete}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--danger)', 
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Delete Note"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            )}
          </div>

          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your note here..."
            style={{
              flex: 1,
              resize: 'none',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '1rem',
              lineHeight: '1.6',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              padding: '0'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <input 
                type="text" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma separated)"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  width: '100%'
                }}
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 24px' }}>
              {activeNote ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
          
        </form>
      </Card>
    </div>
  );
}

export default NotesView;
