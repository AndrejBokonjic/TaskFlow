import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import * as api from '../api/client';
import './Projects.css';

export default function ProjectsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
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
      await api.createProject(form.name, form.description, user.id);
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
      await api.deleteProject(id);
      setProjects(ps => ps.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <span className="topbar-logo">TaskFlow</span>
        <div className="topbar-right">
          <span className="topbar-user">{user.username}</span>
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
          <div className="empty-state">
            <p>Ni projektov. Ustvari prvega!</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map(p => (
              <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="project-card-header">
                  <span className="project-name">{p.name}</span>
                  <button className="btn-icon-danger" onClick={(e) => handleDelete(p.id, e)}>×</button>
                </div>
                <p className="project-desc">{p.description || <span className="muted">Brez opisa</span>}</p>
                <div className="project-meta">
                  <span className="meta-badge">ID lastnika: {p.owner_id}</span>
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
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required autoFocus
              />
              <label>Opis</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Prekliči</button>
                <button type="submit" className="btn-primary-sm" disabled={saving}>
                  {saving ? 'Shranjevanje…' : 'Ustvari'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
