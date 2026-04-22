const router = require('express').Router();
const { clients, handle } = require('../http');

// GET /api/users
router.get('/', handle(async (req, res) => {
  const { data } = await clients.users.get('/users');
  res.json(data);
}));

// GET /api/users/:id
router.get('/:id', handle(async (req, res) => {
  const { data } = await clients.users.get(`/users/${req.params.id}`);
  res.json(data);
}));

// PUT /api/users/:id
router.put('/:id', handle(async (req, res) => {
  const { data } = await clients.users.put(`/users/${req.params.id}`, req.body);
  res.json(data);
}));

// DELETE /api/users/:id
router.delete('/:id', handle(async (req, res) => {
  await clients.users.delete(`/users/${req.params.id}`);
  res.status(204).send();
}));

module.exports = router;
