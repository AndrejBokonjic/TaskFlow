const axios = require('axios');

const USERS_URL = process.env.USERS_URL || 'http://localhost:8000';
const PROJECTS_URL = process.env.PROJECTS_URL || 'http://localhost:3000';
const TASKS_URL = process.env.TASKS_URL || 'http://localhost:5001';

const clients = {
  users: axios.create({ baseURL: USERS_URL, timeout: 5000 }),
  projects: axios.create({ baseURL: PROJECTS_URL, timeout: 5000 }),
  tasks: axios.create({ baseURL: TASKS_URL, timeout: 5000 }),
};

// propagate upstream errors with correct status code
const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    const status = err.response?.status || 502;
    const message = err.response?.data?.detail || err.response?.data?.error || err.message;
    res.status(status).json({ error: message });
  }
};

module.exports = { clients, handle };
