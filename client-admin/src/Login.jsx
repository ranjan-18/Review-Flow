import React, { useState } from 'react';
import { QrCode, Lock, User, AlertCircle, Loader, HelpCircle, CheckCircle2, X } from 'lucide-react';
import { api } from './api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(username, password);
      if (response && response.success) {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
        }
        onLoginSuccess(response.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg('');
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await api.forgotPassword(forgotInput);
      if (res?.success) {
        setForgotMsg(res.message);
      } else {
        setForgotError(res?.error || 'Failed to submit recovery request');
      }
    } catch (err) {
      setForgotError(err.message || 'Connection error. Please try again.');
    } finally {
      setForgotLoading(false);
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
          <span className="login-subtitle">SaaS Admin &amp; Owner Portal</span>
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
              Username / Account ID
            </label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
              <input
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input-field"
              />
            </div>
          </div>

          <div className="login-input-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" style={{ color: "var(--text-muted)", fontSize: "0.725rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Password
              </label>
              <button 
                type="button" 
                onClick={() => { setShowForgotModal(true); setForgotMsg(''); setForgotError(''); setForgotInput(''); }} 
                style={{ background: "none", border: "none", color: "#818cf8", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600, padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
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

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div className="modal-content glassmorphism animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ width: "90%", maxWidth: "420px", padding: "1.75rem", borderRadius: "20px", position: "relative", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <HelpCircle size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>Reset Password</h3>
              </div>
              <button 
                onClick={() => setShowForgotModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {forgotMsg ? (
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "1rem", borderRadius: "12px", textAlign: "center" }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 0.5rem auto", display: "block" }} />
                <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", margin: 0 }}>{forgotMsg}</p>
                <button 
                  onClick={() => setShowForgotModal(false)}
                  className="btn btn-primary"
                  style={{ marginTop: "1rem", width: "100%" }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ fontSize: "0.825rem", color: "var(--text-muted)", margin: 0 }}>
                  Enter your Username or Shop Account ID. We will generate password recovery instructions for your account.
                </p>

                {forgotError && (
                  <div style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.75rem", color: "var(--accent-danger)" }}>
                    {forgotError}
                  </div>
                )}

                <div className="login-input-group">
                  <label className="form-label" style={{ color: "var(--text-muted)", fontSize: "0.725rem", fontWeight: 700, textTransform: "uppercase" }}>
                    Username or Shop Account ID
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. bistro, glow, or admin"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      className="login-input-field"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {forgotLoading ? 'Submitting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
