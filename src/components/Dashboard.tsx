import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { SessionEditor } from "./SessionEditor";
import { Id } from "../../convex/_generated/dataModel";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const sessions = useQuery(api.sessions.list);
  const createSession = useMutation(api.sessions.create);
  const deleteSession = useMutation(api.sessions.remove);

  const [newSessionName, setNewSessionName] = useState("");
  const [activeSession, setActiveSession] = useState<Id<"castSessions"> | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    const id = await createSession({ name: newSessionName });
    setNewSessionName("");
    setShowCreateForm(false);
    setActiveSession(id);
  };

  const handleDelete = async (id: Id<"castSessions">) => {
    if (confirm("Delete this session?")) {
      await deleteSession({ id });
      if (activeSession === id) setActiveSession(null);
    }
  };

  if (activeSession) {
    return (
      <SessionEditor
        sessionId={activeSession}
        onBack={() => setActiveSession(null)}
      />
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-ambient"></div>

      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-mark">⚔</div>
            <div>
              <h1 className="header-title">WC3 Cast Overlay</h1>
              <p className="header-subtitle">Manage your casting sessions</p>
            </div>
          </div>
          <button onClick={() => signOut()} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="sessions-header">
          <h2 className="sessions-title">Cast Sessions</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="create-btn"
          >
            <span>+</span> New Session
          </button>
        </div>

        {showCreateForm && (
          <div className="create-form-overlay" onClick={() => setShowCreateForm(false)}>
            <form
              onSubmit={handleCreate}
              className="create-form"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="form-title">Create New Session</h3>
              <input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="e.g., WGL Finals - Happy vs Moon"
                className="session-name-input"
                autoFocus
              />
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Session
                </button>
              </div>
            </form>
          </div>
        )}

        {sessions === undefined ? (
          <div className="sessions-loading">
            <div className="loading-spinner"></div>
            <p>Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="sessions-empty">
            <div className="empty-icon">📺</div>
            <h3>No sessions yet</h3>
            <p>Create your first casting session to get started</p>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessions.map((session: { _id: Id<"castSessions">; name: string; isLive: boolean; createdAt: number }) => (
              <div key={session._id} className="session-card">
                <div className="session-card-header">
                  <div className={`session-status ${session.isLive ? 'live' : 'offline'}`}>
                    {session.isLive ? '● LIVE' : '○ Offline'}
                  </div>
                  <button
                    onClick={() => handleDelete(session._id)}
                    className="delete-btn"
                    title="Delete session"
                  >
                    ✕
                  </button>
                </div>
                <h3 className="session-name">{session.name}</h3>
                <p className="session-date">
                  Created {new Date(session.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => setActiveSession(session._id)}
                  className="edit-session-btn"
                >
                  Open Editor
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="app-footer dashboard-footer">
        Requested by @web-user · Built by @clonkbot
      </footer>
    </div>
  );
}
