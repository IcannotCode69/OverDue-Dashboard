import React, { useState } from 'react';
import { Class, Chapter } from '../../features/notes/types';

interface ChapterListProps {
  classItem: Class;
  selectedChapter: Chapter | null;
  onSelectChapter: (chapter: Chapter) => void;
  onAddChapter: (name: string) => void;
  onDeleteChapter: (id: string) => void;
  onRenameChapter: (id: string, newName: string) => void;
}

export default function ChapterList({ 
  classItem, 
  selectedChapter, 
  onSelectChapter, 
  onAddChapter, 
  onDeleteChapter, 
  onRenameChapter 
}: ChapterListProps) {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleAddChapter = () => {
    if (newChapterName.trim()) {
      onAddChapter(newChapterName.trim());
      setNewChapterName('');
      setShowAddInput(false);
    }
  };

  const handleRename = (id: string) => {
    if (renameValue.trim() && renameValue.trim() !== classItem.chapters.find(ch => ch.id === id)?.name) {
      onRenameChapter(id, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const startRename = (chapter: Chapter) => {
    setRenamingId(chapter.id);
    setRenameValue(chapter.name);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        border: '1px solid var(--stroke-outer)',
        borderRadius: 'var(--r-2xl)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--stroke-outer)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            fontSize: 'var(--h2)',
            fontWeight: '600',
            color: 'var(--ink-0)',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Chapters
        </div>
        <button
          onClick={() => setShowAddInput(true)}
          style={{
            background: 'var(--acc-1)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: 'var(--space-2)',
            borderRadius: 'var(--r-md)',
            fontSize: '18px',
            fontWeight: 'bold',
            lineHeight: '1',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
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
          +
        </button>
      </div>

      {/* Add chapter input */}
      {showAddInput && (
        <div style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--stroke-outer)' }}>
          <input
            type="text"
            placeholder="Chapter name..."
            value={newChapterName}
            onChange={(e) => setNewChapterName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddChapter();
              } else if (e.key === 'Escape') {
                setShowAddInput(false);
                setNewChapterName('');
              }
            }}
            onBlur={() => {
              if (!newChapterName.trim()) {
                setShowAddInput(false);
              }
            }}
            autoFocus
            style={{
              width: '100%',
              background: 'var(--bg-2)',
              border: '1px solid var(--stroke-inner)',
              borderRadius: 'var(--r-sm)',
              padding: 'var(--space-3)',
              color: 'var(--ink-0)',
              fontSize: 'var(--body)',
              fontFamily: 'var(--font-sans)',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Chapters list */}
      <div 
        className="nice-scroll"
        style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: 'var(--space-2) 0'
        }}
      >
        {classItem.chapters.map((chapter, index) => (
          <div key={chapter.id}>
            {renamingId === chapter.id ? (
              <div style={{ padding: '0 var(--space-3) var(--space-2)' }}>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename(chapter.id);
                    } else if (e.key === 'Escape') {
                      setRenamingId(null);
                      setRenameValue('');
                    }
                  }}
                  onBlur={() => handleRename(chapter.id)}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--stroke-inner)',
                    borderRadius: 'var(--r-sm)',
                    padding: 'var(--space-2)',
                    color: 'var(--ink-0)',
                    fontSize: 'var(--body)',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none'
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-3)',
                  marginBottom: index < classItem.chapters.length - 1 ? '2px' : 0,
                  cursor: 'pointer',
                  background: selectedChapter?.id === chapter.id ? 
                    'linear-gradient(90deg, var(--acc-1), transparent)' : 
                    'transparent',
                  borderLeft: selectedChapter?.id === chapter.id ? 
                    '3px solid var(--acc-1)' : 
                    '3px solid transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onClick={() => onSelectChapter(chapter)}
                onMouseEnter={(e) => {
                  if (selectedChapter?.id !== chapter.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedChapter?.id !== chapter.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--body)',
                    color: selectedChapter?.id === chapter.id ? 'var(--ink-0)' : 'var(--ink-1)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: selectedChapter?.id === chapter.id ? '500' : '400',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {chapter.name}
                </div>

                {/* Chapter menu */}
                <div 
                  style={{ 
                    display: 'flex', 
                    gap: 'var(--space-1)',
                    opacity: 0.7,
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(chapter);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--ink-2)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: 'var(--r-sm)',
                      fontSize: '12px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.color = 'var(--ink-0)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--ink-2)';
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete chapter "${chapter.name}"?`)) {
                        onDeleteChapter(chapter.id);
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--ink-2)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: 'var(--r-sm)',
                      fontSize: '12px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,93,122,0.1)';
                      e.currentTarget.style.color = 'var(--acc-red)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--ink-2)';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {classItem.chapters.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-6)',
              color: 'var(--ink-2)',
              fontSize: 'var(--body)',
              fontFamily: 'var(--font-sans)'
            }}
          >
            No chapters yet. Click + to add one.
          </div>
        )}
      </div>
    </div>
  );
}