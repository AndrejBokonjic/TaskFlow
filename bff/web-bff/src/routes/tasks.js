const router = require('express').Router();
const { clients, handle } = require('../http');

// GET /api/tasks?project_id=&user_id=
router.get('/', handle(async (req, res) => {
  const { data } = await clients.tasks.get('/tasks', { params: req.query });
  res.json(data);
}));

// GET /api/tasks/:id
router.get('/:id', handle(async (req, res) => {
  const { data } = await clients.tasks.get(`/tasks/${req.params.id}`);
  res.json(data);
}));

// POST /api/tasks
router.post('/', handle(async (req, res) => {
  const { data } = await clients.tasks.post('/tasks', req.body);
  res.status(201).json(data);
}));

// PUT /api/tasks/:id
router.put('/:id', handle(async (req, res) => {
  const { data } = await clients.tasks.put(`/tasks/${req.params.id}`, req.body);
  res.json(data);
}));

// PATCH /api/tasks/:id/status
router.patch('/:id/status', handle(async (req, res) => {
  const { data } = await clients.tasks.patch(`/tasks/${req.params.id}/status`, req.body);
  res.json(data);
}));

// DELETE /api/tasks/:id
router.delete('/:id', handle(async (req, res) => {
  await clients.tasks.delete(`/tasks/${req.params.id}`);
  res.status(204).send();
}));

module.exports = router;
