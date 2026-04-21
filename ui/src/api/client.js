const USERS_URL = process.env.REACT_APP_USERS_URL || 'http://localhost:8000';
const PROJECTS_URL = process.env.REACT_APP_PROJECTS_URL || 'http://localhost:3000';
const TASKS_URL = process.env.REACT_APP_TASKS_URL || 'http://localhost:5001';

async function req(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || err.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

// Auth
export const register = (username, email, password) =>
  req(`${USERS_URL}/auth/register`, { method: 'POST', body: JSON.stringify({ username, email, password }) });

export const login = (username, password) =>
  req(`${USERS_URL}/auth/login`, { method: 'POST', body: JSON.stringify({ username, password }) });

// Users
export const getUsers = () => req(`${USERS_URL}/users`);
export const getUser = (id) => req(`${USERS_URL}/users/${id}`);
export const updateUser = (id, data) =>
  req(`${USERS_URL}/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id) =>
  req(`${USERS_URL}/users/${id}`, { method: 'DELETE' });

// Projects
export const getProjects = () => req(`${PROJECTS_URL}/projects`);
export const getProject = (id) => req(`${PROJECTS_URL}/projects/${id}`);
export const createProject = (name, description, owner_id) =>
  req(`${PROJECTS_URL}/projects`, { method: 'POST', body: JSON.stringify({ name, description, owner_id }) });
export const updateProject = (id, name, description) =>
  req(`${PROJECTS_URL}/projects/${id}`, { method: 'PUT', body: JSON.stringify({ name, description }) });
export const deleteProject = (id) =>
  req(`${PROJECTS_URL}/projects/${id}`, { method: 'DELETE' });
export const addMember = (projectId, userId, role = 'member') =>
  req(`${PROJECTS_URL}/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ user_id: userId, role }) });
export const removeMember = (projectId, userId) =>
  req(`${PROJECTS_URL}/projects/${projectId}/members/${userId}`, { method: 'DELETE' });

// Tasks
export const getTasks = (projectId) =>
  req(`${TASKS_URL}/tasks${projectId ? `?project_id=${projectId}` : ''}`);
export const getTask = (id) => req(`${TASKS_URL}/tasks/${id}`);
export const createTask = (data) =>
  req(`${TASKS_URL}/tasks`, { method: 'POST', body: JSON.stringify(data) });
export const updateTask = (id, data) =>
  req(`${TASKS_URL}/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const setTaskStatus = (id, status) =>
  req(`${TASKS_URL}/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteTask = (id) =>
  req(`${TASKS_URL}/tasks/${id}`, { method: 'DELETE' });
