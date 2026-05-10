// mf-projekti/src/main.jsx
// Projekti mikrofrontend - seznam in upravljanje projektov
import 'http://127.0.0.1:3003/@react-refresh';
import React, { useState, useEffect } from 'react';
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
  .mf-page { min-height: 100vh; background: #0f1117; color: #e2e8f0; }
  .topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; height: 56px; background: #1e2130; border-bottom: 1px solid #2d3748; }
  .topbar-logo { font-weight: 700; font-size: 1.2rem; color: #6366f1; }
  .topbar-badge { font-size: 0.7rem; background: #1e3a5f; color: #60a5fa; padding: 2px 8px; border-radius: 20px; margin-left: 8px; }
  .topbar-right { display: flex; align-items: center; gap: 1rem; }
  .topbar-user { color: #94a3b8; font-size: 0.9rem; }
  .btn-ghost { background: transparent; border: 1px solid #2d3748; color: #94a3b8; padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  .btn-ghost:hover { border-color: #6366f1; color: #a5b4fc; }
  .btn-primary-sm { background: #6366f1; color: white; border: none; padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; }
  .btn-primary-sm:hover { background: #4f46e5; }
  .btn-primary-sm:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-icon-danger { background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 1.1rem; padding: 0 4px; }
  .btn-icon-danger:hover { color: #f87171; }
  .main-content { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }
  .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
  .page-header h2 { font-size: 1.4rem; font-weight: 600; }
  .inline-error { color: #f87171; font-size: 0.9rem; margin-bottom: 1rem; }
  .muted { color: #64748b; font-size: 0.9rem; }
  .empty-state { text-align: center; padding: 4rem; color: #64748b; }
  .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
  .project-card { background: #1e2130; border: 1px solid #2d3748; border-radius: 10px; padding: 1.2rem; cursor: pointer; transition: border-color 0.2s, transform 0.1s; }
  .project-card:hover { border-color: #6366f1; transform: translateY(-2px); }
  .project-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.5rem; }
  .project-name { font-weight: 600; font-size: 1rem; color: #e2e8f0; }
  .project-desc { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; min-height: 2.5em; }
  .project-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; }
  .meta-badge { font-size: 0.75rem; color: #64748b; background: #0f1117; padding: 2px 8px; border-radius: 4px; }
  .meta-date { font-size: 0.75rem; color: #64748b; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal { background: #1e2130; border: 1px solid #2d3748; border-radius: 12px; padding: 1.5rem; width: 100%; max-width: 440px; }
  .modal h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; }
  .modal label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; margin-top: 12px; }
  .modal input, .modal textarea { width: 100%; padding: 0.6rem 0.8rem; background: #0f1117; border: 1px solid #2d3748; border-radius: 6px; color: #e2e8f0; font-size: 0.95rem; outline: none; resize: vertical; }
  .modal input:focus, .modal textarea:focus { border-color: #6366f1; }
  .modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.2rem; }
`;

function ProjectsApp() {
  const user = window.__taskflow__.getUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await req('/api/projects');
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await req('/api/projects', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, description: form.description, owner_id: user.id }),
      });
      setForm({ name: '', description: '' });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Izbriši projekt?')) return;
    try {
      await req(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(ps => ps.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const signOut = () => {
    window.__taskflow__.setUser(null);
    navigateTo('/');
  };

  return (
    <>
      <style>{styles}</style>
      <div className="mf-page">
        <header className="topbar">
          <span className="topbar-logo">TaskFlow <span className="topbar-badge">📁 Projekti MF</span></span>
          <div className="topbar-right">
            <span className="topbar-user">{user?.username}</span>
            <button className="btn-ghost" onClick={signOut}>Odjava</button>
          </div>
        </header>
        <main className="main-content">
          <div className="page-header">
            <h2>Projekti</h2>
            <button className="btn-primary-sm" onClick={() => setShowModal(true)}>+ Nov projekt</button>
          </div>
          {error && <p className="inline-error">{error}</p>}
          {loading ? (
            <p className="muted">Nalaganje…</p>
          ) : projects.length === 0 ? (
            <div className="empty-state"><p>Ni projektov. Ustvari prvega!</p></div>
          ) : (
            <div className="project-grid">
              {projects.map(p => (
                <div key={p.id} className="project-card" onClick={() => navigateTo(`/projects/${p.id}`)}>
                  <div className="project-card-header">
                    <span className="project-name">{p.name}</span>
                    <button className="btn-icon-danger" onClick={(e) => handleDelete(p.id, e)}>×</button>
                  </div>
                  <p className="project-desc">{p.description || <span className="muted">Brez opisa</span>}</p>
                  <div className="project-meta">
                    <span className="meta-badge">Lastnik: #{p.owner_id}</span>
                    {p.created_at && (
                      <span className="meta-date">{new Date(p.created_at).toLocaleDateString('sl-SI')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Nov projekt</h3>
              <form onSubmit={handleCreate}>
                <label>Ime projekta</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
                <label>Opis</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Prekliči</button>
                  <button type="submit" className="btn-primary-sm" disabled={saving}>{saving ? 'Shranjevanje…' : 'Ustvari'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

let root = null;

export function bootstrap() { return Promise.resolve(); }

export function mount({ domElement }) {
  root = createRoot(domElement || document.getElementById('mf-root'));
  root.render(React.createElement(ProjectsApp));
  return Promise.resolve();
}

export function unmount() {
  if (root) { root.unmount(); root = null; }
  return Promise.resolve();
}
