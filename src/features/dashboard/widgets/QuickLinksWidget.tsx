import * as React from "react";
import WidgetFrame from "../WidgetFrame";
import "./quick-links-widget.css";

type QuickLink = {
  id: string;
  label: string;
  url: string;
};

const STORAGE_KEY = "od:quickLinks:v1";

interface QuickLinksWidgetProps {
  onRemove?: () => void;
}

function safeParseLinks(raw: string | null): QuickLink[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => ({
          id: String(item.id ?? ""),
          label: String(item.label ?? "").trim(),
          url: String(item.url ?? "").trim(),
        }))
        .filter((item) => item.label && item.url);
    }
  } catch {
    // ignore
  }
  return [];
}

function getFaviconUrl(url: string): string | null {
  try {
    const u = new URL(url);
    return `${u.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function getInitial(label: string, url: string): string {
  if (label && label.trim().length > 0) {
    return label.trim().charAt(0).toUpperCase();
  }
  try {
    const u = new URL(url);
    return (u.hostname[0] || "?").toUpperCase();
  } catch {
    return "?";
  }
}

export default function QuickLinksWidget({ onRemove }: QuickLinksWidgetProps) {
  const [links, setLinks] = React.useState<QuickLink[]>([]);
  const [isManaging, setIsManaging] = React.useState(false);
  const [labelInput, setLabelInput] = React.useState("");
  const [urlInput, setUrlInput] = React.useState("");

  // Load saved shortcuts
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setLinks(safeParseLinks(raw));
    } catch {
      // ignore
    }
  }, []);

  // Persist whenever links change
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {
      // ignore
    }
  }, [links]);

  const openLink = (url: string) => {
    if (!url) return;
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }
  };

  const resetForm = () => {
    setLabelInput("");
    setUrlInput("");
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    const label = labelInput.trim();
    let url = urlInput.trim();

    if (!label || !url) return;

    // Basic auto-prefix for convenience
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const newLink: QuickLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label,
      url,
    };

    setLinks((prev) => [newLink, ...prev]);
    resetForm();
  };

  const handleRemoveLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const manageButton = (
    <button
      type="button"
      className="quick-links-manage-btn react-grid-no-drag"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsManaging(true);
      }}
      aria-label="Manage shortcuts"
      title="Manage shortcuts"
    >
      ⚙
    </button>
  );

  return (
    <WidgetFrame
      title="Study sites"
      onRemove={onRemove}
      className="quick-links-widget"
      rightActions={manageButton}
    >
      <div className="quick-links-body">
        <div className="quick-links-grid">
          {links.length === 0 && (
            <div className="dashboard-widget-empty">
              No shortcuts yet. Use the ⚙ icon to add your homework sites.
            </div>
          )}

          {links.map((link) => {
            const favicon = getFaviconUrl(link.url);
            const initial = getInitial(link.label, link.url);

            return (
              <div key={link.id} className="study-site-card-wrapper">
                <button
                  type="button"
                  className="quick-links-item react-grid-no-drag study-site-card"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openLink(link.url);
                  }}
                >
                  <div className="quick-links-icon">
                    <span className="quick-links-initial">{initial}</span>
                    {favicon && (
                      <img
                        src={favicon}
                        alt={link.label}
                        onError={(event) => {
                          const target = event.currentTarget as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  <div className="quick-links-label" title={link.label}>
                    {link.label}
                  </div>
                </button>

                <button
                  type="button"
                  className="study-site-delete react-grid-no-drag"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteLink(link.id);
                  }}
                  aria-label="Remove shortcut"
                  title="Remove shortcut"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {isManaging && (
          <div
            className="quick-links-overlay react-grid-no-drag"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="quick-links-overlay-inner">
              <div className="quick-links-overlay-header">
                <div>
                  <div className="quick-links-overlay-title">
                    Manage shortcuts
                  </div>
                  <div className="quick-links-overlay-subtitle">
                    Add the sites you use for homework, practice, or grades.
                  </div>
                </div>
                <button
                  type="button"
                  className="quick-links-overlay-close"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsManaging(false);
                  }}
                >
                  ✕
                </button>
              </div>

              <form
                className="quick-links-form"
                onSubmit={handleAddLink}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="quick-links-form-row">
                  <label className="quick-links-label-field">
                    Site name
                    <input
                      className="quick-links-input"
                      placeholder="e.g., Pearson, Zybooks"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                    />
                  </label>
                </div>
                <div className="quick-links-form-row">
                  <label className="quick-links-label-field">
                    URL
                    <input
                      className="quick-links-input"
                      placeholder="https://example.com"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                  </label>
                </div>
                <div className="quick-links-form-actions">
                  <button
                    type="button"
                    className="quick-links-secondary-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      resetForm();
                    }}
                  >
                    Clear
                  </button>
                  <button type="submit" className="quick-links-primary-btn">
                    Add shortcut
                  </button>
                </div>
              </form>

              <div
                className="quick-links-list"
                onClick={(e) => e.stopPropagation()}
              >
                {links.length === 0 && (
                  <div className="quick-links-list-empty">
                    You don&apos;t have any shortcuts yet.
                  </div>
                )}

                {links.map((link) => (
                  <div key={link.id} className="quick-links-list-row">
                    <div className="quick-links-list-main">
                      <div className="quick-links-list-label">
                        {link.label}
                      </div>
                      <div className="quick-links-list-url">{link.url}</div>
                    </div>
                    <button
                      type="button"
                      className="quick-links-delete-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveLink(link.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}
