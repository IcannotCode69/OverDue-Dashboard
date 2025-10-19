import React, { useState, useEffect } from 'react';
import { Chapter } from '../../features/notes/types';

interface NoteEditorProps {
  chapter: Chapter;
  onUpdateNote: (content: string) => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function NoteEditor({ chapter, onUpdateNote }: NoteEditorProps) {
  const [content, setContent] = useState(chapter.note.content);
  const debouncedContent = useDebounce(content, 500);

  // Update content when chapter changes
  useEffect(() => {
    setContent(chapter.note.content);
  }, [chapter.id, chapter.note.content]);

  // Handle debounced save
  useEffect(() => {
    if (debouncedContent !== chapter.note.content) {
      onUpdateNote(debouncedContent);
    }
  }, [debouncedContent, chapter.note.content, onUpdateNote]);


  const formatTimestamp = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Title bar */}
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
        <div>
          <div
            style={{
              fontSize: 'var(--h2)',
              fontWeight: '600',
              color: 'var(--ink-0)',
              fontFamily: 'var(--font-sans)',
              marginBottom: 'var(--space-1)'
            }}
          >
            {chapter.name}
          </div>
          <div
            style={{
              fontSize: 'var(--body)',
              color: 'var(--ink-2)',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Last updated: {formatTimestamp(chapter.note.updatedAt)}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your notes..."
          style={{
            flex: 1,
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-0)',
            fontSize: 'var(--body)',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "Courier New", monospace',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            padding: 0,
            overflow: 'auto'
          }}
          className="nice-scroll"
        />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderTop: '1px solid var(--stroke-outer)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
          fontSize: 'var(--body)',
          color: 'var(--ink-2)',
          fontFamily: 'var(--font-sans)'
        }}
      >
        <div>
          {content.split('\n').length} lines • {content.length} characters
        </div>
        <div>
          {content !== chapter.note.content ? 'Saving...' : 'Saved'}
        </div>
      </div>

    </div>
  );
}