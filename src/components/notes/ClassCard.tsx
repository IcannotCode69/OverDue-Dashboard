import React, { useState } from 'react';
import { Class } from '../../features/notes/types';

interface ClassCardProps {
  classItem: Class;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}

// Convert Tailwind-style gradient to CSS
const getGradientStyle = (colorClass: string): string => {
  const gradients: Record<string, string> = {
    'from-blue-500 to-blue-600': 'linear-gradient(135deg, #3b82f6, #2563eb)',
    'from-purple-500 to-purple-600': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'from-pink-500 to-pink-600': 'linear-gradient(135deg, #ec4899, #db2777)',
    'from-green-500 to-green-600': 'linear-gradient(135deg, #10b981, #059669)',
    'from-orange-500 to-orange-600': 'linear-gradient(135deg, #f97316, #ea580c)'
  };
  return gradients[colorClass] || gradients['from-blue-500 to-blue-600'];
};

export default function ClassCard({ classItem, isSelected, onClick, onDelete, onRename }: ClassCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(classItem.name);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== classItem.name) {
      onRename(newName.trim());
    }
    setIsRenaming(false);
    setNewName(classItem.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(classItem.name);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--r-2xl)',
        border: isSelected ? '1px solid var(--acc-1)' : '1px solid var(--stroke-outer)',
        background: isSelected ? 
          'linear-gradient(180deg, rgba(74,168,255,0.1), rgba(74,168,255,0.05))' : 
          'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--stroke-inner)';
          e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--stroke-outer)';
          e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))';
        }
      }}
    >
      {/* Gradient header */}
      <div
        style={{
          height: '40px',
          background: getGradientStyle(classItem.color),
          margin: 'var(--space-2)',
          marginBottom: 'var(--space-3)',
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: '600',
          color: 'white',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}
      >
        {classItem.name.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div style={{ padding: '0 var(--space-3) var(--space-3)' }}>
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              width: '100%',
              background: 'var(--bg-2)',
              border: '1px solid var(--stroke-inner)',
              borderRadius: 'var(--r-sm)',
              padding: 'var(--space-2)',
              color: 'var(--ink-0)',
              fontSize: 'var(--h3)',
              fontWeight: '500',
              fontFamily: 'var(--font-sans)',
              outline: 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--h3)',
                  fontWeight: '500',
                  color: 'var(--ink-0)',
                  marginBottom: 'var(--space-1)',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                {classItem.name}
              </div>
              <div
                style={{
                  fontSize: 'var(--body)',
                  color: 'var(--ink-2)',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                {classItem.chapters.length} ch.
              </div>
            </div>

            {/* Kebab menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuPosition({
                    x: rect.left - 130, // Menu width (120px) + margin (10px)
                    y: rect.top
                  });
                  setShowMenu(!showMenu);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink-2)',
                  cursor: 'pointer',
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--r-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
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
                <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'currentColor' }} />
                <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'currentColor' }} />
                <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'currentColor' }} />
              </button>

              {showMenu && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 10
                    }}
                    onClick={() => setShowMenu(false)}
                  />
                  <div
                    style={{
                      position: 'fixed',
                      left: `${menuPosition.x}px`,
                      top: `${menuPosition.y}px`,
                      background: 'var(--bg-2)',
                      border: '1px solid var(--stroke-inner)',
                      borderRadius: 'var(--r-md)',
                      padding: 'var(--space-2)',
                      minWidth: '120px',
                      zIndex: 1000,
                      backdropFilter: 'blur(var(--blur))',
                      boxShadow: 'var(--shadow-1)'
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRenaming(true);
                        setShowMenu(false);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--ink-1)',
                        cursor: 'pointer',
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--r-sm)',
                        fontSize: 'var(--body)',
                        fontFamily: 'var(--font-sans)',
                        textAlign: 'left',
                        marginBottom: 'var(--space-1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      Rename
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                        setShowMenu(false);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--acc-red)',
                        cursor: 'pointer',
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--r-sm)',
                        fontSize: 'var(--body)',
                        fontFamily: 'var(--font-sans)',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,93,122,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}