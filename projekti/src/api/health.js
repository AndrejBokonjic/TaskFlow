// projekti/src/api/health.js
// VZOREC: Vmesnik za preverjanje stanja (Health Check)

const router = require('express').Router();
const { pool } = require('../infrastruktura/database');
const axios = require('axios');

router.get('/health', async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkNaloge(),
  ]);

  const dbCheck = checks[0];
  const nalogeCheck = checks[1];
  const allUp = checks.every(c => c.status === 'UP');

  res.status(allUp ? 200 : 207).json({
    status: allUp ? 'UP' : 'DEGRADED',
    service: 'projekti',
    dependencies: {
      database: dbCheck.status,
      naloge: nalogeCheck.status,
    },
  });
});

async function checkDatabase() {
  try {
    await pool.query('SELECT 1');
    return { status: 'UP' };
  } catch (e) {
    return { status: `DOWN: ${e.message}` };
  }
}

async function checkNaloge() {
  try {
    const url = process.env.NALOGE_URL || 'http://localhost:5001';
    await axios.get(`${url}/health`, { timeout: 2000 });
    return { status: 'UP' };
  } catch (e) {
    return { status: `DOWN: ${e.message}` };
  }
}

module.exports = router;
