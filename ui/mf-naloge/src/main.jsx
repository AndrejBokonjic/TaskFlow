// mf-naloge/src/main.jsx
import 'http://127.0.0.1:3004/@react-refresh';
// Naloge mikrofrontend - Kanban board za naloge projekta
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

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'V delu', DONE: 'Zaključeno' };
const STATUS_COLORS = { TODO: '#6366f1', IN_PROGRESS: '#f59e0b', DONE: '#10b981' };

const styles = `
  .mf-page { min-height: 100vh; background: #0f1117; color: #e2e8f0; }
  .topbar { display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; height: 56px; background: #1e2130; border-bottom: 1px solid #2d3748; }
  .topbar-logo { font-weight: 700; font-size: 1.1rem; color: #e2e8f0; }
  .topbar-badge { font-size: 0.7rem; background: #1e3a2f; color: #34d399; padding: 2px 8px; border-radius: 20px; margin-left: 8px; }
  .topbar-right { display: flex; align-items: center; gap: 0.5rem; }
  .btn-ghost { background: transparent; border: 1px solid #2d3748; color: #94a3b8; padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  .btn-ghost:hover { border-color: #6366f1; color: #a5b4fc; }
  .btn-primary-sm { background: #6366f1; color: white; border: none; padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500; }
  .btn-primary-sm:hover { background: #4f46e5; }
  .btn-primary-sm:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-danger { background: #7f1d1d; color: #fca5a5; border: none; padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  .btn-danger:hover { background: #991b1b; }
  .btn-icon-danger { background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 1.1rem; }
  .btn-icon-danger:hover { color: #f87171; }
  .btn-status-move { background: #0f1117; border: 1px solid #2d3748; color: #64748b; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; }
  .btn-status-move:hover { border-color: #6366f1; color: #a5b4fc; }
  .main-content { padding: 1.5rem; }
  .main-content.wide { max-width: 1200px; margin: 0 auto; }
  .inline-error { color: #f87171; font-size: 0.9rem; margin-bottom: 1rem; }
  .muted { color: #64748b; }
  .project-description { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; }
  .kanban { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
  .kanban-col { background: #1a1d2e; border: 1px solid #2d3748; border-radius: 10px; padding: 1rem; }
  .kanban-col-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
  .status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .dot-TODO { background: #6366f1; }
  .dot-IN_PROGRESS { background: #f59e0b; }
  .dot-DONE { background: #10b981; }
  .kanban-col-title { font-weight: 600; font-size: 0.9rem; flex: 1; }
  .kanban-count { background: #0f1117; color: #64748b; font-size: 0.75rem; padding: 1px 7px; border-radius: 10px; }
  .kanban-cards { display: flex; flex-direction: column; gap: 0.6rem; min-height: 60px; }
  .kanban-empty { color: #64748b; font-size: 0.8rem; text-align: center; padding: 1rem 0; }
  .task-card { background: #1e2130; border: 1px solid #2d3748; border-radius: 8px; padding: 0.8rem; cursor: pointer; transition: border-color 0.15s; }
  .task-card:hover { border-color: #6366f1; }
  .task-title { font-weight: 500; font-size: 0.9rem; margin-bottom: 4px; }
  .task-desc { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .task-footer { display: flex; align-items: center; justify-content: space-between; }
  .task-assignee { font-size: 0.75rem; color: #64748b; background: #0f1117; padding: 2px 7px; border-radius: 4px; }
  .task-actions { display: flex; gap: 3px; }
  .members-section h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.8rem; }
  .members-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .member-row { display: flex; align-items: center; gap: 0.5rem; background: #1e2130; border: 1px solid #2d3748; padding: 0.5rem 0.8rem; border-radius: 8px; }
  .member-avatar { width: 28px; height: 28px; background: #312e81; color: #a5b4fc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; }
  .member-name { font-size: 0.85rem; }
  .role-badge { font-size: 0.7rem; padding: 2px 7px; border-radius: 10px; }
  .role-owner { background: #3b1f0e; color: #fb923c; }
  .role-member { background: #1e3a5f; color: #60a5fa; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal { background: #1e2130; border: 1px solid #2d3748; border-radius: 12px; padding: 1.5rem; width: 100%; max-width: 440px; }
  .modal h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; }
  .modal label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px; margin-top: 12px; }
  .modal input, .modal textarea, .modal select { width: 100%; padding: 0.6rem 0.8rem; background: #0f1117; border: 1px solid #2d3748; border-radius: 6px; color: #e2e8f0; font-size: 0.95rem; outline: none; resize: vertical; }
  .modal input:focus, .modal textarea:focus, .modal select:focus { border-color: #6366f1; }
  .modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.2rem; }
  .task-detail-desc { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem; }
  .task-detail-meta { display: flex; flex-direction: column; gap: 0.7rem; margin-bottom: 1rem; }
  .task-detail-meta > div { display: flex; align-items: center; gap: 0.7rem; }
  .meta-label { font-size: 0.8rem; color: #64748b; width: 80px; flex-shrink: 0; }
`;

function NalogeApp() {
  const user = window.__taskflow__.getUser();
  // Iz URL-a preberemo project ID
  const projectId = window.location.pathname.match(/\/projects\/(\d+)/)?.[1];

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', user_id: '' });
  const [memberUserId, setMemberUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    if (projectId) loadAll();
  }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [proj, taskList, userList] = await Promise.all([
        req(`/api/projects/${projectId}`),
        req(`/api/tasks?project_id=${projectId}`),
        req('/api/users'),
      ]);
      setProject(proj);
      setTasks(taskList);
      setUsers(userList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_MAP = { 0: 'TODO', 1: 'IN_PROGRESS', 2: 'DONE', 'TODO': 'TODO', 'IN_PROGRESS': 'IN_PROGRESS', 'DONE': 'DONE' };

  const tasksByStatus = (status) => tasks.filter(t => STATUS_MAP[t.status] === status);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await req(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setTasks(ts => ts.map(t => t.id === taskId ? updated : t));
    } catch (err) { setError(err.message); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newTask = await req('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          user_id: parseInt(taskForm.user_id) || user.id,
          project_id: parseInt(projectId),
        }),
      });
      setTasks(ts => [...ts, newTask]);
      setTaskForm({ title: '', description: '', user_id: '' });
      setShowTaskModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Izbriši nalogo?')) return;
    try {
      await req(`/api/tasks/${taskId}`, { method: 'DELETE' });
      setTasks(ts => ts.filter(t => t.id !== taskId));
      setActiveTask(null);
    } catch (err) { setError(err.message); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await req(`/api/projects/${projectId}/members`, {
        method: 'POST',
        body: JSON.stringify({ user_id: parseInt(memberUserId), role: 'member' }),
      });
      setProject(updated);
      setMemberUserId('');
      setShowMemberModal(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Odstrani člana?')) return;
    try {
      await req(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
      setProject(p => ({ ...p, members: p.members.filter(m => m.user_id !== userId) }));
    } catch (err) { setError(err.message); }
  };

  const usernameFor = (userId) => users.find(u => u.id === userId)?.username || `#${userId}`;

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="mf-page"><div className="main-content"><p className="muted">Nalaganje…</p></div></div>
    </>
  );

  if (!project) return (
    <>
      <style>{styles}</style>
      <div className="mf-page"><div className="main-content"><p className="inline-error">Projekt ni najden.</p></div></div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="mf-page">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-ghost" onClick={() => navigateTo('/projects')}>← Projekti</button>
            <span className="topbar-logo">{project.name} <span className="topbar-badge">✅ Naloge MF</span></span>
          </div>
          <div className="topbar-right">
            <button className="btn-primary-sm" onClick={() => setShowTaskModal(true)}>+ Naloga</button>
            <button className="btn-ghost" onClick={() => setShowMemberModal(true)}>Člani</button>
          </div>
        </header>

        <main className="main-content wide">
          {error && <p className="inline-error">{error}</p>}
          {project.description && <p className="project-description">{project.description}</p>}

          <div className="kanban">
            {STATUSES.map(status => (
              <div key={status} className="kanban-col">
                <div className="kanban-col-header">
                  <span className="status-dot" style={{ background: STATUS_COLORS[status] }} />
                  <span className="kanban-col-title">{STATUS_LABELS[status]}</span>
                  <span className="kanban-count">{tasksByStatus(status).length}</span>
                </div>
                <div className="kanban-cards">
                  {tasksByStatus(status).map(task => (
                    <div key={task.id} className="task-card" onClick={() => setActiveTask(task)}>
                      <p className="task-title">{task.title}</p>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      <div className="task-footer">
                        <span className="task-assignee">{usernameFor(task.user_id)}</span>
                        <div className="task-actions" onClick={e => e.stopPropagation()}>
                          {status !== 'TODO' && (
                            <button className="btn-status-move"
                              title="Nazaj"
                              onClick={() => {
                                const prev = STATUSES[STATUSES.indexOf(status) - 1];
                                handleStatusChange(task.id, prev);
                              }}>←</button>
                          )}
                          {status !== 'DONE' && (
                            <button className="btn-status-move"
                              title="Naprej"
                              onClick={() => {
                                const next = STATUSES[STATUSES.indexOf(status) + 1];
                                handleStatusChange(task.id, next);
                              }}>→</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {tasksByStatus(status).length === 0 && <p className="kanban-empty">Ni nalog</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="members-section">
            <h3>Člani projekta</h3>
            <div className="members-list">
              {(project.members || []).map(m => (
                <div key={m.user_id} className="member-row">
                  <div className="member-avatar">{usernameFor(m.user_id).slice(0, 2).toUpperCase()}</div>
                  <span className="member-name">{usernameFor(m.user_id)}</span>
                  <span className={`role-badge role-${m.role}`}>{m.role}</span>
                  {m.role !== 'owner' && (
                    <button className="btn-icon-danger" onClick={() => handleRemoveMember(m.user_id)}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        {showTaskModal && (
          <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Nova naloga</h3>
              <form onSubmit={handleCreateTask}>
                <label>Naslov</label>
                <input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} required autoFocus />
                <label>Opis</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                <label>Dodeli uporabniku</label>
                <select value={taskForm.user_id} onChange={e => setTaskForm(f => ({ ...f, user_id: e.target.value }))}>
                  <option value="">— jaz ({user?.username}) —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowTaskModal(false)}>Prekliči</button>
                  <button type="submit" className="btn-primary-sm" disabled={saving}>{saving ? 'Shranjevanje…' : 'Ustvari'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMemberModal && (
          <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Dodaj člana</h3>
              <form onSubmit={handleAddMember}>
                <label>Izberi uporabnika</label>
                <select value={memberUserId} onChange={e => setMemberUserId(e.target.value)} required>
                  <option value="">— izberi —</option>
                  {users.filter(u => !(project.members || []).find(m => m.user_id === u.id))
                    .map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowMemberModal(false)}>Prekliči</button>
                  <button type="submit" className="btn-primary-sm" disabled={saving}>{saving ? 'Dodajanje…' : 'Dodaj'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTask && (
          <div className="modal-overlay" onClick={() => setActiveTask(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>{activeTask.title}</h3>
              <p className="task-detail-desc">{activeTask.description || <span className="muted">Brez opisa</span>}</p>
              <div className="task-detail-meta">
                <div>
                  <span className="meta-label">Status</span>
                  <select value={activeTask.status} onChange={async e => {
                    const updated = await req(`/api/tasks/${activeTask.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) });
                    setTasks(ts => ts.map(t => t.id === activeTask.id ? updated : t));
                    setActiveTask(updated);
                  }}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <span className="meta-label">Dodeljena</span>
                  <span>{usernameFor(activeTask.user_id)}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-danger" onClick={() => handleDeleteTask(activeTask.id)}>Izbriši</button>
                <button className="btn-ghost" onClick={() => setActiveTask(null)}>Zapri</button>
              </div>
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
  root.render(React.createElement(NalogeApp));
  return Promise.resolve();
}

export function unmount() {
  if (root) { root.unmount(); root = null; }
  return Promise.resolve();
}