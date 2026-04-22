const router = require('express').Router();
const { clients, handle } = require('../http');

// GET /api/projects  — spletni odjemalec dobi projekta z tasks_count
router.get('/', handle(async (req, res) => {
  const { data: projects } = await clients.projects.get('/projects');

  // za vsak projekt pridobi število nalog (vzporedno)
  const enriched = await Promise.all(projects.map(async (p) => {
    try {
      const { data: tasks } = await clients.tasks.get(`/tasks?project_id=${p.id}`);
      return { ...p, tasks_count: tasks.length };
    } catch {
      return { ...p, tasks_count: 0 };
    }
  }));

  res.json(enriched);
}));

// GET /api/projects/:id  — projekt z nalogami in člani
router.get('/:id', handle(async (req, res) => {
  const [{ data: project }, { data: tasks }] = await Promise.all([
    clients.projects.get(`/projects/${req.params.id}`),
    clients.tasks.get(`/tasks?project_id=${req.params.id}`),
  ]);
  res.json({ ...project, tasks });
}));

// POST /api/projects
router.post('/', handle(async (req, res) => {
  const { data } = await clients.projects.post('/projects', req.body);
  res.status(201).json(data);
}));

// PUT /api/projects/:id
router.put('/:id', handle(async (req, res) => {
  const { data } = await clients.projects.put(`/projects/${req.params.id}`, req.body);
  res.json(data);
}));

// DELETE /api/projects/:id
router.delete('/:id', handle(async (req, res) => {
  await clients.projects.delete(`/projects/${req.params.id}`);
  res.status(204).send();
}));

// POST /api/projects/:id/members
router.post('/:id/members', handle(async (req, res) => {
  const { data } = await clients.projects.post(`/projects/${req.params.id}/members`, req.body);
  res.json(data);
}));

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', handle(async (req, res) => {
  await clients.projects.delete(`/projects/${req.params.id}/members/${req.params.userId}`);
  res.status(204).send();
}));

module.exports = router;
