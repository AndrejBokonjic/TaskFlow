// ui/src/api/client.js
// POPRAVEK: VSI klici gredo skozi web-BFF (port 4000), ne direktno na mikroservise.
// To je pravilna arhitektura - UI ne sme poznati notranjih URL-ov mikroservisov.

const BFF_URL = process.env.REACT_APP_BFF_URL || 'http://localhost:4000';

async function req(path, options = {}) {
  const res = await fetch(`${BFF_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.detail || err.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

// Auth - gre na /api/auth/* -> BFF -> uporabniki:8000
export const register = (username, email, password) =>
  req('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) });

export const login = (username, password) =>
  req('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

// Users - gre na /api/users/* -> BFF -> uporabniki:8000
export const getUsers = () => req('/api/users');
export const getUser = (id) => req(`/api/users/${id}`);
export const updateUser = (id, data) =>
  req(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id) =>
  req(`/api/users/${id}`, { method: 'DELETE' });

// Projects - gre na /api/projects/* -> BFF -> projekti:3000
export const getProjects = () => req('/api/projects');
export const getProject = (id) => req(`/api/projects/${id}`);
export const createProject = (name, description, owner_id) =>
  req('/api/projects', { method: 'POST', body: JSON.stringify({ name, description, owner_id }) });
export const updateProject = (id, name, description) =>
  req(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify({ name, description }) });
export const deleteProject = (id) =>
  req(`/api/projects/${id}`, { method: 'DELETE' });
export const addMember = (projectId, userId, role = 'member') =>
  req(`/api/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ user_id: userId, role }) });
export const removeMember = (projectId, userId) =>
  req(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' });

// Tasks - gre na /api/tasks/* -> BFF -> naloge:5001
export const getTasks = (projectId) =>
  req(`/api/tasks${projectId ? `?project_id=${projectId}` : ''}`);
export const getTask = (id) => req(`/api/tasks/${id}`);
export const createTask = (data) =>
  req('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
export const updateTask = (id, data) =>
  req(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const setTaskStatus = (id, status) =>
  req(`/api/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteTask = (id) =>
  req(`/api/tasks/${id}`, { method: 'DELETE' });
