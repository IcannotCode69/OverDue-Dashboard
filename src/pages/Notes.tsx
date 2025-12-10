import React, { useState, useEffect, useCallback } from "react";
import { Class, Chapter } from "../features/notes/types";
import { getNotes, setNotes, seedIfEmpty, createClass, createChapter } from "../features/notes/store";
import ClassCard from "../components/notes/ClassCard";
import ChapterList from "../components/notes/ChapterList";
import NoteEditor from "../components/notes/NoteEditor";
import AIAssistant from "../components/notes/AIAssistant";

type NotesEmptyStateProps = {
  title: string;
  body?: string;
};

const NotesEmptyState: React.FC<NotesEmptyStateProps> = ({ title, body }) => {
  return (
    <div className="notes-panel-empty">
      <div className="notes-empty-title">{title}</div>
      {body && <div className="notes-empty-body">{body}</div>}
    </div>
  );
};

export default function NotesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

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
      const updatedClass = classes.find((c) => c.id === selectedClass.id);
      setSelectedClass(updatedClass || null);
    }
  }, [classes, selectedClass]);

  // Update selected chapter when selected class changes
  useEffect(() => {
    if (selectedChapter && selectedClass) {
      const updatedChapter = selectedClass.chapters.find((ch) => ch.id === selectedChapter.id);
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
      setNewClassName("");
      setIsAddClassOpen(false);
    }
  };

  const handleDeleteClass = (classId: string) => {
    if (confirm("Delete this class and all its chapters?")) {
      const updatedClasses = classes.filter((c) => c.id !== classId);
      saveClasses(updatedClasses);

      if (selectedClass?.id === classId) {
        setSelectedClass(null);
        setSelectedChapter(null);
      }
    }
  };

  const handleRenameClass = (classId: string, newName: string) => {
    const updatedClasses = classes.map((c) => (c.id === classId ? { ...c, name: newName } : c));
    saveClasses(updatedClasses);
  };

  const handleAddChapter = (classId: string, chapterName: string) => {
    const newChapter = createChapter(chapterName);
    const updatedClasses = classes.map((c) =>
      c.id === classId ? { ...c, chapters: [...c.chapters, newChapter] } : c
    );
    saveClasses(updatedClasses);
  };

  const handleDeleteChapter = (classId: string, chapterId: string) => {
    const updatedClasses = classes.map((c) =>
      c.id === classId ? { ...c, chapters: c.chapters.filter((ch) => ch.id !== chapterId) } : c
    );
    saveClasses(updatedClasses);

    if (selectedChapter?.id === chapterId) {
      setSelectedChapter(null);
    }
  };

  const handleRenameChapter = (classId: string, chapterId: string, newName: string) => {
    const updatedClasses = classes.map((c) =>
      c.id === classId
        ? {
            ...c,
            chapters: c.chapters.map((ch) => (ch.id === chapterId ? { ...ch, name: newName } : ch)),
          }
        : c
    );
    saveClasses(updatedClasses);
  };

  const handleUpdateNote = (classId: string, chapterId: string, content: string) => {
    const updatedClasses = classes.map((c) =>
      c.id === classId
        ? {
            ...c,
            chapters: c.chapters.map((ch) =>
              ch.id === chapterId
                ? {
                    ...ch,
                    note: {
                      ...ch.note,
                      content,
                      updatedAt: new Date().toISOString(),
                    },
                  }
                : ch
            ),
          }
        : c
    );
    saveClasses(updatedClasses);
  };

  const derivedClassTitle =
    (selectedClass as (Class & { title?: string }) | null)?.title ||
    selectedClass?.name ||
    "";
  const derivedChapterTitle =
    (selectedChapter as (Chapter & { title?: string }) | null)?.title ||
    selectedChapter?.name ||
    "";
  const derivedNoteTitle =
    (selectedChapter?.note as { title?: string } | undefined)?.title ||
    selectedChapter?.name ||
    "";

  const layoutClassName = [
    "notes-layout",
    isLeftCollapsed ? "notes-layout--left-collapsed" : "",
    isRightCollapsed ? "notes-layout--right-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="notes-page">
      <div className="page-actions-row page-actions-row--end">
        <button className="app-button-primary" onClick={() => setIsAddClassOpen(true)}>
          + Add Class
        </button>
      </div>

      {/* Main layout */}
      <div className={layoutClassName}>
        {/* LEFT PANEL - Sources (Classes + Chapters) */}
        <section className="notes-panel notes-panel--left app-card">
          <header className="notes-panel__header">
            <div className="notes-panel__title-group">
              <h2 className="notes-panel__title">Sources</h2>
              <p className="notes-panel__subtitle">
                Classes and chapters you&apos;re taking notes for.
              </p>
            </div>
            <div className="notes-panel__header-actions">
              <button
                type="button"
                className="notes-icon-button"
                onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                aria-label={
                  isLeftCollapsed ? "Expand sources panel" : "Collapse sources panel"
                }
              >
                {isLeftCollapsed ? "›" : "‹"}
              </button>
            </div>
          </header>

          {isLeftCollapsed ? (
            <div className="notes-panel__preview">
              {selectedClass ? (
                <>
                  <div className="notes-panel__preview-label">Class</div>
                  <div className="notes-panel__preview-main">
                    {selectedClass.name}
                  </div>
                  {selectedChapter && (
                    <>
                      <div className="notes-panel__preview-label">Chapter</div>
                      <div className="notes-panel__preview-secondary">
                        {selectedChapter.name}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="notes-panel__preview-empty">
                  No class selected
                </div>
              )}
            </div>
          ) : (
            <div className="notes-panel__body notes-panel__body--grid">
              {/* LEFT SUB-COLUMN: Classes */}
              <div className="notes-panel__column notes-panel__column--classes">
                <div
                  className="nice-scroll notes-column-scroll"
                  style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
                >
                  {classes.length === 0 ? (
                    <NotesEmptyState
                      title="No classes yet"
                      body="Click “Add Class” to start organizing your notes."
                    />
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
              </div>

              {/* RIGHT SUB-COLUMN: Chapters */}
              <div className="notes-panel__column notes-panel__column--chapters">
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
                  <NotesEmptyState
                    title="Select a class"
                    body="Choose a class on the left to view its chapters."
                  />
                )}
              </div>
            </div>
          )}
        </section>

        {/* CENTER PANEL – Note editor */}
        <section className="notes-panel notes-panel--center app-card app-card--flush">
          <header className="notes-panel__header notes-panel__header--compact">
            <div className="notes-panel__title-group">
              <h2 className="notes-panel__title">
                {derivedNoteTitle || "Note"}
              </h2>
              <p className="notes-panel__subtitle">
                {selectedChapter
                  ? `Last updated: ${new Date(
                      selectedChapter.note.updatedAt
                    ).toLocaleString()}`
                  : "Select a chapter to start writing."}
              </p>
            </div>
          </header>

          <div className="notes-panel__body">
            {selectedChapter ? (
              <NoteEditor
                chapter={selectedChapter}
                onUpdateNote={(content) =>
                  handleUpdateNote(selectedClass!.id, selectedChapter.id, content)
                }
              />
            ) : (
              <NotesEmptyState
                title="No chapter selected"
                body="Select or create a chapter to begin taking notes."
              />
            )}
          </div>
        </section>

        {/* RIGHT PANEL – Notes AI */}
        <section className="notes-panel notes-panel--right app-card">
          <header className="notes-panel__header">
            <div className="notes-panel__title-group">
              <h2 className="notes-panel__title">Notes AI</h2>
              <p className="notes-panel__subtitle">
                Chat with your notes, side by side.
              </p>
            </div>
            <div className="notes-panel__header-actions">
              <button
                type="button"
                className="notes-icon-button"
                onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                aria-label={
                  isRightCollapsed ? "Expand AI panel" : "Collapse AI panel"
                }
              >
                {isRightCollapsed ? "‹" : "›"}
              </button>
            </div>
          </header>

          {isRightCollapsed ? (
            <div className="notes-panel__preview">
              {selectedChapter ? (
                <>
                  <div className="notes-panel__preview-label">Chat about</div>
                  <div className="notes-panel__preview-main">
                    {derivedNoteTitle || selectedChapter.name}
                  </div>
                </>
              ) : (
                <div className="notes-panel__preview-empty">
                  Select a chapter to use Notes AI
                </div>
              )}
            </div>
          ) : (
            <div className="notes-panel__body notes-panel__body--ai">
              {selectedChapter ? (
                <>
                  {!isAIOpen && (
                    <button
                      type="button"
                      className="app-button-primary"
                      onClick={() => setIsAIOpen(true)}
                    >
                      Open Notes AI for this chapter
                    </button>
                  )}
                  <div className="notes-panel__ai-container">
                    <AIAssistant
                      isOpen={isAIOpen}
                      onClose={() => setIsAIOpen(false)}
                      noteContent={selectedChapter.note.content}
                      noteTitle={derivedNoteTitle}
                      classTitle={derivedClassTitle}
                      chapterTitle={derivedChapterTitle}
                    />
                  </div>
                </>
              ) : (
                <NotesEmptyState
                  title="No chapter selected"
                  body="Select a chapter to start chatting with Notes AI."
                />
              )}
            </div>
          )}
        </section>
      </div>

      {/* Add Class Dialog */}
      {isAddClassOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1000,
              backdropFilter: "blur(4px)",
            }}
            onClick={() => {
              setIsAddClassOpen(false);
              setNewClassName("");
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--bg-1)",
              border: "1px solid var(--stroke-inner)",
              borderRadius: "var(--r-2xl)",
              padding: "var(--space-6)",
              minWidth: "400px",
              zIndex: 1001,
              boxShadow: "var(--shadow-2)",
            }}
          >
            <h3
              style={{
                fontSize: "var(--h2)",
                fontWeight: "600",
                color: "var(--ink-0)",
                marginBottom: "var(--space-4)",
                marginTop: 0,
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
                if (e.key === "Enter") {
                  handleAddClass();
                } else if (e.key === "Escape") {
                  setIsAddClassOpen(false);
                  setNewClassName("");
                }
              }}
              autoFocus
              style={{
                width: "100%",
                background: "var(--bg-2)",
                border: "1px solid var(--stroke-inner)",
                borderRadius: "var(--r-md)",
                padding: "var(--space-3)",
                color: "var(--ink-0)",
                fontSize: "var(--body)",
                fontFamily: "var(--font-sans)",
                outline: "none",
                marginBottom: "var(--space-4)",
              }}
            />

            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setIsAddClassOpen(false);
                  setNewClassName("");
                }}
                style={{
                  background: "transparent",
                  border: "1px solid var(--stroke-inner)",
                  color: "var(--ink-2)",
                  cursor: "pointer",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--r-md)",
                  fontSize: "var(--body)",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "var(--ink-1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--ink-2)";
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleAddClass}
                disabled={!newClassName.trim()}
                style={{
                  background: newClassName.trim() ? "var(--acc-1)" : "var(--ink-2)",
                  border: "none",
                  color: "white",
                  cursor: newClassName.trim() ? "pointer" : "not-allowed",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--r-md)",
                  fontSize: "var(--body)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (newClassName.trim()) {
                    e.currentTarget.style.background = "#3b96e8";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(74,168,255,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (newClassName.trim()) {
                    e.currentTarget.style.background = "var(--acc-1)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                Create
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
