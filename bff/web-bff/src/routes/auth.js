const router = require('express').Router();
const { clients, handle } = require('../http');

// POST /api/auth/register
router.post('/register', handle(async (req, res) => {
  const { data } = await clients.users.post('/auth/register', req.body);
  res.json(data);
}));

// POST /api/auth/login  — vrne user_id, username
router.post('/login', handle(async (req, res) => {
  const { data } = await clients.users.post('/auth/login', req.body);
  res.json(data);
}));

module.exports = router;
