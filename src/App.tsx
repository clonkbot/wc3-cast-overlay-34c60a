import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { OverlayView } from "./components/OverlayView";
import "./styles.css";

function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-ambient"></div>
      <div className="auth-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="rune-circle">
            <svg viewBox="0 0 100 100" className="rune-svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
              <path d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50" stroke="currentColor" strokeWidth="2"/>
              <path d="M26 26 L33 33 M67 67 L74 74 M26 74 L33 67 M67 33 L74 26" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span className="rune-icon">⚔</span>
          </div>
          <h1 className="auth-title">WC3 Cast Overlay</h1>
          <p className="auth-subtitle">Professional casting tools for Warcraft III</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              name="email"
              type="email"
              required
              className="auth-input"
              placeholder="caster@azeroth.com"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              name="password"
              type="password"
              required
              className="auth-input"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <input name="flow" type="hidden" value={flow} />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              flow === "signIn" ? "Enter the Arena" : "Create Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="auth-toggle"
          >
            {flow === "signIn" ? "New caster? Create account" : "Already have an account? Sign in"}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            onClick={() => signIn("anonymous")}
            className="auth-guest"
          >
            Continue as Guest
          </button>
        </div>
      </div>

      <footer className="app-footer">
        Requested by @web-user · Built by @clonkbot
      </footer>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-container">
      <div className="loading-rune">
        <svg viewBox="0 0 100 100" className="loading-svg">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="rotate-reverse"/>
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        </svg>
      </div>
      <p className="loading-text">Summoning the overlay...</p>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [overlaySessionId, setOverlaySessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const overlay = params.get("overlay");
    if (overlay) {
      setIsOverlayMode(true);
      setOverlaySessionId(overlay);
    }
  }, []);

  if (isOverlayMode && overlaySessionId) {
    return <OverlayView sessionId={overlaySessionId} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <Dashboard />;
}
