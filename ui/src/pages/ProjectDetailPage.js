import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import * as api from '../api/client';
import './ProjectDetail.css';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'V delu', DONE: 'Zaključeno' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [proj, taskList, userList] = await Promise.all([
        api.getProject(id),
        api.getTasks(id),
        api.getUsers(),
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

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await api.setTaskStatus(taskId, newStatus);
      setTasks(ts => ts.map(t => t.id === taskId ? updated : t));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newTask = await api.createTask({
        title: taskForm.title,
        description: taskForm.description,
        user_id: parseInt(taskForm.user_id) || user.id,
        project_id: parseInt(id),
      });
      setTasks(ts => [...ts, newTask]);
      setTaskForm({ title: '', description: '', user_id: '' });
      setShowTaskModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Izbriši nalogo?')) return;
    try {
      await api.deleteTask(taskId);
      setTasks(ts => ts.filter(t => t.id !== taskId));
      setActiveTask(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.addMember(id, parseInt(memberUserId));
      setProject(updated);
      setMemberUserId('');
      setShowMemberModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Odstrani člana?')) return;
    try {
      await api.removeMember(id, userId);
      setProject(p => ({ ...p, members: p.members.filter(m => m.user_id !== userId) }));
    } catch (err) {
      setError(err.message);
    }
  };

  const usernameFor = (userId) => users.find(u => u.id === userId)?.username || `#${userId}`;

  if (loading) return <div className="page"><div className="main-content"><p className="muted">Nalaganje…</p></div></div>;
  if (!project) return <div className="page"><div className="main-content"><p className="inline-error">Projekt ni najden.</p></div></div>;

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-left">
          <button className="btn-ghost" onClick={() => navigate('/projects')}>← Projekti</button>
          <span className="topbar-logo">{project.name}</span>
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
                <span className={`status-dot dot-${status}`} />
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
                        {STATUSES.filter(s => s !== status).map(s => (
                          <button
                            key={s}
                            className="btn-status-move"
                            title={`Premakni v ${STATUS_LABELS[s]}`}
                            onClick={() => handleStatusChange(task.id, s)}
                          >
                            {s === 'TODO' ? '←' : s === 'IN_PROGRESS' ? (status === 'TODO' ? '→' : '←') : '→'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {tasksByStatus(status).length === 0 && (
                  <p className="kanban-empty">Ni nalog</p>
                )}
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
              <input
                value={taskForm.title}
                onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                required autoFocus
              />
              <label>Opis</label>
              <textarea
                value={taskForm.description}
                onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
              <label>Dodeli uporabniku</label>
              <select
                value={taskForm.user_id}
                onChange={e => setTaskForm(f => ({ ...f, user_id: e.target.value }))}
              >
                <option value="">— jaz ({user.username}) —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowTaskModal(false)}>Prekliči</button>
                <button type="submit" className="btn-primary-sm" disabled={saving}>
                  {saving ? 'Shranjevanje…' : 'Ustvari'}
                </button>
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
              <select
                value={memberUserId}
                onChange={e => setMemberUserId(e.target.value)}
                required
              >
                <option value="">— izberi —</option>
                {users
                  .filter(u => !(project.members || []).find(m => m.user_id === u.id))
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
              </select>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowMemberModal(false)}>Prekliči</button>
                <button type="submit" className="btn-primary-sm" disabled={saving}>
                  {saving ? 'Dodajanje…' : 'Dodaj'}
                </button>
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
              <div><span className="meta-label">Status</span>
                <select
                  value={activeTask.status}
                  onChange={async e => {
                    const updated = await api.setTaskStatus(activeTask.id, e.target.value);
                    setTasks(ts => ts.map(t => t.id === activeTask.id ? updated : t));
                    setActiveTask(updated);
                  }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div><span className="meta-label">Dodeljena</span>
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
  );
}
