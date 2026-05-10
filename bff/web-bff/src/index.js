// bff/web-bff/src/index.js
// VZOREC: Vmesnik za preverjanje stanja (Health Check)
// GET /health vrne stanje vseh odvisnih storitev in odklopnikov

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const { clients, getBreakerStats } = require('./http');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// ── VZOREC: Vmesnik za preverjanje stanja ────────────────────────────
// Preveri dostopnost vseh storitev in vrne njihov status.
// Odklopniki so integrirani - pokažejo ali je storitev dostopna.
app.get('/health', async (req, res) => {
  const checks = await Promise.all([
    checkService('uporabniki', clients.users, '/health'),
    checkService('projekti', clients.projects, '/health'),
    checkService('naloge', clients.tasks, '/health'),
  ]);

  const allHealthy = checks.every(c => c.status === 'UP');
  const breakerStats = getBreakerStats();

  res.status(allHealthy ? 200 : 207).json({
    status: allHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    services: checks.reduce((acc, c) => ({ ...acc, [c.name]: c }), {}),
    circuit_breakers: {
      uporabniki: {
        state: clients.users._breaker.opened ? 'OPEN' :
               clients.users._breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
        stats: breakerStats.uporabniki,
      },
      projekti: {
        state: clients.projects._breaker.opened ? 'OPEN' :
               clients.projects._breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
        stats: breakerStats.projekti,
      },
      naloge: {
        state: clients.tasks._breaker.opened ? 'OPEN' :
               clients.tasks._breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
        stats: breakerStats.naloge,
      },
    },
  });
});

async function checkService(name, client, path) {
  try {
    await client.get(path);
    return { name, status: 'UP' };
  } catch {
    return { name, status: 'DOWN' };
  }
}
// ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Web BFF running on port ${PORT}`));
