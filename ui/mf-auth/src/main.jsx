// mf-auth/src/main.jsx
// Auth mikrofrontend - prijava in registracija
// Eksportira single-spa lifecycle metode
import 'http://127.0.0.1:3002/@react-refresh';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const BFF = () => window.__taskflow__.BFF_URL;

async function req(path, options = {}) {
  const res = await fetch(`${BFF()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.detail || 'Napaka');
  return data;
}

const styles = `
  .auth-bg { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f1117; }
  .auth-card { background: #1e2130; border: 1px solid #2d3748; border-radius: 12px; padding: 2rem; width: 100%; max-width: 400px; }
  .auth-logo { font-size: 1.8rem; font-weight: 700; color: #6366f1; text-align: center; margin-bottom: 1.5rem; letter-spacing: -0.5px; }
  .auth-badge { text-align: center; margin-bottom: 1.5rem; }
  .auth-badge span { background: #312e81; color: #a5b4fc; font-size: 0.7rem; padding: 3px 10px; border-radius: 20px; }
  .auth-tabs { display: flex; gap: 0; margin-bottom: 1.5rem; border-radius: 8px; overflow: hidden; border: 1px solid #2d3748; }
  .auth-tabs button { flex: 1; padding: 0.6rem; border: none; background: transparent; color: #64748b; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
  .auth-tabs button.active { background: #6366f1; color: white; }
  .auth-form label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; margin-top: 12px; }
  .auth-form input { width: 100%; padding: 0.6rem 0.8rem; background: #0f1117; border: 1px solid #2d3748; border-radius: 6px; color: #e2e8f0; font-size: 0.95rem; outline: none; }
  .auth-form input:focus { border-color: #6366f1; }
  .auth-error { color: #f87171; font-size: 0.85rem; margin-top: 10px; }
  .btn-primary { width: 100%; margin-top: 1.2rem; padding: 0.7rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; font-weight: 500; }
  .btn-primary:hover { background: #4f46e5; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
`;

function AuthApp() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await req('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
        });
      }
      const res = await req('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      window.__taskflow__.setUser({ id: res.user_id, username: res.username });
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-bg">
        <div className="auth-card">
          <h1 className="auth-logo">TaskFlow</h1>
          <div className="auth-badge"><span>🔐 Auth Mikrofrontend</span></div>
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Prijava</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Registracija</button>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label>Uporabniško ime</label>
            <input name="username" value={form.username} onChange={handle} required autoFocus />
            {mode === 'register' && (
              <>
                <label>E-pošta</label>
                <input name="email" type="email" value={form.email} onChange={handle} required />
              </>
            )}
            <label>Geslo</label>
            <input name="password" type="password" value={form.password} onChange={handle} required />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Nalaganje…' : mode === 'login' ? 'Prijava' : 'Registracija'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// single-spa lifecycle
let root = null;

export function bootstrap() {
  return Promise.resolve();
}

export function mount({ domElement }) {
  root = createRoot(domElement || document.getElementById('mf-root'));
  root.render(React.createElement(AuthApp));
  return Promise.resolve();
}

export function unmount() {
  if (root) {
    root.unmount();
    root = null;
  }
  return Promise.resolve();
}
