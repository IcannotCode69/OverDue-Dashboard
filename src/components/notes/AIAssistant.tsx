import React, { useState, useEffect } from 'react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  noteContent: string;
}

export default function AIAssistant({ isOpen, onClose, noteContent }: AIAssistantProps) {
  const [inputText, setInputText] = useState('');

  // Pre-populate with note content when opened
  useEffect(() => {
    if (isOpen && noteContent) {
      setInputText(`Please help me with this note content:\n\n${noteContent}`);
    }
  }, [isOpen, noteContent]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
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
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '600px',
          height: '80vh',
          background: 'var(--bg-1)',
          border: '1px solid var(--stroke-inner)',
          borderRadius: 'var(--r-2xl)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-2)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--stroke-outer)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div
            style={{
              fontSize: 'var(--h2)',
              fontWeight: '600',
              color: 'var(--ink-0)',
              fontFamily: 'var(--font-sans)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}
          >
            <span>🤖</span>
            AI Assistant
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-2)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--r-md)',
              fontSize: '20px',
              lineHeight: '1',
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
            ×
          </button>
        </div>

        {/* Chat area placeholder */}
        <div
          style={{
            flex: 1,
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}
        >
          {/* Placeholder messages */}
          <div
            style={{
              background: 'rgba(136,85,255,0.1)',
              border: '1px solid rgba(136,85,255,0.2)',
              borderRadius: 'var(--r-lg)',
              padding: 'var(--space-4)',
              color: 'var(--ink-1)',
              fontSize: 'var(--body)',
              fontFamily: 'var(--font-sans)'
            }}
          >
            <div style={{ fontWeight: '500', marginBottom: 'var(--space-2)', color: 'var(--acc-2)' }}>
              🤖 AI Assistant
            </div>
            <div>
              Hi! I'm your AI assistant. I can help you with your notes, answer questions, 
              and provide explanations. Currently, I'm in demo mode - full AI integration 
              will be available soon.
            </div>
          </div>

          {/* Input area */}
          <div style={{ marginTop: 'auto' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me about your notes, or paste content for analysis..."
              style={{
                width: '100%',
                height: '120px',
                background: 'var(--bg-2)',
                border: '1px solid var(--stroke-inner)',
                borderRadius: 'var(--r-md)',
                padding: 'var(--space-3)',
                color: 'var(--ink-0)',
                fontSize: 'var(--body)',
                fontFamily: 'var(--font-sans)',
                resize: 'none',
                outline: 'none',
                marginBottom: 'var(--space-3)'
              }}
              className="nice-scroll"
            />

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setInputText('')}
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
                Clear
              </button>
              
              <button
                onClick={() => {
                  // Placeholder for AI submission
                  alert('AI integration coming soon! This would send your message to the AI model.');
                }}
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
                  transition: 'all 0.2s ease'
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
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}