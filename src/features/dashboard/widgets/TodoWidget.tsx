import React, { useEffect, useState, KeyboardEvent } from "react";
import WidgetFrame from "../WidgetFrame";
import "./todo-widget.css";
import { TODO_ADD_EVENT, AddTodoTaskDetail } from "./todoEvents";

export type TodoTask = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string | null;
};

const STORAGE_KEY = "od:todo:v1";

interface TodoWidgetProps {
  onRemove?: () => void;
}

function safeParseTasks(raw: string | null): TodoTask[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: String(item.id ?? ""),
        text: String(item.text ?? "").trim(),
        completed: Boolean(item.completed),
        createdAt: String(item.createdAt ?? new Date().toISOString()),
        completedAt:
          item.completedAt === null || item.completedAt === undefined
            ? null
            : String(item.completedAt),
      }))
      .filter((t) => t.text.length > 0);
  } catch {
    return [];
  }
}

const TodoWidget: React.FC<TodoWidgetProps> = ({ onRemove }) => {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  // load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setTasks(safeParseTasks(raw));
    } catch {
      // ignore
    }
  }, []);

  // persist to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Listen for external "add task" events (e.g., from SmartSuggestionsWidget)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const custom = event as CustomEvent;
      const detail = (custom.detail || {}) as AddTodoTaskDetail;
      const text = (detail.text || "").trim();
      if (!text) return;

      const now = new Date().toISOString();
      const newTask: TodoTask = {
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        completed: false,
        createdAt: now,
        completedAt: null,
      };

      setTasks((prev) => [...prev, newTask]);
    };

    window.addEventListener(TODO_ADD_EVENT, handler as EventListener);

    return () => {
      window.removeEventListener(TODO_ADD_EVENT, handler as EventListener);
    };
  }, []);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleAddTask = () => {
    const text = draft.trim();
    if (!text) return;

    const now = new Date().toISOString();
    const newTask: TodoTask = {
      id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      completed: false,
      createdAt: now,
      completedAt: null,
    };

    setTasks((prev) => [...prev, newTask]);
    setDraft("");
    setIsAdding(false);
  };

  const handleToggleTask = (id: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? now : null,
            }
          : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleDraftKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDraft("");
      setIsAdding(false);
    }
  };

  const addRow = isAdding ? (
    <div className="todo-add-row react-grid-no-drag">
      <button
        type="button"
        className="todo-checkbox todo-checkbox--inactive"
        aria-hidden="true"
        tabIndex={-1}
      />
      <input
        className="todo-input"
        autoFocus
        placeholder="Try typing 'Study SE final at 6pm'"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleDraftKeyDown}
        onBlur={() => {
          if (!draft.trim()) {
            setIsAdding(false);
          }
        }}
      />
    </div>
  ) : (
    <button
      type="button"
      className="todo-add-button react-grid-no-drag"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsAdding(true);
      }}
    >
      <span className="todo-add-plus">+</span>
      <span>Add a task</span>
    </button>
  );

  return (
    <WidgetFrame title="Tasks" onRemove={onRemove} className="todo-widget">
      <div className="todo-widget-body">
        <div className="todo-section-header">Today</div>

        <div className="todo-list">
          {activeTasks.length === 0 && completedTasks.length === 0 && (
            <div className="todo-empty">
              No tasks yet. Add something you want to get done today.
            </div>
          )}

          {activeTasks.map((task) => (
            <div key={task.id} className="todo-row react-grid-no-drag">
              <button
                type="button"
                className={
                  task.completed
                    ? "todo-checkbox todo-checkbox--completed"
                    : "todo-checkbox"
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleToggleTask(task.id);
                }}
                aria-label={
                  task.completed
                    ? "Mark task as not completed"
                    : "Mark task as completed"
                }
              >
                {task.completed && <span className="todo-checkmark">✓</span>}
              </button>

              <div className="todo-text-wrapper">
                <div
                  className={
                    task.completed
                      ? "todo-text todo-text--completed"
                      : "todo-text"
                  }
                >
                  {task.text}
                </div>
                <div className="todo-meta">Today</div>
              </div>

              <button
                type="button"
                className="todo-delete-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                aria-label="Delete task"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        {completedTasks.length > 0 && (
          <div className="todo-completed-section">
            <button
              type="button"
              className="todo-completed-header react-grid-no-drag"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCompleted((prev) => !prev);
              }}
            >
              <span className="todo-completed-toggle">
                {showCompleted ? "▾" : "▸"}
              </span>
              <span className="todo-completed-label">
                Completed {completedTasks.length}
              </span>
            </button>

            {showCompleted && (
              <div className="todo-completed-list">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="todo-row todo-row--completed react-grid-no-drag"
                  >
                    <button
                      type="button"
                      className="todo-checkbox todo-checkbox--completed"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleTask(task.id);
                      }}
                      aria-label="Mark task as not completed"
                    >
                      <span className="todo-checkmark">✓</span>
                    </button>

                    <div className="todo-text-wrapper">
                      <div className="todo-text todo-text--completed">
                        {task.text}
                      </div>
                      <div className="todo-meta">Completed</div>
                    </div>

                    <button
                      type="button"
                      className="todo-delete-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      aria-label="Delete task"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {addRow}
      </div>
    </WidgetFrame>
  );
};

export default TodoWidget;
