import React, { useState, useEffect, useCallback } from 'react';
import { Class, Chapter } from '../features/notes/types';
import { getNotes, setNotes, seedIfEmpty, createClass, createChapter } from '../features/notes/store';
import ClassCard from '../components/notes/ClassCard';
import ChapterList from '../components/notes/ChapterList';
import NoteEditor from '../components/notes/NoteEditor';
import AIAssistant from '../components/notes/AIAssistant';

export default function NotesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  // Initialize data
  useEffect(() => {
    seedIfEmpty();
    const storedClasses = getNotes();
    setClasses(storedClasses);
  }, []);

  // Persist classes whenever they change
  const saveClasses = useCallback((updatedClasses: Class[]) => {
    setClasses(updatedClasses);
    setNotes(updatedClasses);
  }, []);

  // Update selected class when classes change
  useEffect(() => {
    if (selectedClass) {
      const updatedClass = classes.find(c => c.id === selectedClass.id);
      setSelectedClass(updatedClass || null);
    }
  }, [classes, selectedClass]);

  // Update selected chapter when selected class changes
  useEffect(() => {
    if (selectedChapter && selectedClass) {
      const updatedChapter = selectedClass.chapters.find(ch => ch.id === selectedChapter.id);
      setSelectedChapter(updatedChapter || null);
    }
  }, [selectedClass, selectedChapter]);

  // Handlers
  const handleAddClass = () => {
    if (newClassName.trim()) {
      const newClass = createClass(newClassName.trim());
      const updatedClasses = [...classes, newClass];
      saveClasses(updatedClasses);
      setSelectedClass(newClass);
      setSelectedChapter(null);
      setNewClassName('');
      setIsAddClassOpen(false);
    }
  };

  const handleDeleteClass = (classId: string) => {
    if (confirm('Delete this class and all its chapters?')) {
      const updatedClasses = classes.filter(c => c.id !== classId);
      saveClasses(updatedClasses);
      
      if (selectedClass?.id === classId) {
        setSelectedClass(null);
        setSelectedChapter(null);
      }
    }
  };

  const handleRenameClass = (classId: string, newName: string) => {
    const updatedClasses = classes.map(c => 
      c.id === classId ? { ...c, name: newName } : c
    );
    saveClasses(updatedClasses);
  };

  const handleAddChapter = (classId: string, chapterName: string) => {
    const newChapter = createChapter(chapterName);
    const updatedClasses = classes.map(c => 
      c.id === classId 
        ? { ...c, chapters: [...c.chapters, newChapter] }
        : c
    );
    saveClasses(updatedClasses);
  };

  const handleDeleteChapter = (classId: string, chapterId: string) => {
    const updatedClasses = classes.map(c => 
      c.id === classId 
        ? { ...c, chapters: c.chapters.filter(ch => ch.id !== chapterId) }
        : c
    );
    saveClasses(updatedClasses);
    
    if (selectedChapter?.id === chapterId) {
      setSelectedChapter(null);
    }
  };

  const handleRenameChapter = (classId: string, chapterId: string, newName: string) => {
    const updatedClasses = classes.map(c => 
      c.id === classId 
        ? {
            ...c, 
            chapters: c.chapters.map(ch => 
              ch.id === chapterId ? { ...ch, name: newName } : ch
            )
          }
        : c
    );
    saveClasses(updatedClasses);
  };

  const handleUpdateNote = (classId: string, chapterId: string, content: string) => {
    const updatedClasses = classes.map(c => 
      c.id === classId 
        ? {
            ...c,
            chapters: c.chapters.map(ch => 
              ch.id === chapterId 
                ? {
                    ...ch,
                    note: {
                      ...ch.note,
                      content,
                      updatedAt: new Date().toISOString()
                    }
                  }
                : ch
            )
          }
        : c
    );
    saveClasses(updatedClasses);
  };

  return (
    <div
      style={{
        padding: 'var(--space-5)',
        minHeight: '100vh',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)'
        }}
      >
        <h1
          style={{
            fontSize: 'var(--h1)',
            fontWeight: '700',
            color: 'var(--ink-0)',
            margin: 0
          }}
        >
          Notes
        </h1>
        
        <button
          onClick={() => setIsAddClassOpen(true)}
          style={{
            background: 'var(--acc-1)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--r-md)',
            fontSize: 'var(--body)',
            fontFamily: 'var(--font-sans)',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3b96e8';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(74,168,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--acc-1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>+</span>
          Add Class
        </button>
      </div>

      {/* Main layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 280px 1fr',
          gap: 'var(--space-5)',
          height: 'calc(100vh - 200px)',
          minHeight: '600px'
        }}
      >
        {/* Left column: Classes */}
        <div
          className="nice-scroll"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            overflowY: 'auto',
            paddingRight: 'var(--space-2)'
          }}
        >
          {classes.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-6)',
                color: 'var(--ink-2)',
                fontSize: 'var(--body)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: '1px solid var(--stroke-outer)',
                borderRadius: 'var(--r-2xl)'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>📚</div>
              <div>No classes yet. Click \"Add Class\" to get started.</div>
            </div>
          ) : (
            classes.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                isSelected={selectedClass?.id === classItem.id}
                onClick={() => {
                  setSelectedClass(classItem);
                  setSelectedChapter(null);
                }}
                onDelete={() => handleDeleteClass(classItem.id)}
                onRename={(newName) => handleRenameClass(classItem.id, newName)}
              />
            ))
          )}
        </div>

        {/* Middle column: Chapters */}
        <div>
          {selectedClass ? (
            <ChapterList
              classItem={selectedClass}
              selectedChapter={selectedChapter}
              onSelectChapter={setSelectedChapter}
              onAddChapter={(name) => handleAddChapter(selectedClass.id, name)}
              onDeleteChapter={(chapterId) => handleDeleteChapter(selectedClass.id, chapterId)}
              onRenameChapter={(chapterId, name) => handleRenameChapter(selectedClass.id, chapterId, name)}
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: '1px solid var(--stroke-outer)',
                borderRadius: 'var(--r-2xl)',
                color: 'var(--ink-2)',
                fontSize: 'var(--body)',
                textAlign: 'center',
                padding: 'var(--space-6)'
              }}
            >
              <div>
                <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>📖</div>
                <div>Select a class to view its chapters</div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Editor */}
        <div>
          {selectedChapter ? (
            <NoteEditor
              chapter={selectedChapter}
              onUpdateNote={(content) => 
                handleUpdateNote(selectedClass!.id, selectedChapter.id, content)
              }
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                border: '1px solid var(--stroke-outer)',
                borderRadius: 'var(--r-2xl)',
                color: 'var(--ink-2)',
                fontSize: 'var(--body)',
                textAlign: 'center',
                padding: 'var(--space-6)'
              }}
            >
              <div>
                <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>✏️</div>
                <div>Select a chapter to start writing</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating AI button */}
      {selectedChapter && (
        <button
          onClick={() => setIsAIOpen(true)}
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            right: 'var(--space-6)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--acc-2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(136,85,255,0.4)',
            transition: 'all 0.2s ease',
            zIndex: 100
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(136,85,255,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(136,85,255,0.4)';
          }}
        >
          🤖
        </button>
      )}

      {/* Add Class Dialog */}
      {isAddClassOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => {
              setIsAddClassOpen(false);
              setNewClassName('');
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--bg-1)',
              border: '1px solid var(--stroke-inner)',
              borderRadius: 'var(--r-2xl)',
              padding: 'var(--space-6)',
              minWidth: '400px',
              zIndex: 1001,
              boxShadow: 'var(--shadow-2)'
            }}
          >
            <h3
              style={{
                fontSize: 'var(--h2)',
                fontWeight: '600',
                color: 'var(--ink-0)',
                marginBottom: 'var(--space-4)',
                marginTop: 0
              }}
            >
              Add New Class
            </h3>
            
            <input
              type="text"
              placeholder="Class name..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddClass();
                } else if (e.key === 'Escape') {
                  setIsAddClassOpen(false);
                  setNewClassName('');
                }
              }}
              autoFocus
              style={{
                width: '100%',
                background: 'var(--bg-2)',
                border: '1px solid var(--stroke-inner)',
                borderRadius: 'var(--r-md)',
                padding: 'var(--space-3)',
                color: 'var(--ink-0)',
                fontSize: 'var(--body)',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                marginBottom: 'var(--space-4)'
              }}
            />

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsAddClassOpen(false);
                  setNewClassName('');
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--stroke-inner)',
                  color: 'var(--ink-2)',
                  cursor: 'pointer',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--body)',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'var(--ink-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--ink-2)';
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleAddClass}
                disabled={!newClassName.trim()}
                style={{
                  background: newClassName.trim() ? 'var(--acc-1)' : 'var(--ink-2)',
                  border: 'none',
                  color: 'white',
                  cursor: newClassName.trim() ? 'pointer' : 'not-allowed',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--r-md)',
                  fontSize: 'var(--body)',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (newClassName.trim()) {
                    e.currentTarget.style.background = '#3b96e8';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(74,168,255,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newClassName.trim()) {
                    e.currentTarget.style.background = 'var(--acc-1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                Create
              </button>
            </div>
          </div>
        </>
      )}

      {/* AI Assistant */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        noteContent={selectedChapter?.note.content || ''}
      />
    </div>
  );
}