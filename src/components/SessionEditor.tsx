import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { PlayerCard } from "./PlayerCard";
import { OverlayPreview } from "./OverlayPreview";

const RACES = ["Human", "Orc", "Undead", "Night Elf", "Random"];
const THEMES = [
  { id: "neutral", name: "Neutral", color: "#c9a227" },
  { id: "alliance", name: "Alliance", color: "#1e90ff" },
  { id: "horde", name: "Horde", color: "#8b0000" },
  { id: "undead", name: "Undead", color: "#6b4c9a" },
];

interface Props {
  sessionId: Id<"castSessions">;
  onBack: () => void;
}

export function SessionEditor({ sessionId, onBack }: Props) {
  const session = useQuery(api.sessions.get, { id: sessionId });
  const players = useQuery(api.players.getBySession, { sessionId });
  const settings = useQuery(api.settings.getBySession, { sessionId });

  const updateSession = useMutation(api.sessions.update);
  const updatePlayer = useMutation(api.players.update);
  const incrementScore = useMutation(api.players.incrementScore);
  const decrementScore = useMutation(api.players.decrementScore);
  const resetScores = useMutation(api.players.resetScores);
  const swapPlayers = useMutation(api.players.swapPlayers);
  const updateSettings = useMutation(api.settings.update);

  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!session || !players || !settings) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  const player1 = players.find((p: { slot: number }) => p.slot === 1);
  const player2 = players.find((p: { slot: number }) => p.slot === 2);

  const overlayUrl = `${window.location.origin}?overlay=${sessionId}`;

  const copyOverlayUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="editor-container">
      <div className="editor-ambient"></div>

      <header className="editor-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <div className="header-center">
          <input
            type="text"
            value={session.name}
            onChange={(e) => updateSession({ id: sessionId, name: e.target.value })}
            className="session-title-input"
          />
          <div className={`live-indicator ${session.isLive ? 'live' : ''}`}>
            <button
              onClick={() => updateSession({ id: sessionId, isLive: !session.isLive })}
              className="live-toggle"
            >
              {session.isLive ? '● LIVE' : '○ GO LIVE'}
            </button>
          </div>
        </div>
        <button onClick={() => setShowPreview(!showPreview)} className="preview-toggle">
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </header>

      <div className="editor-content">
        <div className="editor-main">
          <section className="players-section">
            <div className="section-header">
              <h2>Players</h2>
              <div className="player-actions">
                <button onClick={() => swapPlayers({ sessionId })} className="action-btn">
                  ⇄ Swap
                </button>
                <button onClick={() => resetScores({ sessionId })} className="action-btn danger">
                  Reset Scores
                </button>
              </div>
            </div>

            <div className="players-grid">
              {player1 && (
                <PlayerCard
                  player={player1}
                  races={RACES}
                  onUpdate={(updates) => updatePlayer({ id: player1._id, ...updates })}
                  onIncrement={() => incrementScore({ id: player1._id })}
                  onDecrement={() => decrementScore({ id: player1._id })}
                  slot={1}
                />
              )}

              <div className="vs-divider">
                <span>VS</span>
              </div>

              {player2 && (
                <PlayerCard
                  player={player2}
                  races={RACES}
                  onUpdate={(updates) => updatePlayer({ id: player2._id, ...updates })}
                  onIncrement={() => incrementScore({ id: player2._id })}
                  onDecrement={() => decrementScore({ id: player2._id })}
                  slot={2}
                />
              )}
            </div>
          </section>

          <section className="settings-section">
            <h2>Overlay Settings</h2>

            <div className="settings-grid">
              <div className="setting-group">
                <h3>Display Options</h3>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.showScores}
                    onChange={(e) => updateSettings({ sessionId, showScores: e.target.checked })}
                  />
                  <span className="toggle-switch"></span>
                  Show Scores
                </label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.showRaces}
                    onChange={(e) => updateSettings({ sessionId, showRaces: e.target.checked })}
                  />
                  <span className="toggle-switch"></span>
                  Show Races
                </label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.showCountry}
                    onChange={(e) => updateSettings({ sessionId, showCountry: e.target.checked })}
                  />
                  <span className="toggle-switch"></span>
                  Show Country
                </label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.showTeam}
                    onChange={(e) => updateSettings({ sessionId, showTeam: e.target.checked })}
                  />
                  <span className="toggle-switch"></span>
                  Show Team
                </label>
              </div>

              <div className="setting-group">
                <h3>Theme</h3>
                <div className="theme-options">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateSettings({ sessionId, theme: theme.id, accentColor: theme.color })}
                      className={`theme-btn ${settings.theme === theme.id ? 'active' : ''}`}
                      style={{ '--theme-color': theme.color } as React.CSSProperties}
                    >
                      <span className="theme-dot"></span>
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="overlay-url-section">
            <h2>Overlay URL</h2>
            <p className="url-description">Add this as a Browser Source in OBS/Streamlabs</p>
            <div className="url-box">
              <input
                type="text"
                value={overlayUrl}
                readOnly
                className="url-input"
              />
              <button onClick={copyOverlayUrl} className="copy-btn">
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </section>
        </div>

        {showPreview && (
          <div className="preview-panel">
            <div className="preview-header">
              <h3>Live Preview</h3>
            </div>
            <div className="preview-frame">
              <OverlayPreview
                player1={player1}
                player2={player2}
                settings={settings}
              />
            </div>
          </div>
        )}
      </div>

      <footer className="app-footer editor-footer">
        Requested by @web-user · Built by @clonkbot
      </footer>
    </div>
  );
}
