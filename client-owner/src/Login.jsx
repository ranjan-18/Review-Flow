import React, { useState } from 'react';
import { QrCode, Lock, User, AlertCircle, Loader } from 'lucide-react';
import { api } from './api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(username, password);
      if (response.success) {
        onLoginSuccess(response.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-view-wrapper">
      {/* Background blobs for rich atmospheric layers */}
      <div className="blob-container" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: "hidden" }}>
        <div className="blob blob-1" style={{ backgroundColor: "#6366f1", filter: "blur(130px)", opacity: 0.15 }}></div>
        <div className="blob blob-2" style={{ backgroundColor: "#d946ef", filter: "blur(130px)", opacity: 0.12, animationDelay: "-3s" }}></div>
      </div>

      <div className="login-glass-card">
        <div className="login-brand-header">
          <div className="login-logo-aura">
            <QrCode size={28} color="white" />
          </div>
          <span className="login-subtitle">SaaS Admin Portal</span>
          <h2 className="login-title">ReviewFlow AI</h2>
        </div>

        {error && (
          <div style={{ display: "flex", gap: "0.5rem", background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.8rem", color: "var(--accent-danger)", alignItems: "center" }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="login-input-group">
            <label className="form-label" style={{ color: "var(--text-muted)", fontSize: "0.725rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input-field"
              />
            </div>
          </div>

          <div className="login-input-group">
            <label className="form-label" style={{ color: "var(--text-muted)", fontSize: "0.725rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
            style={{ marginTop: "0.5rem" }}
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" style={{ display: "inline-block" }} /> Authenticating...
              </>
            ) : (
              'Secure Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
